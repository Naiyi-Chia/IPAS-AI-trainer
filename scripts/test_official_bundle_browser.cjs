// Optional browser QA: requires Playwright in NODE_PATH and installed Edge (or BROWSER_CHANNEL).
// node scripts/test_official_bundle_browser.cjs [SCREENSHOT_DIR]
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),out=process.argv[2];
const mime=file=>file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.json')?'application/json':file.endsWith('.png')?'image/png':'text/plain';
const seed={attempts:{},wrong:{'PAST-114-4-L11-50':true,'PAST-114-2-L23-49':true},bookmarks:{'PAST-114-4-L11-4':{note:'keep'}},examHistory:[{score:88,date:1}]};
for(const pid of ['114-4-L11','114-2-L23'])for(let n=1;n<=50;n++)seed.attempts[`PAST-${pid}-${n}`]={correct:n%2===0,last:n,metadata:{original:n}};
seed.attempts['PAST-115-2-L11-1']={correct:true,last:999,metadata:{keep:true}};
async function run(){
 const server=http.createServer((req,res)=>{
  const pathname=new URL(req.url,'http://localhost').pathname;
  const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':decodeURIComponent(pathname)));
  const relative=path.relative(root,file);
  if(relative.startsWith('..')||path.isAbsolute(relative)){res.writeHead(403);res.end();return;}
  try{res.setHeader('Content-Type',mime(file));res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end();}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 try{
  browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL||'msedge'});
  for(const width of [1280,375]){
   const context=await browser.newContext({viewport:{width,height:900}}),page=await context.newPage(),errors=[],external=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1'))external.push(r.url());});page.on('dialog',d=>d.accept());
   await page.addInitScript(seed=>{
    if(!sessionStorage.getItem('seeded')){localStorage.setItem('ipasAIState',JSON.stringify(seed));localStorage.setItem('ipasOfficialPastCacheV2','{"old":{"meta":{"contentVersion":1}}}');sessionStorage.setItem('seeded','1');}
   },seed);
   await page.goto(`http://127.0.0.1:${server.address().port}/`);
   await page.waitForFunction(()=>DB!==null);
   await page.evaluate(()=>loadOfficialPastBundle());
   const migrated=await page.evaluate(()=>({state,backup:JSON.parse(localStorage.getItem(PAST_MIGRATION_BACKUP_KEY)),cache:localStorage.getItem('ipasOfficialPastCacheV2')}));
   assert.deepEqual(migrated.backup,seed);assert.equal(migrated.cache,null);assert.deepEqual(migrated.state.examHistory,seed.examHistory);
   for(const [pid,map] of Object.entries(await page.evaluate(()=>PAST_PROGRESS_MIGRATIONS)))for(const [oldNo,newNo] of Object.entries(map))assert.deepEqual(migrated.state.attempts[`PAST-${pid}-${newNo}`],seed.attempts[`PAST-${pid}-${oldNo}`]);
   assert.deepEqual(migrated.state.attempts['PAST-115-2-L11-1'],seed.attempts['PAST-115-2-L11-1']);
   assert(migrated.state.wrong['PAST-114-4-L11-4']&&migrated.state.wrong['PAST-114-2-L23-40']);
   assert.deepEqual(migrated.state.bookmarks['PAST-114-4-L11-5'],{note:'keep'});
   await page.reload();assert.deepEqual(await page.evaluate(()=>state),migrated.state,'idempotent migration');
   await page.evaluate(()=>loadOfficialPastBundle());
   const result=await page.evaluate(async()=>{
    const check=(value,message)=>{if(!value)throw Error(message);};
    check(officialPastQuestionIndex.size===700,'canonical index');
    const legacy=JSON.stringify(state);
    const oldId='PAST-115-2-L11-1',oldQuestion=getQuestionById(oldId);
    check(oldQuestion.topic===oldQuestion.competency_topic&&oldQuestion.topicName===DB.topics[oldQuestion.topic],'stable-ID reclassification');
    switchPanel('stats');
    check(document.querySelector('#stats').textContent.includes(oldQuestion.topicName),'competency stats label');
    switchPanel('wrong');
    check(JSON.stringify(state)===legacy,'stats/wrong views preserve stored attempts');
    const weakBefore=[...weakTopicSet()];
    state.attempts[oldId].correct=!state.attempts[oldId].correct;
    check(JSON.stringify([...weakTopicSet()])===JSON.stringify(weakBefore),'official records do not alter self-authored weak practice');
    state.attempts[oldId].correct=!state.attempts[oldId].correct;
    for(const q of officialPastQuestionIndex.values())check(q.topic.startsWith(q.subject)&&q.topicName===DB.topics[q.topic],'valid runtime topic '+q.id);
    const dependents=[...officialPastQuestionIndex.values()].filter(q=>q.sharedContext);
    for(const q of dependents){
     // Open every dependent directly, with no first-group-question view prerequisite.
     switchPanel('past');pastPaperSet=[q];pastIndex=0;pastPaperMeta={title:q.paperTitle};pastAnswered=false;showPastQuizView();
     const shared=document.querySelector('#pastQuizArea .pastSharedContext');
     check(shared?.open&&shared.querySelector('pre').textContent===q.sharedContext.text,'direct context '+q.id);
     check(shared.querySelectorAll('img').length===q.sharedContext.visual_assets.length,'shared assets '+q.id);
     const images=[...document.querySelectorAll('#pastQuizArea img')].map(i=>i.src);check(new Set(images).size===images.length,'duplicate images '+q.id);
     state.wrong={[q.id]:true};await startWrongPractice();
     check(document.querySelector('#practiceArea .pastSharedContext pre')?.textContent===q.sharedContext.text,'wrong context '+q.id);
     check(document.documentElement.scrollWidth<=innerWidth,'wrong overflow '+q.id);
    }
    for(const paper of pastPapers){switchPanel('past');await loadPastPaperById(paper.id);check(pastPaperSet.length===50,'all-paper load');check(document.querySelector('#pastQuizArea').textContent.includes(pastPaperMeta.title),'paper title remains visible');}
    // Resume directly into Q44 after progress/stat entry, without visiting Q41.
    state.attempts={};for(let n=1;n<44;n++)state.attempts[`PAST-115-1-L22-${n}`]={correct:true,last:1};
    switchPanel('stats');switchPanel('past');await loadPastPaperById('115-1-L22');check(pastPaperSet[pastIndex].number===44,'resume target');
    check(document.querySelector('#pastQuizArea .pastSharedContext pre').textContent===pastPaperSet[pastIndex].sharedContext.text,'resume context');
    const q=pastPaperSet[pastIndex];answerPast((q.answer+1)%4);check(state.wrong[q.id]&&!state.attempts[q.id].correct,'wrong scoring');
    check(JSON.parse(localStorage.getItem('ipasAIState')).attempts[q.id].correct===false,'persistence');
    state.wrong={[q.id]:true};switchPanel('wrong');await startWrongPractice();answerPractice(q.answer);check(!state.wrong[q.id],'wrong re-practice scoring');
    switchPanel('practice');startPractice();answerPractice(practiceSet[0].answer);nextP();check(pIndex===1,'practice navigation');
    switchPanel('exam');startExam();examPick(examSet[0].answer);submitExam(true);renderExamReview();check(state.examHistory.length===2,'exam result');
    switchPanel('past');await loadPastPaperById('114-2-L23');pastIndex=44;renderPastQuiz();
    check(document.querySelector('.pastSharedContextText').textContent.includes('138,357,544'),'VGG full table retained');
    return {directContexts:dependents.length,wrongContexts:dependents.length,groups:new Set(dependents.map(q=>q.sharedContextId)).size};
   });
   await page.locator('#pastQuizArea .pastSharedContext img').first().scrollIntoViewIfNeeded();
   await page.waitForFunction(()=>[...document.querySelectorAll('#pastQuizArea .pastSharedContext img')].every(i=>i.complete&&i.naturalWidth>0));
   const disclosure=page.locator('#pastQuizArea .pastSharedContext summary');
   await disclosure.focus();await disclosure.press('Enter');
   assert.equal(await page.locator('#pastQuizArea .pastSharedContext').evaluate(el=>el.open),false);
   await disclosure.press('Enter');
   assert.equal(await page.locator('#pastQuizArea .pastSharedContext').evaluate(el=>el.open),true);
   if(out){fs.mkdirSync(out,{recursive:true});await page.locator('#pastQuizArea').screenshot({path:path.join(out,`shared-${width}.png`)});}
   for(const panel of ['practice','exam','past','wrong','stats','scope']){await page.evaluate(p=>switchPanel(p),panel);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),panel+' overflow');}
   assert.deepEqual(errors,[]);assert.deepEqual(external,[]);console.log('PASS browser',width,result,'migration/scoring/practice/mock/tabs/overflow/no external requests');
   await context.close();
  }
  // Real Dev loader logic, but intercept raw-dev URLs with this branch's local bytes.
  const ctx=await browser.newContext(),page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  const raw='https://raw.githubusercontent.com/Naiyi-Chia/IPAS-AI-trainer/dev/';
  await page.route(raw+'**',route=>{const file=path.join(root,new URL(route.request().url()).pathname.split('/dev/')[1]);return route.fulfill({body:fs.readFileSync(file),contentType:mime(file)});});
  await page.addInitScript(()=>localStorage.setItem('ipasAIState','{"untouched":true}'));
  await page.goto(`http://127.0.0.1:${server.address().port}/dev/index.html`);
  await page.waitForFunction(()=>DB!==null,null,{timeout:10000});
  await page.evaluate(()=>loadOfficialPastBundle());
  assert.equal(await page.evaluate(()=>officialPastQuestionIndex.size),700);
  assert.equal(await page.evaluate(()=>localStorage.getItem('ipasAIState')),'{"untouched":true}');
  assert(await page.evaluate(()=>JSON.parse(localStorage.getItem('dev:ipasAIState')).migrations.officialPastCanonical===2));
  assert.equal(await page.evaluate(()=>bundledAssetUrl('assets/example.png')),raw+'assets/example.png');
  assert.deepEqual(errors,[]);await ctx.close();console.log('PASS intercepted Dev loader: schema 4, raw assets, isolated storage');
 }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
}
run().catch(e=>{console.error(e);process.exitCode=1;});
