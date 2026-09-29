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
   knownException:b=>b.papers.find(p=>p.paper_id==='115-1-L22').questions[43].question_text+='changed',
   visual:b=>b.papers.find(p=>p.questions.some(q=>q.has_visual)).questions.find(q=>q.has_visual).visual_assets=[],
   session:b=>b.papers.find(p=>p.paper_id==='115-2-L11').session='第二梯次'
  };
  for(const [name,mutate] of Object.entries(mutations)){
   const b=structuredClone(original);mutate(b);const file=path.join(scratch,name+'.json');fs.writeFileSync(file,JSON.stringify(b));
   await assert.rejects(audit(dir,file),undefined,`${name}: mutation escaped audit`);
  }
  // A changed official PDF must fail before extraction, even if bundle is unchanged.
  fs.copyFileSync(path.join(dir,'pdf.js'),path.join(scratch,'pdf.js'));
  fs.writeFileSync(path.join(scratch,original.papers[0].paper_id+'.pdf'),'%PDF-changed');
  await assert.rejects(audit(scratch),/PDF changed/);
  console.log('PASS: answer, identity, wording, known exception, visual, session and PDF drift are rejected');
 }finally{
  const relative=path.relative(path.resolve(os.tmpdir()),path.resolve(scratch));
  assert(relative&&!relative.startsWith('..')&&!path.isAbsolute(relative));
  fs.rmSync(scratch,{recursive:true,force:true});
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
