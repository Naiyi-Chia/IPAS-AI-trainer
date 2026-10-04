// Issue #104: real-browser aggregation, cold loading, recovery, drill and scoring QA.
// NODE_PATH must include Playwright; uses installed Edge by default.
// node scripts/test_source_aware_weakness.cjs [SCREENSHOT_DIR]
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),out=process.argv[2];
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const DB=JSON.parse(fs.readFileSync(path.join(root,'data/practice-questions.json'),'utf8'));
const bundle=JSON.parse(fs.readFileSync(path.join(root,'data/official-past-papers.json'),'utf8'));
const topic='L12202',paper=bundle.papers.find(p=>p.subject==='L12');
const official=paper.questions.filter(q=>q.competency_topic===topic).slice(0,3).map(q=>`PAST-${paper.paper_id}-${q.question_no}`);
assert.equal(official.length,3);
const seed={attempts:Object.fromEntries(official.map((id,i)=>[id,{correct:i===0,last:i+1,subject:'PAST',topic:'legacy paper title'}])),wrong:{[official[1]]:true},bookmarks:{[official[0]]:{note:'keep'}},examHistory:[],migrations:{officialPastCanonical:2}};
async function run(){
 const server=http.createServer((req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const actual=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(path.relative(root,actual).startsWith('..')){res.writeHead(403);res.end();return;}
  try{res.setHeader('Content-Type',actual.endsWith('.html')?'text/html; charset=utf-8':actual.endsWith('.json')?'application/json':'image/png');res.end(fs.readFileSync(actual));}catch{res.writeHead(404);res.end();}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const url=`http://127.0.0.1:${server.address().port}/`;let browser;
 try{
  browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'msedge',headless:true});
  for(const width of [1280,375]){
   const ctx=await browser.newContext({viewport:{width,height:900}}),page=await ctx.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   page.on('response',r=>{if(r.status()>=400)errors.push(`HTTP ${r.status()} ${r.url()}`)});
   await page.addInitScript(seed=>localStorage.setItem('ipasAIState',JSON.stringify(seed)),seed);
   let release;const gate=new Promise(resolve=>release=resolve);
   await page.route('**/data/official-past-papers.json',async route=>{await gate;await route.continue()});
   await page.goto(url);
   await page.waitForFunction(()=>DB!==null);
   await page.evaluate(()=>switchPanel('stats'));
   assert.match(await page.locator('#stats').innerText(),/正在載入/);
   assert.equal(await page.locator('.competencyRow').count(),0,'no partial diagnosis before trusted metadata');
   await page.evaluate(()=>{switchPanel('practice');qs('#pmode').value='weak';startPractice()});
   assert(await page.locator('#practiceStart').isDisabled());
   assert.match(await page.locator('#practiceArea').innerText(),/正在載入/);
   release();
   await page.waitForFunction(()=>practiceSet.length>0);
   assert(await page.evaluate(()=>practiceSet.every(q=>q.topic==='L12202'&&!q.id.startsWith('PAST-'))));
   assert.deepEqual(await page.evaluate(()=>state),seed,'existing records need no migration or reset');
   await page.evaluate(()=>switchPanel('stats'));
   const officialRow=page.locator(`[data-topic="${topic}"]`);
   assert.match(await officialRow.innerText(),/弱項/);
   assert.match(await officialRow.innerText(),/合併 1\/3 正確 · 33%/);
   assert.match(await officialRow.innerText(),/自編題 0\/0/);
   assert((await officialRow.innerText()).includes(`${topic}｜${DB.topics[topic]}`));
   assert.match(await officialRow.locator('a').getAttribute('href'),/#page=/);
   const result=await page.evaluate(()=>{
    const check=(value,message)=>{if(!value)throw Error(message)};
    const self=DB.questions.filter(q=>q.topic==='L12202'),official=[...officialPastQuestionIndex.values()].filter(q=>q.topic==='L12202');
    const set=entries=>{state.attempts=Object.fromEntries(entries.map(([q,correct])=>[q.id,{correct,last:1}]))};
    set([[self[0],false],[self[1],true]]);
    let r=competencyEvidence().rows[0];check(r.insufficient&&!r.weak&&r.fallback&&r.combined.accuracy===.5,'1–2 samples insufficient');
    renderStats();check(qs('#stats').textContent.includes('資料不足（初步訊號）'),'visible insufficient state');
    set([[self[0],false]]);check(competencyEvidence().rows[0].insufficient&&!competencyEvidence().rows[0].weak,'one wrong answer is insufficient');
    set([[official[0],true],...self.slice(0,9).map(q=>[q,false])]);
    r=competencyEvidence().rows[0];check(r.combined.answered===10&&r.combined.correct===1&&r.combined.accuracy===.1,'equal question weighting, not source weighting');
    check(r.official.answered===1&&r.official.correct===1&&r.selfAuthored.answered===9&&r.selfAuthored.correct===0,'source split');
    check(r.weak&&!r.fallback,'formal weak');
    const ordered=JSON.stringify(competencyEvidence());
    state.attempts=Object.fromEntries(Object.entries(state.attempts).reverse());
    check(JSON.stringify(competencyEvidence())===ordered,'workflow/insertion order does not affect calculation');
    // Latest result replaces one ID instead of increasing sample count.
    state.attempts[official[0].id].correct=false;
    r=competencyEvidence().rows[0];check(r.combined.answered===10&&r.combined.correct===0,'latest per-ID result');
    set(self.slice(0,10).map((q,i)=>[q,i<7]));
    r=competencyEvidence().rows[0];check(!r.weak&&r.combined.accuracy===.7,'70% is not weak');
    state.attempts[self[6].id].correct=false;check(competencyEvidence().rows[0].weak,'60% is weak');
    set(self.slice(0,3).map((q,i)=>[q,i<2]));check(competencyEvidence().rows[0].weak,'2/3 is below 70%');
    const samples=Object.keys(DB.topics).slice(0,6).map(t=>DB.questions.find(q=>q.topic===t)).filter(Boolean);
    check(samples.length===6,'fallback fixtures');set(samples.map((q,i)=>[q,i>0]));
    let evidence=competencyEvidence();check(evidence.selected.size===4&&evidence.rows.every(r=>!r.weak)&&evidence.rows.filter(r=>r.fallback).length===4,'max four fallback');
    check(evidence.selected.has(samples[0].topic),'fallback lowest accuracy');
    set([]);check(weakTopicSet().size===0,'empty state');renderStats();check(qs('#stats').textContent.includes('尚無能力章節作答資料'),'empty UI');
    set(official.slice(0,3).map(q=>[q,false]));
    const original=DB.questions;DB.questions=DB.questions.filter(q=>q.topic!=='L12202');
    try{
      switchPanel('stats');check(qs('#stats').textContent.includes('沒有對應自編題'),'diagnosis retained without drill');
      switchPanel('practice');renderPractice();qs('#pmode').value='weak';startPractice();
      check(qs('#practiceArea').textContent.includes('已保留章節診斷'),'no-drill explanation');
    }finally{DB.questions=original}
    switchPanel('practice');renderPractice();qs('#pmode').value='weak';startPractice();
    check(practiceSet.length>0&&practiceSet.every(q=>q.topic==='L12202'&&!q.id.startsWith('PAST-')),'official-only selects self-authored drill');
    set(self.slice(0,2).map(q=>[q,false]));renderPractice();qs('#pmode').value='weak';startPractice();
    check(practiceSessionSummaryText.includes('非確定弱項'),'fallback session disclosure');
    set([...official.slice(0,3).map((q,i)=>[q,i===0]),...self.slice(0,2).map(q=>[q,true])]);
    switchPanel('stats');return {cases:14,combined:competencyEvidence().rows[0].combined};
   });
   assert.equal(result.combined.answered,5);assert.equal(result.combined.correct,3);
   assert.match(await officialRow.innerText(),/官方考古題 1\/3/);
   assert.match(await officialRow.innerText(),/自編題 2\/2/);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no horizontal overflow');
   if(out){fs.mkdirSync(out,{recursive:true});await page.screenshot({path:path.join(out,`weakness-${width}.png`),fullPage:true})}
   // Smoke normal practice, mock scoring/review, wrong book, paper flow and all tabs.
   await page.evaluate(()=>{
    switchPanel('practice');renderPractice();startPractice();answerPractice(practiceSet[0].answer);nextP();
   });
   assert(await page.locator('#practiceArea .qtext').count());
   await page.evaluate(()=>{switchPanel('exam');startExam();examAnswers[examSet[0].id]=examSet[0].answer;submitExam(true);renderExamReview()});
   assert.equal(await page.evaluate(()=>state.examHistory[0].correct),1);
   assert.equal(await page.evaluate(()=>state.examHistory[0].score),await page.evaluate(()=>Math.round(100/examSet.length)));
   assert.match(await page.locator('#examArea').innerText(),/考後逐題檢討/);
   await page.evaluate(()=>switchPanel('wrong'));assert.match(await page.locator('#wrong').innerText(),/PAST-/);
   await page.evaluate(()=>startWrongPractice());assert(await page.evaluate(()=>practiceSet.some(q=>q.id.startsWith('PAST-'))));
   await page.evaluate(()=>{switchPanel('past');return loadPastPaperById('115-3-L12')});
   const beforePast=await page.evaluate(()=>paperProgress(pastPapers.find(p=>p.id==='115-3-L12')).answered);
   await page.evaluate(()=>{answerPast(pastPaperSet[pastIndex].answer);pastNext()});
   assert.equal(await page.evaluate(()=>paperProgress(pastPapers.find(p=>p.id==='115-3-L12')).answered),beforePast+1);
   for(const id of ['home','practice','exam','past','wrong','stats','scope']){
    await page.evaluate(id=>switchPanel(id),id);assert(await page.locator(`#${id}`).isVisible());
   }
   assert.deepEqual(errors,[]);await ctx.close();console.log(`PASS ${width}px: cold official metadata, 14 aggregation/selection cases, preservation, sources, no-drill, all scoring/tab smoke; zero JS/HTTP errors`);
  }
  // Deliberate transient failure must show recovery, never practice-only partial results.
  const ctx=await browser.newContext(),page=await ctx.newPage();let fail=true;
  await page.addInitScript(seed=>localStorage.setItem('ipasAIState',JSON.stringify(seed)),seed);
  await page.route('**/data/official-past-papers.json',route=>fail?route.fulfill({status:503,body:'unavailable'}):route.continue());
  await page.goto(url);
  await page.waitForFunction(()=>DB!==null);await page.evaluate(()=>switchPanel('stats'));
  await page.locator('#stats [role="alert"]').waitFor();assert.equal(await page.locator('.competencyRow').count(),0);
  await page.evaluate(()=>{switchPanel('practice');qs('#pmode').value='weak';return startPractice()});
  assert.match(await page.locator('#practiceArea').innerText(),/載入失敗/);assert.equal(await page.evaluate(()=>practiceSet.length),0);
  assert(!(await page.locator('#practiceStart').isDisabled()));
  fail=false;await page.evaluate(()=>startPractice());assert(await page.evaluate(()=>practiceSet.length>0));
  assert.deepEqual(await page.evaluate(()=>state),seed);await ctx.close();console.log('PASS transient 503: explicit errors, no partial diagnosis/drill, successful retry, records preserved');
 }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve))}
}
run().catch(e=>{console.error(e);process.exitCode=1});
