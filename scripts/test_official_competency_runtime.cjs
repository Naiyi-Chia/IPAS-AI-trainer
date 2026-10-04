// Issue #103: runtime contract, negative controls, and stable-ID compatibility.
// node scripts/test_official_competency_runtime.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const bundle=JSON.parse(fs.readFileSync(path.join(root,'data/official-past-papers.json'),'utf8'));
const DB=JSON.parse(fs.readFileSync(path.join(root,'data/practice-questions.json'),'utf8'));
function section(start,end){return html.slice(html.indexOf(start),html.indexOf(end));}
// Compile the entire inline application, in addition to executing the loader below.
for(const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(match[1]);
// Keep feedback extraction independent of the next function's name.
const feedback=html.slice(html.indexOf('function feedbackTopicLabel('),html.indexOf('\n}',html.indexOf('function feedbackTopicLabel('))+2);
function context(data){
  const ctx=vm.createContext({DB,officialPastBundle:null,officialPastBundlePromise:null,
    officialPastQuestionIndex:new Map(),OFFICIAL_PAST_BUNDLE_PATH:'bundle.json',
    bundledAssetUrl:p=>p,pastPaperMeta:{title:'Unrelated last-opened paper'},
    pastPapers:data.papers.map(p=>({id:p.paper_id,subject:p.subject,level:p.level,year:p.year,session:p.session,name:DB.subjects[p.subject].name})),
    fetch:async()=>({ok:true,json:async()=>data})});
  vm.runInContext(section('function cleanBundledOption(', 'async function getBundledPastPaper(')+feedback,ctx);
  return ctx;
}
async function run(){
  const ctx=context(bundle),snapshot=JSON.stringify(bundle);
  await ctx.loadOfficialPastBundle();
  assert.equal(ctx.officialPastQuestionIndex.size,700);
  for(const p of bundle.papers)for(const q of p.questions){
    const id=`PAST-${p.paper_id}-${q.question_no}`,runtime=ctx.officialPastQuestionIndex.get(id);
    assert.equal(runtime.topic,q.competency_topic);
    assert.equal(runtime.topicName,DB.topics[q.competency_topic]);
    assert.equal(runtime.question,q.question_text);
    assert.equal(runtime.answer,'ABCD'.indexOf(q.answer));
    assert.deepEqual(Array.from(runtime.options),(Object.entries(q.options).map(([letter,value])=>ctx.cleanBundledOption(value,letter))));
    assert.equal(runtime.sourcePageStart,q.source_page_start);
    assert.equal(runtime.sourcePageEnd,q.source_page_end);
    assert.deepEqual(Array.from(runtime.visualAssets),q.visual_assets);
    assert.equal(runtime.sharedContextId,q.shared_context_id);
    assert.equal(ctx.feedbackTopicLabel(runtime,'官方考古題'),`${runtime.paperTitle}｜第 ${q.question_no} 題`);
  }
  assert.equal(JSON.stringify(bundle),snapshot,'loading never rewrites canonical content');
  assert.equal(await ctx.loadOfficialPastBundle(),bundle,'cached loading');
  // Stored subject/topic fields are legacy display metadata; classification resolves by stable ID.
  const legacy={'PAST-115-3-L12-1':{correct:false,last:42,subject:'PAST',topic:'115 年 第三次'}};
  const before=JSON.stringify(legacy);
  const resolved=Object.keys(legacy).map(id=>ctx.officialPastQuestionIndex.get(id));
  assert.equal(resolved[0].topic,bundle.papers.find(p=>p.paper_id==='115-3-L12').questions[0].competency_topic);
  assert.equal(JSON.stringify(legacy),before,'no progress migration');
  const cases={
    oldSchema:b=>b.schema_version=3,
    missingSourceStatus:b=>delete b.source.competency_mapping_status,
    missingTopic:q=>delete q.competency_topic,
    invalidTopic:q=>q.competency_topic='L99999',
    crossSubject:q=>q.competency_topic='L12101',
    unverified:q=>q.competency_mapping_status='unverified',
    needsReview:q=>q.competency_mapping_status='needs_review',
    missingStatus:q=>delete q.competency_mapping_status,
    missingNote:q=>delete q.competency_mapping_note,
    invalidNote:q=>q.competency_mapping_note=null,
  };
  for(const [name,mutate] of Object.entries(cases)){
    const data=structuredClone(bundle);
    // Mutate a late L11 row so earlier valid rows cannot leak through the rejected load.
    const q=data.papers.find(p=>p.paper_id==='115-3-L11').questions[49];
    mutate(name==='oldSchema'||name==='missingSourceStatus'?data:q);
    const negative=context(data);
    await assert.rejects(negative.loadOfficialPastBundle(),undefined,name);
    assert.equal(negative.officialPastQuestionIndex.size,0,name+' partial index');
    assert.equal(negative.officialPastBundle,null,name+' partial bundle');
  }
  console.log('PASS: full JS syntax; 700 runtime mappings/content/scoring/provenance; paper feedback; stable-ID progress; 10 negative loader controls with atomic rejection.');
}
run().catch(e=>{console.error(e);process.exitCode=1;});
