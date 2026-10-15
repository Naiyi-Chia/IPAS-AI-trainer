// Issue #157: real-browser session history, storage compatibility and immutable review.
// NODE_PATH includes Playwright; installed Edge. Optional screenshot directory argument.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),out=process.argv[2];
const seed={attempts:{KEEP:{correct:true,last:5}},wrong:{KEEP:true},bookmarks:{KEEP:true},examHistory:[{score:80}],migrations:{officialPastCanonical:2}};
const paperId='114-2-L23';
async function run(){
 const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+(req.url==='/'?'/index.html':decodeURIComponent(req.url.split('?')[0])));
  const rel=path.relative(root,file);if(rel.startsWith('..')||path.isAbsolute(rel)){res.writeHead(403);res.end();return;}
  try{res.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.json')?'application/json':'image/png');res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end();}
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 const url=`http://127.0.0.1:${server.address().port}/`;let savedRecord;
 try{
  browser=await chromium.launch({channel:'msedge',headless:true});
  for(const width of [1280,375]){
   const ctx=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'}),page=await ctx.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(seed=>{if(!sessionStorage.seeded){localStorage.setItem('ipasAIState',JSON.stringify(seed));sessionStorage.seeded='1';}},seed);
   await page.goto(url);await page.waitForFunction(()=>DB!==null);
   assert.deepEqual(await page.evaluate(()=>state),seed,'old state unmodified at upgrade');
   await page.getByRole('tab',{name:'考古題',exact:true}).click();
   await page.getByRole('button',{name:'考試紀錄',exact:true}).click();
   assert.match(await page.locator('#past').innerText(),/尚無考試紀錄/);
   // Latest results are deliberately all correct; first new session must not inherit them.
   await page.evaluate(async paperId=>{
    await loadOfficialPastBundle();
    for(const q of officialPastQuestionIndex.values())if(q.paperId===paperId||q.id.startsWith(`PAST-${paperId}-`))state.attempts[q.id]={correct:true,last:10,subject:'PAST',topic:'legacy'};
    save();await loadPastPaperById(paperId);
   },paperId);
   const choice=await page.evaluate(()=>(pastPaperSet[pastIndex].answer+1)%4);
   await page.locator(`#pastOpts .option[data-i="${choice}"]`).click();
   await page.getByRole('button',{name:'下一題',exact:true}).last().click();
   const correct=await page.evaluate(()=>pastPaperSet[pastIndex].answer);
   await page.locator(`#pastOpts .option[data-i="${correct}"]`).click();
   await page.evaluate(()=>{pastIndex=pastPaperSet.length-1;renderPastQuiz();});
   await page.getByRole('button',{name:'完成這份',exact:true}).click();
   const first=await page.evaluate(()=>state.pastHistory.records[0]);
   assert.equal(first.answered,2);assert.equal(first.correct,1);assert.equal(first.score,2);assert.equal(first.resultStatus,'partial');
   assert.equal(first.answers[0].selectedAnswer,choice);assert.equal(first.answers[2].selectedAnswer,null);
   assert.equal(first.contentVersion,await page.evaluate(()=>OFFICIAL_PAST_CONTENT_VERSION));
   assert.equal(typeof first.answers[0].contentSignature,'string');
   assert.equal(first.mode,'practice');assert.equal(first.timeLimitMs,null);assert.equal(first.overtime,null);
   assert(first.submittedAt>=first.startedAt);assert.equal(first.elapsedMs,first.submittedAt-first.startedAt);
   const validation=await page.evaluate(record=>{
    const negatives=[r=>r.schemaVersion=99,r=>r.score++,r=>r.correct++,r=>r.elapsedMs++,r=>r.answers[0].selectedAnswer=99,r=>r.answers[0].correctAnswer=-1,r=>r.answers[0].contentSignature=42,r=>r.answers.push(r.answers[0]),r=>r.paper.id='missing',r=>r.mode='unknown',r=>r.overtime=false,r=>r.status='edited',r=>r.id="bad');alert(1)"];
    const rejected=negatives.every(mutate=>{const r=structuredClone(record);mutate(r);return !validPastAttempt(r)});
    const timed=structuredClone(record);timed.mode='timed_exam';timed.timeLimitMs=Math.max(1,timed.elapsedMs-1);timed.overtime=timed.elapsedMs>timed.timeLimitMs;
    return {rejected,timed:validPastAttempt(timed),wrongOvertime:validPastAttempt({...timed,overtime:!timed.overtime})};
   },first);
   assert.deepEqual(validation,{rejected:true,timed:true,wrongOvertime:false});
   savedRecord=first;
   assert.match(await page.locator('#pastCompletion').innerText(),/本次紀錄：2 分/);
   await page.getByRole('button',{name:'重新作答這份',exact:true}).click();
   // Full second session of the identical paper; all selections go through answerPast.
   await page.evaluate(()=>{for(let i=0;i<pastPaperSet.length;i++){pastIndex=i;pastAnswered=false;renderPastQuiz();answerPast(pastPaperSet[i].answer);}pastNext();pastNext();});
   const records=await page.evaluate(()=>state.pastHistory.records);
   assert.equal(records.length,2,'duplicate completion guarded');assert.notEqual(records[0].id,records[1].id);
   assert.deepEqual(records[0],first,'later answers cannot rewrite the earlier snapshot');
   assert.equal(records[1].score,100);assert.equal(records[1].resultStatus,'complete');
   const id=first.id;
   await page.getByRole('button',{name:'考試紀錄',exact:true}).click();
   const card=page.locator(`[data-attempt-id="${id}"]`);
   assert.match(await card.innerText(),/2\s*分/);assert.match(await card.innerText(),/實際時間/);
   await card.getByRole('button',{name:'新增備註'}).click();
   const note='<script>alert(1)</script>\n需要複習題組與模型。';
   await page.getByLabel('這次作答的複習重點').fill(note);
   await page.getByRole('button',{name:'儲存備註',exact:true}).click();
   const afterNote=await page.evaluate(id=>findPastAttempt(id),id);assert.deepEqual({...afterNote,note:''},first);
   assert.equal(afterNote.note,note);assert.equal(await page.locator('#past script').count(),0);
   await card.getByRole('button',{name:'修改備註'}).click();
   await page.getByLabel('這次作答的複習重點').fill('需要複習題組與模型。\n下次練習前先整理模型架構。');
   await page.getByRole('button',{name:'儲存備註',exact:true}).click();
   assert.deepEqual(await page.evaluate(id=>{const r=findPastAttempt(id);return {...r,note:''}},id),first);
   const unchanged=await page.evaluate(()=>JSON.stringify({attempts:state.attempts,wrong:state.wrong,bookmarks:state.bookmarks,examHistory:state.examHistory,evidence:competencyEvidence()}));
   if(out){fs.mkdirSync(out,{recursive:true});await page.evaluate(()=>{document.documentElement.style.scrollBehavior='auto';window.scrollTo(0,0);});await page.screenshot({path:path.join(out,`history-${width}.png`),fullPage:true});}
   await card.getByRole('button',{name:'回顧本次作答'}).click();
   assert.match(await page.locator('#past .pastQuizStatus').innerText(),new RegExp(`答錯.*當次答案 ${'ABCD'[choice]}`));
   assert.equal(await page.locator('#past .option').count(),0,'review has no answer-edit controls');
   assert(await page.evaluate(id=>{const r=findPastAttempt(id);return Object.isFrozen(r)&&Object.isFrozen(r.answers[0])&&Object.isFrozen(r.paper)},id));
   if(out){await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:path.join(out,`review-${width}.png`),fullPage:true});}
   await page.getByLabel('跳至題號').selectOption('2');assert.match(await page.locator('.pastQuizStatus').innerText(),/未作答/);
   await page.getByLabel('跳至題號').selectOption('44');assert(await page.locator('.pastSharedContext').count(),'shared official context reused');
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'review no overflow');
   await page.evaluate(()=>{const q=officialPastQuestionIndex.get(findPastAttempt(pastHistoryReviewId).answers[0].questionId),answer=q.answer;q.answer=(answer+1)%4;renderPastAttemptReview(0);q.answer=answer;});
   assert.match(await page.locator('#past').innerText(),/無法對應這題的紀錄版本/);
   // Same answer/index/count/version is insufficient when wording/options/context change.
   const assertUnavailable=async()=>{
    assert.match(await page.locator('#past').innerText(),/無法對應這題的紀錄版本/);
    assert.equal(await page.locator('#past .qtext,#past .pastReviewOption,#past .pastSharedContext,#past .pastVisualGrid').count(),0,'unproven current content is not rendered');
    assert.match(await page.locator('#past .pastQuizStatus').innerText(),new RegExp(`答錯.*當次答案 ${'ABCD'[choice]}`));
   };
   for(const field of ['question','options','visualAssets','sharedContext']){
    const invariants=await page.evaluate(field=>{
     const r=findPastAttempt(pastHistoryReviewId),a=r.answers[0],q=officialPastQuestionIndex.get(a.questionId);
     const original=q[field];
     if(field==='options')q.options=q.options.map((o,i)=>i===0?'CHANGED OPTION TEXT':o);
     else if(field==='visualAssets')q.visualAssets=['changed-visual.png'];
     else if(field==='sharedContext')q.sharedContext={text:'CHANGED SHARED CONTEXT',visual_assets:[]};
     else q.question='CHANGED QUESTION WORDING';
     const same={answer:q.answer===a.correctAnswer,count:q.options.length===a.optionCount,version:r.contentVersion===OFFICIAL_PAST_CONTENT_VERSION};
     renderPastAttemptReview(0);q[field]=original;return same;
    },field);
    assert.deepEqual(invariants,{answer:true,count:true,version:true});await assertUnavailable();
   }
   // Explicit version mismatch and legacy records without a content proof fail closed.
   for(const kind of ['version','legacy']){
    assert(await page.evaluate(kind=>{
     const h=pastHistoryStore(),index=h.records.findIndex(r=>r.id===pastHistoryReviewId),original=h.records[index],changed=structuredClone(original);
     if(kind==='version')changed.contentVersion++;else changed.answers.forEach(a=>delete a.contentSignature);
     h.records[index]=changed;const valid=validPastAttempt(changed);renderPastAttemptReview(0);h.records[index]=original;return valid;
    },kind));
    await assertUnavailable();
   }
   await page.evaluate(()=>renderPastAttemptReview(0));assert.equal(await page.locator('#past .qtext').count(),1,'matching version and exact signature render normally');
   assert.deepEqual(await page.evaluate(id=>{const r=findPastAttempt(id);return {...r,note:''}},id),first,'compatibility checks never rewrite history');
   assert.equal(await page.evaluate(()=>JSON.stringify({attempts:state.attempts,wrong:state.wrong,bookmarks:state.bookmarks,examHistory:state.examHistory,evidence:competencyEvidence()})),unchanged);
   await page.getByRole('button',{name:'返回考試紀錄',exact:true}).click();
   page.once('dialog',d=>d.dismiss());await card.getByRole('button',{name:'刪除紀錄'}).click();assert.equal(await card.count(),1);
   page.once('dialog',d=>d.accept());await card.getByRole('button',{name:'刪除紀錄'}).click();assert.equal(await card.count(),0);
   assert.equal(await page.evaluate(()=>JSON.stringify({attempts:state.attempts,wrong:state.wrong,bookmarks:state.bookmarks,examHistory:state.examHistory,evidence:competencyEvidence()})),unchanged);
   await page.evaluate(id=>openPastAttemptReview(id),id);assert.match(await page.locator('#past').innerText(),/已不存在/);
   await page.reload();await page.waitForFunction(()=>DB!==null);
   assert.equal(await page.evaluate(()=>pastHistoryRecords().length),1,'remaining attempt survives reload');
   // Persisted active draft recovers only observed session time, not offline time.
   await page.evaluate(async paperId=>{switchPanel('past');await loadPastPaperById(paperId);answerPast(pastPaperSet[pastIndex].answer);},paperId);
   const draft=await page.evaluate(()=>state.pastHistory.draft);assert(draft);
   await page.reload();await page.waitForFunction(()=>DB!==null);
   const recovered=await page.evaluate(id=>findPastAttempt(id),draft.id);
   assert.equal(recovered.status,'interrupted');assert.equal(recovered.elapsedMs,draft.elapsedMs);assert.equal(recovered.answered,1);
   await page.reload();await page.waitForFunction(()=>DB!==null);assert.equal(await page.evaluate(()=>pastHistoryRecords().length),2,'draft recovery idempotent');
   // Leaving, restarting and tab changes each retain partial snapshots exactly once.
   await page.evaluate(async paperId=>{switchPanel('past');await loadPastPaperById(paperId);answerPast(0);restartPastQuiz();answerPast(1);exitPastQuiz();await loadPastPaperById(paperId);answerPast(2);switchPanel('stats');},paperId);
   assert.equal(await page.evaluate(()=>pastHistoryRecords().length),5);
   assert.deepEqual(await page.evaluate(()=>state.attempts.KEEP),seed.attempts.KEEP);
   assert(await page.evaluate(()=>state.wrong.KEEP&&state.bookmarks.KEEP));
   assert.deepEqual(errors,[]);await ctx.close();console.log(`PASS ${width}px: independent attempts, immutable review, same-answer/count/version content changes rejected, version mismatch/legacy fail closed, notes/delete/isolation/reload/lifecycle`);
  }
  // Malformed and future versions must not break startup or be silently reset.
  for(const history of [{schemaVersion:99,records:[]},{schemaVersion:1,records:[{id:'bad'}],draft:{bad:true}}]){
   const ctx=await browser.newContext(),page=await ctx.newPage();
   await page.addInitScript(data=>localStorage.setItem('ipasAIState',JSON.stringify(data)),{...seed,pastHistory:history});
   await page.goto(url);await page.waitForFunction(()=>DB!==null);
   await page.evaluate(()=>{switchPanel('past');showPastHistory();});
   assert.match(await page.locator('#past').innerText(),/格式或版本無法讀取/);
   assert.deepEqual(await page.evaluate(()=>state.pastHistory),history);assert.deepEqual(await page.evaluate(()=>state.attempts),seed.attempts);
   await page.evaluate(async paperId=>{await loadPastPaperById(paperId);answerPast(pastPaperSet[pastIndex].answer);exitPastQuiz();},paperId);
   assert.deepEqual(await page.evaluate(()=>state.pastHistory),history,'unsupported history is never overwritten by a new session');
   await ctx.close();
  }
  console.log('PASS unknown/malformed history: visible warning, raw data/latest progress preserved, startup works');
  const ctx=await browser.newContext(),page=await ctx.newPage();let fail=true;
  const stored={...seed,pastHistory:{schemaVersion:1,records:[savedRecord],draft:null}};
  await page.addInitScript(data=>localStorage.setItem('ipasAIState',JSON.stringify(data)),stored);
  await page.route('**/data/official-past-papers.json',route=>fail?route.fulfill({status:503,body:'unavailable'}):route.continue());
  await page.goto(url);await page.waitForFunction(()=>DB!==null);
  await page.evaluate(async id=>{switchPanel('past');showPastHistory();await openPastAttemptReview(id);},savedRecord.id);
  assert.match(await page.locator('#past').innerText(),/官方題目載入失敗/);
  fail=false;await page.getByRole('button',{name:'重試',exact:true}).click();await page.locator('#pastAttemptReviewHeading').waitFor();
  assert.deepEqual(await page.evaluate(()=>state),stored);await ctx.close();
  console.log('PASS incompatible question snapshot and transient review load failure/retry: saved history unchanged');
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
}
run().catch(e=>{console.error(e);process.exitCode=1;});
