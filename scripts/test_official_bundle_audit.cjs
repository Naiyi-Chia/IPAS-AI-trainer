// Negative controls for the official-source regression gate.
// node scripts/test_official_bundle_audit.cjs INPUT_DIR
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
const {audit}=require('./audit_official_pdf.cjs');
(async()=>{
 const dir=path.resolve(process.argv[2]||'tmp/official-audit');
 const scratch=fs.mkdtempSync(path.join(os.tmpdir(),'ipas-bundle-negative-'));
 const original=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/official-past-papers.json'),'utf8'));
 try{
  const mutations={
   answer:b=>b.papers[0].questions[0].answer='A',
   identity:b=>b.papers[0].questions.reverse(),
   wording:b=>b.papers[0].questions[0].question_text+='changed',
   knownException:b=>b.papers.find(p=>p.paper_id==='114-2-L23').questions[44].options.A+='changed',
   visual:b=>b.papers.find(p=>p.questions.some(q=>q.has_visual)).questions.find(q=>q.has_visual).visual_assets=[],
   session:b=>b.papers.find(p=>p.paper_id==='115-2-L11').session='第二梯次',
   sharedText:b=>b.shared_contexts['114-2-L22_q43-47_shared'].text+='changed',
   sharedPage:b=>b.shared_contexts['114-2-L22_q43-47_shared'].source_page_start=1,
   sharedAssets:b=>b.shared_contexts['114-2-L22_q43-47_shared'].visual_assets=[],
   missingContext:b=>delete b.shared_contexts['114-2-L22_q43-47_shared'],
   wrongContext:b=>b.papers.find(p=>p.paper_id==='114-2-L22').questions[42].shared_context_id='115-1-L22_q41-44_shared'
  };
  for(const [name,mutate] of Object.entries(mutations)){
   const b=structuredClone(original);mutate(b);const file=path.join(scratch,name+'.json');fs.writeFileSync(file,JSON.stringify(b));
   await assert.rejects(audit(dir,file),undefined,`${name}: mutation escaped audit`);
  }
  // A changed official PDF must fail before extraction, even if bundle is unchanged.
  fs.copyFileSync(path.join(dir,'pdf.js'),path.join(scratch,'pdf.js'));
  fs.writeFileSync(path.join(scratch,original.papers[0].paper_id+'.pdf'),'%PDF-changed');
  await assert.rejects(audit(scratch),/PDF changed/);
  console.log('PASS: answer/identity/text/visual/session/PDF drift and shared text/pages/assets/missing/wrong group rejected');
 }finally{
  const relative=path.relative(path.resolve(os.tmpdir()),path.resolve(scratch));
  assert(relative&&!relative.startsWith('..')&&!path.isAbsolute(relative));
  fs.rmSync(scratch,{recursive:true,force:true});
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
