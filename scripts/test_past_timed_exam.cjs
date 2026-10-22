// #158: controlled persistent Date.now, real timer callbacks, installed Edge.
// NODE_PATH includes Playwright. Optional screenshot directory argument.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),out=process.argv[2],initialTime=Date.parse('2026-10-22T09:00:00+08:00');
const seed={attempts:{'PAST-115-3-L11-1':{correct:false,last:1,subject:'PAST',topic:'old'},KEEP:{correct:true,last:2}},wrong:{'PAST-115-3-L11-1':true,KEEP:true},bookmarks:{KEEP:true},examHistory:[],migrations:{officialPastCanonical:2}};
async function initialize(page,state=seed,now=initialTime){
 await page.addInitScript(({state,now})=>{
  if(!sessionStorage.seeded){localStorage.setItem('ipasAIState',JSON.stringify(state));sessionStorage.seeded='1';}
  window.testNow=Number(sessionStorage.testNow||now);Date.now=()=>window.testNow;
  window.setTestNow=value=>{window.testNow=value;sessionStorage.testNow=String(value);};
 },{state,now});
}
async function run(){
 const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+(req.url==='/'?'/index.html':decodeURIComponent(req.url.split('?')[0]))),rel=path.relative(root,file);
  if(rel.startsWith('..')||path.isAbsolute(rel)){res.writeHead(403);res.end();return;}
  try{res.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.json')?'application/json':'image/png');res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end();}
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser,sampleDraft;
 const url=`http://127.0.0.1:${server.address().port}/`;
 try{
  browser=await chromium.launch({channel:'msedge',headless:true});
  for(const width of [1280,375]){
   const ctx=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'}),page=await ctx.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));await initialize(page);await page.goto(url);await page.waitForFunction(()=>DB!==null);await page.evaluate(()=>loadOfficialPastBundle());
   assert(await page.evaluate(()=>pastPapers.every(p=>pastPaperTiming(p).minutes===(p.level==='初級'?75:90))));
   assert(await page.evaluate(()=>pastPaperTiming({...pastPapers[0],year:'116'})===null&&pastPaperTiming({...pastPapers[0],level:'中級'})===null));
   const evidence=await page.evaluate(()=>JSON.stringify({attempts:state.attempts,wrong:state.wrong,bookmarks:state.bookmarks,examHistory:state.examHistory,evidence:competencyEvidence()}));
   await page.getByRole('tab',{name:'考古題',exact:true}).click();
   if(out){fs.mkdirSync(out,{recursive:true});await page.evaluate(()=>{document.documentElement.style.scrollBehavior='auto';window.scrollTo(0,0);});await page.screenshot({path:path.join(out,`modes-${width}.png`),fullPage:false});}
   await page.getByRole('button',{name:'計時考試 · 75 分鐘',exact:true}).first().click();
   const started=await page.evaluate(()=>JSON.parse(JSON.stringify(state.pastHistory.draft)));
   assert.equal(started.mode,'timed_exam');assert.equal(started.timeLimitMs,4500000);assert.equal(started.startedAt,initialTime);assert.equal(started.position,0);assert.equal(started.status,'in_progress');
   await page.reload();await page.waitForFunction(()=>DB!==null);await page.getByRole('tab',{name:'考古題',exact:true}).click();await page.getByRole('button',{name:'恢復計時考試',exact:true}).click();
   assert.equal(await page.evaluate(()=>pastAttemptSession.id),started.id,'empty attempt resumes with the original ID and start');
   const noReveal=async()=>{
    assert.equal(await page.locator('#past .option.correct,#past .option.wrong,#past .pastOptionState,#past .explain,#pastScoreStatus,#pastQuestionState').count(),0);
    assert.equal(await page.locator('#pastOpts .option:disabled').count(),0);assert.equal(await page.locator('#pastCompletion').count(),0);
    assert.equal(await page.evaluate(()=>JSON.stringify({attempts:state.attempts,wrong:state.wrong,bookmarks:state.bookmarks,examHistory:state.examHistory,evidence:competencyEvidence()})),evidence,'pre-submit selections must not update latest evidence');
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   };
   const firstChoice=await page.evaluate(()=>pastPaperSet[0].answer);
   await page.locator(`#pastOpts [data-i="${firstChoice}"]`).click();await noReveal();
   const wrong=(firstChoice+1)%4;await page.locator(`#pastOpts [data-i="${wrong}"]`).click();
   assert.equal(await page.locator(`#pastOpts [data-i="${wrong}"]`).getAttribute('aria-pressed'),'true');
   await page.getByRole('button',{name:'下一題',exact:true}).click();const secondChoice=await page.evaluate(()=>pastPaperSet[1].answer);await page.locator(`#pastOpts [data-i="${secondChoice}"]`).click();
   await page.getByRole('button',{name:'上一題',exact:true}).click();assert.equal(await page.locator(`#pastOpts [data-i="${wrong}"]`).getAttribute('aria-pressed'),'true');await noReveal();
   const screenshot=async name=>{if(out){fs.mkdirSync(out,{recursive:true});await page.evaluate(()=>{document.documentElement.style.scrollBehavior='auto';window.scrollTo(0,0);});await page.screenshot({path:path.join(out,`${name}-${width}.png`),fullPage:true});}};
   await screenshot('timed');
   await page.evaluate(at=>setTestNow(at),started.startedAt+started.timeLimitMs);
   await page.waitForFunction(()=>document.querySelector('#pastTimedClock')?.dataset.state==='expired');await noReveal();
   assert.equal(await page.evaluate(()=>pastHistoryRecords().length),0,'zero time must not auto-submit');
   await page.evaluate(at=>setTestNow(at),started.startedAt+started.timeLimitMs+65000);
   await page.waitForFunction(()=>document.querySelector('#pastTimedClock')?.dataset.state==='overtime');assert.match(await page.locator('#pastTimedDisplay').innerText(),/超時 01:05/);await noReveal();await screenshot('overtime');
   assert.equal(await page.evaluate(()=>state.pastHistory.draft.overtime),false,'persisted flag can lag the live clock before a new action');
   await page.reload();await page.waitForFunction(()=>DB!==null);await page.getByRole('tab',{name:'考古題',exact:true}).click();await page.getByRole('button',{name:'恢復計時考試',exact:true}).click();
   assert.equal(await page.evaluate(()=>pastAttemptSession.overtime),true,'reload derives overtime from start timestamp, not the stale flag');assert.match(await page.locator('#pastTimedDisplay').innerText(),/超時 01:05/);await noReveal();
   await page.getByRole('button',{name:'暫時離開（繼續計時）',exact:true}).click();
   const suspended=await page.evaluate(()=>state.pastHistory.draft);assert.equal(suspended.id,started.id);assert(suspended.overtime);assert.equal(await page.evaluate(()=>pastHistoryRecords().length),0);
   assert(await page.getByRole('button',{name:'計時考試 · 75 分鐘',exact:true}).first().isDisabled());
   await page.evaluate(at=>setTestNow(at),started.startedAt+started.timeLimitMs+95000);await page.reload();await page.waitForFunction(()=>DB!==null);
   assert.equal(await page.evaluate(()=>state.pastHistory.draft.id),started.id);assert.equal(await page.evaluate(()=>pastHistoryRecords().length),0);
   await page.getByRole('tab',{name:'考古題',exact:true}).click();await page.getByRole('button',{name:'恢復計時考試',exact:true}).click();
   assert.equal(await page.evaluate(()=>pastAttemptSession.startedAt),started.startedAt);assert.match(await page.locator('#pastTimedDisplay').innerText(),/超時 01:35/);
   assert.equal(await page.locator(`#pastOpts [data-i="${wrong}"]`).getAttribute('aria-pressed'),'true');await noReveal();
   sampleDraft=await page.evaluate(()=>JSON.parse(JSON.stringify(state.pastHistory.draft)));
   page.once('dialog',d=>d.dismiss());await page.getByRole('button',{name:'交卷',exact:true}).click();await noReveal();
   await page.evaluate(()=>{window.originalTimedSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='ipasAIState')throw new DOMException('quota','QuotaExceededError');return window.originalTimedSetItem.call(this,k,v);};});
   page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'交卷',exact:true}).click();assert.match(await page.locator('#pastTimedError').innerText(),/交卷未能儲存/);await noReveal();
   await page.evaluate(()=>{Storage.prototype.setItem=window.originalTimedSetItem;});
   page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'交卷',exact:true}).click();
   const result=await page.evaluate(()=>pastHistoryRecords()[0]);assert.equal(result.id,started.id);assert.equal(result.startedAt,started.startedAt);assert.equal(result.elapsedMs,4595000);assert.equal(result.timeLimitMs,4500000);assert(result.overtime);assert.equal(result.correct,1);assert.equal(result.answered,2);assert.equal(result.score,2);assert.equal(result.status,'submitted');
   assert.equal(await page.evaluate(()=>state.pastHistory.draft),null);assert.equal(await page.evaluate(()=>pastTimedTimer),null);assert.equal(await page.locator('#pastCompletion .kpi.good,#pastCompletion .kpi.bad').count(),0);
   assert(!/達標|通過|及格/.test(await page.locator('#pastCompletion').innerText()));await screenshot('submitted');
   await page.evaluate(()=>submitPastTimed());assert.equal(await page.evaluate(()=>pastHistoryRecords().length),1);
   assert.equal(await page.evaluate(()=>state.attempts['PAST-115-3-L11-2'].correct),true);assert(await page.evaluate(()=>state.wrong['PAST-115-3-L11-1']&&state.wrong.KEEP&&state.bookmarks.KEEP));
   await page.getByRole('button',{name:'回顧本次作答',exact:true}).click();await page.locator('#pastAttemptReviewHeading').waitFor();assert.match(await page.locator('#history .pastQuizStatus').innerText(),/答錯/);
   // Intermediate limit and a within-limit result; background time continues through another tab.
   await page.evaluate(async()=>{switchPanel('past');await loadPastPaperById('115-1-L21','timed_exam');});
   const middle=await page.evaluate(()=>state.pastHistory.draft);assert.equal(middle.timeLimitMs,5400000);
   await page.evaluate(()=>{setTestNow(Date.now()+5000);answerPastTimed(pastPaperSet[0].answer);switchPanel('stats');setTestNow(Date.now()+10000);});
   await page.getByRole('tab',{name:'考古題',exact:true}).click();await page.getByRole('button',{name:'恢復計時考試',exact:true}).click();assert.equal(await page.evaluate(()=>pastAttemptSession.id),middle.id);assert.equal(await page.evaluate(()=>pastAttemptSession.elapsedMs),15000);
   page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'交卷',exact:true}).click();assert.equal(await page.evaluate(()=>pastHistoryRecords()[1].overtime),false);
   assert(await page.evaluate(()=>Object.isFrozen(pastHistoryRecords()[1].timingRule)));
   const beforeBlank=await page.evaluate(()=>JSON.stringify({attempts:state.attempts,wrong:state.wrong}));
   await page.evaluate(async()=>{exitPastQuiz();await loadPastPaperById('114-2-L23','timed_exam');navigatePastTimed(44);});
   assert.equal(await page.locator('#past .pastSharedContext').count(),1);assert.equal(await page.locator('#past .option.correct,#past .option.wrong').count(),0);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'交卷',exact:true}).click();assert.equal(await page.evaluate(()=>pastHistoryRecords()[2].answered),0);assert.equal(await page.evaluate(()=>pastHistoryRecords()[2].timingRule.year),'114');assert.equal(await page.evaluate(()=>JSON.stringify({attempts:state.attempts,wrong:state.wrong})),beforeBlank,'blank submission cannot overwrite latest answers');
   // Existing practice remains untimed and immediately reveals correctness.
   await page.evaluate(async()=>{exitPastQuiz();await loadPastPaperById('115-3-L12');answerPast(pastPaperSet[pastIndex].answer);});
   assert(await page.locator('#pastOpts .correct').count());assert.equal(await page.locator('#pastTimedClock').count(),0);assert.equal(await page.evaluate(()=>pastAttemptSession.timeLimitMs),null);
   assert.deepEqual(errors,[]);await ctx.close();console.log(`PASS ${width}px: initial/intermediate rules, neutral editable choices, no pre-submit evidence/reveal, zero/no auto-submit, overtime/reload/leave/resume, atomic submit/retry/review, untimed regression`);
  }
  const cases={missingStart:r=>delete r.startedAt,wrongLimit:r=>r.timeLimitMs=1,missingAnswer:r=>r.answers.pop(),unknownPaper:r=>r.paper.id='unknown',contentVersion:r=>r.contentVersion++,missingSignature:r=>delete r.answers[0].contentSignature,wrongOvertime:r=>r.overtime=!r.overtime,futureClock:r=>{r.startedAt+=1e9;r.updatedAt+=1e9;},position:r=>r.position=999,unknownYear:r=>r.paper.year='116',schema:r=>r.schemaVersion=99};
  for(const [name,mutate] of Object.entries(cases)){
   const ctx=await browser.newContext(),page=await ctx.newPage(),draft=structuredClone(sampleDraft);mutate(draft);
   await initialize(page,{...seed,pastHistory:{schemaVersion:1,records:[],draft}},sampleDraft.updatedAt+1000);await page.goto(url);await page.waitForFunction(()=>DB!==null);
   await page.evaluate(async()=>{switchPanel('past');await resumePastTimedAttempt();});
   assert.equal(await page.locator('#pastTimedClock').count(),0,name);assert.deepEqual(await page.evaluate(()=>state.pastHistory.draft),draft,name+' raw draft preserved');assert.equal(await page.evaluate(()=>pastHistoryRecords().length),0);assert.match(await page.locator('#pastLoadStatus').innerText(),/保留|無法/);
   assert.deepEqual(await page.evaluate(()=>state.attempts),seed.attempts);await ctx.close();
  }
  console.log('PASS 11 invalid recovery cases: no fabricated clock/results, no raw draft/latest-result overwrite');
  {
   const ctx=await browser.newContext(),page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await initialize(page);await page.goto(url);await page.waitForFunction(()=>DB!==null);await page.evaluate(()=>switchPanel('past'));
   const fail=()=>page.evaluate(()=>{window.timedTestSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='ipasAIState')throw new DOMException('quota','QuotaExceededError');return window.timedTestSetItem.call(this,k,v);};});
   const restore=()=>page.evaluate(()=>{Storage.prototype.setItem=window.timedTestSetItem;});
   await fail();await page.evaluate(()=>loadPastPaperById('115-3-L11','timed_exam'));
   assert.equal(await page.locator('#pastTimedClock').count(),0);assert.deepEqual(await page.evaluate(()=>state),seed,'failed initial write cannot create a phantom attempt');await restore();
   await page.evaluate(()=>loadPastPaperById('115-3-L11','timed_exam'));const original=await page.evaluate(()=>JSON.stringify(state));
   await fail();await page.locator('#pastOpts [data-i="0"]').click();assert.match(await page.locator('#pastTimedError').innerText(),/尚未儲存/);
   assert.equal(await page.evaluate(()=>JSON.stringify(state)),original,'failed answer write rolls back selection/draft');
   await page.evaluate(()=>switchPanel('practice'));assert(await page.locator('#past').isVisible(),'unsaved exit is blocked, timer and record remain');assert.equal(await page.evaluate(()=>JSON.stringify(state)),original);
   await restore();await page.locator('#pastOpts [data-i="0"]').click();assert.equal(await page.evaluate(()=>state.pastHistory.draft.answers[0].selectedAnswer),0);assert.deepEqual(errors,[]);await ctx.close();
  }
  console.log('PASS initial/answer write failures: no phantom clock/selection, exit blocked until persistence succeeds');
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
}
run().catch(e=>{console.error(e);process.exitCode=1;});
