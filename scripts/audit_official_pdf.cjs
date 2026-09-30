// Ingest/regression tooling only; no runtime PDF parser or mirror dependency.
// node scripts/audit_official_pdf.cjs INPUT_DIR [BUNDLE_JSON]
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const assert=require('node:assert/strict'),crypto=require('node:crypto');
const clean=require('./official_pdf_text.cjs');
const root=path.resolve(__dirname,'..');
const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
// Preserve punctuation/operators/case/digits; normalize glyph spacing and option separators.
const normalize=s=>s.normalize('NFKC').replace(/\s/g,'').replace(/[;；]+$/,'');
const fields=q=>[q.question_text,...Object.entries(q.options).map(([l,s])=>s.replace(new RegExp('^[（(]'+l+'[）)]\\s*'),''))];
async function extract(pdfjs,buffer){
  const pdf=await pdfjs.getDocument({data:new Uint8Array(buffer),verbosity:0}).promise,pages=[];
  for(let n=1;n<=pdf.numPages;n++){
    const tc=await(await pdf.getPage(n)).getTextContent();let text='',y=null;
    for(const item of tc.items){text+=(y!==null&&Math.abs(item.transform[5]-y)>3?'\n':' ')+item.str;y=item.transform[5];}
    pages.push(clean(text));
  }
  await pdf.destroy();
  const text=pages.join('\n');
  // Official PDFs include fullwidth answers and split digits such as "4 2.".
  const matches=[...text.matchAll(/(?:^|\n)\s*([ABCD])\s*((?:\d\s*){1,3})\.\s*/g)];
  const questions=matches.map((m,i)=>{
    const block=text.slice(m.index+m[0].length,matches[i+1]?.index??text.length);
    const opts=[];
    for(const candidate of block.matchAll(/(?:^|[\s;])\(\s*([ABCD])\s*\)/g)){
      if(candidate[1]==='ABCD'[opts.length])opts.push(candidate);
    }
    return {number:Number(m[2].replace(/\s/g,'')),answer:m[1],
      fields:[block.slice(0,opts[0]?.index??block.length),...opts.slice(0,4).map((o,j)=>block.slice(o.index+o[0].length,opts[j+1]?.index??block.length))],
      sourcePage:pages.findIndex((_,pn)=>pages.slice(0,pn+1).join('\n').length>=m.index+m[0].length)+1};
  });
  questions.pages=pages;
  return questions;
}
async function audit(dir,bundlePath=path.join(root,'data/official-past-papers.json')){
  const baseline=read(path.join(root,'docs/OFFICIAL_BUNDLE_SOURCE_BASELINE.json'));
  const bundle=read(bundlePath),manifest=read(path.join(root,'docs/OFFICIAL_VISUAL_ASSET_MANIFEST.json'));
  const sourceCSV=fs.readFileSync(path.join(root,'data/official-past-papers-source.csv'),'utf8').replace(/\r\n?/g,'\n');
  assert.equal(sha(sourceCSV),baseline.masterSnapshot.csvSha256,'canonical master snapshot drift');
  const pdfjs=require(path.join(dir,'pdf.js'));assert.equal(pdfjs.version,'3.11.174');
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),ctx=vm.createContext({});
  vm.runInContext(html.slice(html.indexOf('const OFFICIAL_PDF_BASE'),html.indexOf('const OFFICIAL_PAST_BUNDLE_PATH'))+
    html.slice(html.indexOf('const pastPapers'),html.indexOf('const state'))+
    html.slice(html.indexOf('function cleanBundledOption'),html.indexOf('async function loadOfficialPastBundle'))+'\nthis.papers=pastPapers;',ctx);
  assert.equal(bundle.schema_version,3);
  assert.equal(bundle.papers.length,14);assert.equal(ctx.papers.length,14);
  assert.equal(Object.keys(bundle.shared_contexts).length,12);
  const ids=[],used=new Set(),summary=[],assets=new Set(),groups=new Set();let matchedFields=0,visualRows=0,dependentRows=0;
  for(const p of bundle.papers){
    const paper=ctx.papers.find(x=>x.id===p.paper_id);assert(paper,`unknown paper ${p.paper_id}`);
    assert.equal(p.source_pdf_file,paper.file);assert.equal(p.session,paper.session,`${p.paper_id}: session`);
    assert.equal(p.source_pdf_file,baseline.papers[p.paper_id].source_pdf_file);
    assert.equal(String(p.year),paper.year);assert.equal(new URL(paper.pdf).hostname,'www.ipas.org.tw');
    const buffer=fs.readFileSync(path.join(dir,p.paper_id+'.pdf'));
    assert.equal(sha(buffer),baseline.papers[p.paper_id].pdfSha256,`${p.paper_id}: PDF changed; review required`);
    const official=await extract(pdfjs,buffer),numbers=Array.from({length:50},(_,i)=>i+1);
    assert.deepEqual(official.map(q=>q.number),numbers,`${p.paper_id}: official numbering`);
    assert.deepEqual(p.questions.map(q=>q.question_no),numbers);
    for(const [id,context] of Object.entries(bundle.shared_contexts).filter(([,c])=>c.paper_id===p.paper_id)){
      assert.equal(sha(JSON.stringify(context)),baseline.sharedContexts[id],`${id}: shared context drift`);
      assert(context.source_page_start>=1&&context.source_page_end>=context.source_page_start&&context.source_page_end<=official.pages.length);
      const source=normalize(official.pages.slice(context.source_page_start-1,context.source_page_end).join('\n'));
      assert(source.includes(normalize(context.text)),`${id}: shared text absent from official source pages`);
      const provenance=manifest.shared_contexts[id];assert(provenance,`${id}: shared provenance missing`);
      assert.equal(provenance.source_pdf_file,p.source_pdf_file);
      assert.equal(provenance.source_page_start,context.source_page_start);
      assert.equal(provenance.source_page_end,context.source_page_end);
      assert.deepEqual(context.visual_assets,provenance.assets.map(a=>a.asset_file));
    }
    let exceptions=0;
    for(const [i,q] of p.questions.entries()){
      const source=official[i],id=`PAST-${p.paper_id}-${source.number}`;ids.push(id);
      const runtime=ctx.bundledQuestionToRuntime(paper,q,bundle.shared_contexts);
      assert.equal(runtime.id,id,`${id}: runtime identity`);
      const shared=q.shared_context_id?bundle.shared_contexts[q.shared_context_id]:null;
      if(q.shared_context_id){
        dependentRows++;groups.add(q.shared_context_id);assert(shared&&shared.paper_id===p.paper_id,`${id}: invalid group`);
        assert.equal(runtime.sharedContext,shared,`${id}: runtime context resolution`);
      }
      const sharedAssets=shared?.visual_assets||[];
      assert(!q.visual_assets.some(a=>sharedAssets.includes(a)),`${id}: duplicated shared asset`);
      assert.equal(sha(JSON.stringify(q)),baseline.records[id],`${id}: canonical record drift`);
      assert.equal(q.verification_status,'verified');assert.equal(q.answer,source.answer,`${id}: official answer`);
      if(!(q.source_page_start<=source.sourcePage&&q.source_page_end>=source.sourcePage)){
        const provenance=baseline.pageExceptions[id];
        assert(provenance,`${id}: source page ${source.sourcePage} outside provenance`);
        assert.equal(source.sourcePage,provenance.questionPage);
        assert([...q.visual_assets,...sharedAssets].includes(provenance.manifestAsset),`${id}: missing shared-page provenance`);
      }
      if(q.has_visual){
        visualRows++;const row=manifest.rows.find(x=>x.paper_id===p.paper_id&&x.question_no===q.question_no);
        assert(row,`${id}: visual provenance`);assert.equal(row.source_pdf_file,p.source_pdf_file);
        assert.deepEqual(q.visual_assets,row.assets.map(x=>x.asset_file));
        assert.equal(q.shared_context_id,row.shared_context_id);
      }else assert.deepEqual(q.visual_assets,[]);
      assert.equal(q.has_visual,!!(q.visual_assets.length+sharedAssets.length),`${id}: visual flag`);
      for(const asset of [...q.visual_assets,...sharedAssets]){assets.add(asset);assert.equal(sha(fs.readFileSync(path.join(root,asset))),baseline.assets[asset],`${asset}: visual drift`);}
      fields(q).forEach((target,field)=>{
        const actual=normalize(source.fields[field]||''),expected=normalize(target),key=`${id}/${['stem','A','B','C','D'][field]}`;
        if(actual===expected){matchedFields++;return;}
        const exception=baseline.exceptions[key];assert(exception,`${key}: unrecorded source mismatch`);
        assert.equal(actual,exception.source,`${key}: source drift`);assert.equal(expected,exception.bundle,`${key}: text drift`);
        assert(exception.reason);used.add(key);exceptions++;
      });
    }
    summary.push({paper:p.paper_id,officialUrl:paper.pdf,pdfSha256:sha(buffer),questions:50,answersChecked:50,exceptionFields:exceptions});
  }
  assert.equal(new Set(ids).size,700);assert.deepEqual(ids,Object.keys(baseline.records),'canonical identity/order drift');
  assert.equal(visualRows,47);assert.equal(assets.size,63);
  assert.equal(dependentRows,36);assert.equal(groups.size,12);
  assert.deepEqual([...groups].sort(),Object.keys(baseline.sharedContexts).sort());
  assert.deepEqual([...used].sort(),Object.keys(baseline.exceptions).sort(),'stale exceptions');
  const result={status:'PASS (official source regression; visual/typography extraction limits recorded)',records:ids.length,matchedFields,exceptionFields:used.size,sharedContexts:groups.size,dependentRows,visualRows,assets:assets.size,summary};
  fs.writeFileSync(path.join(dir,'bundle-audit.json'),JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify(result,null,2));return result;
}
module.exports={extract,normalize,fields,sha,audit};
if(require.main===module)audit(path.resolve(process.argv[2]||'tmp/official-audit'),process.argv[3]).catch(e=>{console.error(e);process.exitCode=1;});
