// #164: unified history, versioned Mock snapshots and lossless legacy compatibility.
// Requires existing Playwright in NODE_PATH and installed Edge. Optional screenshot directory.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),out=process.argv[2];
const legacy={date:Date.parse('2026-10-01T09:30:00+08:00'),subject:'L11',score:75,count:20,correct:15,wrong:3,blank:2,mode:'custom'};
const seed={attempts:{KEEP:{correct:true,last:1}},wrong:{KEEP:true},bookmarks:{KEEP:true},examHistory:[legacy],migrations:{officialPastCanonical:2}};
async function run(){
 const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+(req.url==='/'?'/index.html':decodeURIComponent(req.url.split('?')[0]))),rel=path.relative(root,file);
  if(rel.startsWith('..')||path.isAbsolute(rel)){res.writeHead(403);res.end();return;}
  try{res.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.json')?'application/json':'image/png');res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end();}
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser,newRecord;
 const url=`http://127.0.0.1:${server.address().port}/`;
 try{
  browser=await chromium.launch({channel:'msedge',headless:true});
  for(const width of [1280,375]){
   const ctx=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'}),page=await ctx.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(seed=>{if(!sessionStorage.seeded){localStorage.setItem('ipasAIState',JSON.stringify(seed));sessionStorage.seeded='1';}},seed);
   await page.goto(url);await page.waitForFunction(()=>DB!==null);
   assert.deepEqual(await page.evaluate(()=>state),seed,'upgrade does not eagerly rewrite old progress');
   await page.getByRole('tab',{name:'考試紀錄',exact:true}).click();
   assert.equal(await page.locator('#tab-history').getAttribute('aria-selected'),'true');
   const old=await page.evaluate(()=>state.examHistory[0]);
   assert.equal(old.kind,'legacy_summary');assert.deepEqual(old.legacy,legacy);assert(old.id.startsWith('mock-'));
   assert.match(await page.locator('#history').innerText(),/僅有成績摘要，無法回顧逐題答案/);
   assert.match(await page.locator('#history').innerText(),/作答時間未記錄/);
   assert.equal(await page.locator('#history').getByRole('button',{name:'回顧本次作答'}).count(),0,'legacy cannot fabricate review');
   // Official attempt uses the existing #157 source store, then routes to the top-level tab.
   await page.evaluate(async()=>{switchPanel('past');await loadPastPaperById('115-3-L11');answerPast(pastPaperSet[0].answer);exitPastQuiz();});
   const past=await page.evaluate(()=>pastHistoryRecords()[0]);
   await page.getByRole('button',{name:'考試紀錄',exact:true}).click();
   assert(await page.locator('#history').isVisible());assert.equal(await page.locator('#past .pastHistoryList').count(),0);
   assert.equal(await page.locator('#history [data-source="past"]').count(),1);
   await page.evaluate(()=>{switchPanel('exam');qs('#emode').value='20';startExam();});
   await page.locator(`#examArea .option[data-i="${await page.evaluate(()=>examSet[0].answer)}"]`).click();
   await page.getByRole('button',{name:'下一題',exact:true}).click();
   await page.locator(`#examArea .option[data-i="${await page.evaluate(()=>(examSet[1].answer+1)%4)}"]`).click();
   page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'交卷',exact:true}).click();
   const first=await page.evaluate(()=>state.examHistory[0]);newRecord=first;
   assert.equal(first.kind,'mock_attempt');assert.equal(first.schemaVersion,1);assert.equal(first.count,20);assert.equal(first.correct,1);assert.equal(first.wrong,1);assert.equal(first.blank,18);assert.equal(first.score,5);
   assert.equal(first.elapsedMs,first.submittedAt-first.startedAt);assert.equal(first.autoSubmitted,false);assert.equal(first.timedOut,false);assert.equal(first.answers[2].selectedAnswer,null);
   assert.equal(first.configuration.requestedCount,20);assert(first.elapsedMs>0);assert.equal(first.configuration.timeLimitSeconds,4500);
   assert(await page.evaluate(()=>validMockAttempt(state.examHistory[0])&&Object.isFrozen(state.examHistory[0].answers[0].question.options)));
   const negatives=await page.evaluate(record=>{
    const cases=[r=>r.schemaVersion=99,r=>r.kind='unknown',r=>r.id="mock-');alert(1)",r=>r.score++,r=>r.blank++,r=>r.elapsedMs++,r=>r.configuration.requestedCount=1,r=>r.answers[0].selectedAnswer=99,r=>r.answers[0].correct=!r.answers[0].correct,r=>r.answers[0].question.answer=99,r=>r.answers.push(r.answers[0]),r=>r.timedOut=true];
    return cases.every(change=>{const r=structuredClone(record);change(r);return !validMockAttempt(r);});
   },first);assert(negatives,'malformed system fields rejected');
   await page.getByRole('button',{name:'考試紀錄',exact:true}).click();
   await page.locator('#history').getByRole('button',{name:'全部',exact:true}).click();
   const ordered=await page.locator('#history [data-attempt-id]').evaluateAll(nodes=>nodes.map(n=>n.dataset.attemptId));
   assert.deepEqual(ordered,[first.id,past.id,old.id],'all sources newest first');
   await page.locator('#history').getByRole('button',{name:'考古題',exact:true}).click();assert.equal(await page.locator('#history [data-source="mock"]').count(),0);
   await page.locator('#history').getByRole('button',{name:'模擬考',exact:true}).click();assert.equal(await page.locator('#history [data-source="past"]').count(),0);
   const card=page.locator(`[data-attempt-id="${first.id}"]`),oldCard=page.locator(`[data-attempt-id="${old.id}"]`);
   const evidence=await page.evaluate(()=>JSON.stringify({attempts:state.attempts,wrong:state.wrong,bookmarks:state.bookmarks,evidence:competencyEvidence(),pastHistory:state.pastHistory}));
   await card.getByRole('button',{name:'新增備註'}).click();await page.getByLabel('這次作答的複習重點').fill('<script>alert(1)</script>\n複習模型與資料處理。');
   await page.getByRole('button',{name:'儲存備註',exact:true}).click();
   assert.equal(await page.locator('#history script').count(),0);
   assert.deepEqual(await page.evaluate(id=>({...findMockAttempt(id),note:''}),first.id),first,'notes only modify note');
   await card.getByRole('button',{name:'修改備註'}).click();await page.getByLabel('這次作答的複習重點').fill('複習模型與資料處理。');await page.getByRole('button',{name:'儲存備註',exact:true}).click();
   await oldCard.getByRole('button',{name:'新增備註'}).click();await page.getByLabel('這次作答的複習重點').fill('舊成績保留作為比較。');await page.getByRole('button',{name:'儲存備註',exact:true}).click();
   assert.deepEqual(await page.evaluate(id=>findMockAttempt(id).legacy,old.id),legacy);
   await page.locator('#history').getByRole('button',{name:'全部',exact:true}).click();
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   if(out){fs.mkdirSync(out,{recursive:true});await page.evaluate(()=>{document.documentElement.style.scrollBehavior='auto';window.scrollTo(0,0);});await page.screenshot({path:path.join(out,`history-${width}.png`),fullPage:true});}
   await card.getByRole('button',{name:'回顧本次作答'}).click();
   await page.evaluate(id=>{
    const snapshot=findMockAttempt(id).answers[0].question,q=DB.questions.find(q=>q.id===snapshot.id),original={question:q.question,options:q.options,explanation:q.explanation};
    q.question='CHANGED CURRENT QUESTION';q.options=q.options.map(()=>'CHANGED CURRENT OPTION');q.explanation='CHANGED CURRENT EXPLANATION';
    openMockAttemptReview(id);Object.assign(q,original);
   },first.id);
   assert(!(await page.locator('#history').innerText()).includes('CHANGED CURRENT'),'review renders saved content independent of current DB');
   assert.equal(await page.locator('#history .reviewItem').count(),20);await page.locator('#history .reviewItem').nth(0).evaluate(el=>el.open=true);assert((await page.locator('#history .reviewItem').nth(0).innerText()).includes(first.answers[0].question.options[first.answers[0].selectedAnswer]));
   await page.locator('#history').getByRole('button',{name:'未作答',exact:true}).click();assert.equal(await page.locator('#history .reviewItem').count(),18);assert.match(await page.locator('#history .reviewItem').first().innerText(),/未作答/);
   await page.locator('#history').getByRole('button',{name:'全部',exact:true}).click();
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   if(out){await page.locator('#history .reviewItem').nth(0).evaluate(el=>el.open=true);await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:path.join(out,`mock-review-${width}.png`),fullPage:false});}
   await page.getByRole('button',{name:'返回考試紀錄',exact:true}).click();
   page.once('dialog',d=>d.dismiss());await oldCard.getByRole('button',{name:'刪除紀錄'}).click();assert.equal(await oldCard.count(),1);
   page.once('dialog',d=>d.accept());await oldCard.getByRole('button',{name:'刪除紀錄'}).click();assert.equal(await oldCard.count(),0);
   page.once('dialog',d=>d.accept());await card.getByRole('button',{name:'刪除紀錄'}).click();assert.equal(await card.count(),0);
   assert.equal(await page.evaluate(()=>JSON.stringify({attempts:state.attempts,wrong:state.wrong,bookmarks:state.bookmarks,evidence:competencyEvidence(),pastHistory:state.pastHistory})),evidence,'mock note/review/delete preserve latest-result evidence and official history');
   await page.evaluate(id=>openMockAttemptReview(id),first.id);assert.match(await page.locator('#history').innerText(),/已不存在/);
   await page.evaluate(()=>switchPanel('stats'));assert(!/官方考古題進度|最近模擬/.test(await page.locator('#stats').innerText()));assert.match(await page.locator('#stats').innerText(),/能力小章節弱點分析/);
   if(out){await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:path.join(out,`weakness-${width}.png`),fullPage:true});}
   await page.evaluate(()=>switchPanel('past'));assert.match(await page.locator('#past').innerText(),/已作答 1 題/);
   // Actual timer callback produces a new timeout record; later sessions cannot rewrite it.
   await page.evaluate(()=>{switchPanel('exam');qs('#emode').value='20';startExam();examSeconds=1;});
   await page.waitForFunction(()=>examSubmitted);
   const timed=await page.evaluate(()=>state.examHistory[0]);assert(timed.autoSubmitted&&timed.timedOut);assert.equal(timed.remainingSeconds,0);assert.equal(timed.blank,20);assert.notEqual(timed.id,first.id);
   await page.evaluate(()=>startExam());
   const active=await page.evaluate(()=>({id:mockSession.id,answers:examAnswers,submitted:examSubmitted,review:lastExamReview}));
   await page.evaluate(id=>{openExamHistory();openMockAttemptReview(id);},timed.id);
   assert.deepEqual(await page.evaluate(()=>({id:mockSession.id,answers:examAnswers,submitted:examSubmitted,review:lastExamReview})),active,'historical review does not mutate the active exam');
   assert.deepEqual(await page.evaluate(id=>findMockAttempt(id),timed.id),timed);
   await page.evaluate(()=>clearInterval(examTimer));await page.reload();await page.waitForFunction(()=>DB!==null);
   await page.getByRole('tab',{name:'考試紀錄',exact:true}).click();assert.equal(await page.locator('#history [data-source="past"]').count(),1);assert.equal(await page.locator('#history [data-source="mock"]').count(),1);
   assert.deepEqual(await page.evaluate(()=>state.attempts.KEEP),seed.attempts.KEEP);assert(await page.evaluate(()=>state.wrong.KEEP&&state.bookmarks.KEEP));
   assert.deepEqual(errors,[]);await ctx.close();console.log(`PASS ${width}px: top-level/filter/order, official reuse, Mock snapshots/manual+timeout/review/isolation, legacy lossless migration/notes/delete, stats cleanup, reload/mobile/JS`);
  }
  for(const history of [{schemaVersion:99},[{schemaVersion:99,id:'future',raw:'preserve'},null,{score:'bad'},newRecord]]){
   const ctx=await browser.newContext(),page=await ctx.newPage();
   await page.addInitScript(s=>localStorage.setItem('ipasAIState',JSON.stringify(s)),{...seed,examHistory:history});
   await page.goto(url);await page.waitForFunction(()=>DB!==null);await page.evaluate(()=>openExamHistory());
   assert.match(await page.locator('#history').innerText(),/格式或版本無法讀取/);assert.deepEqual(await page.evaluate(()=>state.examHistory),history);
   await page.evaluate(()=>{switchPanel('exam');startExam();submitExam(true);});
   const current=await page.evaluate(()=>state.examHistory);
   if(Array.isArray(history)){assert.deepEqual(current.slice(1),history);assert.equal(current[0].kind,'mock_attempt');}
   else assert.deepEqual(current,history);
   await ctx.close();
  }
  console.log('PASS malformed/future Mock history: startup/render safe, original raw entries/container never overwritten');
  {
   const ctx=await browser.newContext(),page=await ctx.newPage(),oldState={...seed};delete oldState.examHistory;
   await page.addInitScript(s=>localStorage.setItem('ipasAIState',JSON.stringify(s)),oldState);
   await page.goto(url);await page.waitForFunction(()=>DB!==null);await page.evaluate(()=>openExamHistory());
   assert.equal(await page.locator('#history [role="alert"]').count(),0);assert.deepEqual(await page.evaluate(()=>state),oldState);
   await page.evaluate(()=>{switchPanel('exam');startExam();submitExam(true);});assert.equal(await page.evaluate(()=>state.examHistory.length),1);assert.deepEqual(await page.evaluate(()=>state.attempts.KEEP),seed.attempts.KEEP);
   await ctx.close();
  }
  // The new history must not silently evict older summaries at the previous 30-record cap.
  {
   const ctx=await browser.newContext(),page=await ctx.newPage(),summaries=Array.from({length:31},(_,i)=>({...legacy,date:legacy.date+i}));
   await page.addInitScript(s=>localStorage.setItem('ipasAIState',JSON.stringify(s)),{...seed,examHistory:summaries});
   await page.goto(url);await page.waitForFunction(()=>DB!==null);await page.evaluate(()=>openExamHistory());
   assert.equal(await page.evaluate(()=>new Set(mockHistoryRecords().map(r=>r.id)).size),31);
   await page.evaluate(()=>{switchPanel('exam');startExam();submitExam(true);});
   assert.equal(await page.evaluate(()=>state.examHistory.length),32);assert.deepEqual(await page.evaluate(()=>state.examHistory.slice(1).map(r=>r.legacy)),summaries);
   await ctx.close();
  }
  // Failed local writes retain originals; explicit result retry must not create duplicate events.
  {
   const ctx=await browser.newContext(),page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(s=>localStorage.setItem('ipasAIState',JSON.stringify(s)),{...seed,examHistory:[newRecord]});
   await page.goto(url);await page.waitForFunction(()=>DB!==null);await page.evaluate(()=>openExamHistory());
   const original=await page.evaluate(()=>localStorage.getItem('ipasAIState'));
   const fail=()=>page.evaluate(()=>{window.historyTestSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='ipasAIState')throw new DOMException('quota','QuotaExceededError');return window.historyTestSetItem.call(this,k,v);};});
   const restore=()=>page.evaluate(()=>{Storage.prototype.setItem=window.historyTestSetItem;});
   await fail();await page.evaluate(id=>editMockAttemptNote(id),newRecord.id);await page.getByLabel('這次作答的複習重點').fill('must not silently save');
   await page.getByRole('button',{name:'儲存備註',exact:true}).click();assert.match(await page.locator('#historyNoteStatus').innerText(),/未能儲存/);
   assert.deepEqual(await page.evaluate(id=>findMockAttempt(id),newRecord.id),newRecord);await restore();
   await page.evaluate(()=>openExamHistory());await fail();page.once('dialog',d=>d.accept());await page.evaluate(id=>deleteMockAttempt(id),newRecord.id);
   assert.match(await page.locator('#history').innerText(),/刪除未能儲存/);assert(await page.evaluate(id=>!!findMockAttempt(id),newRecord.id));await restore();
   await page.evaluate(()=>{switchPanel('exam');startExam();});await fail();await page.evaluate(()=>submitExam(true));
   assert.match(await page.locator('#examHistorySaveStatus').innerText(),/尚未儲存/);assert.equal(await page.evaluate(()=>localStorage.getItem('ipasAIState')),original);
   await restore();await page.getByRole('button',{name:'重試儲存結果',exact:true}).click();assert.match(await page.locator('#examHistorySaveStatus').innerText(),/已儲存/);
   assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('ipasAIState')).examHistory.length),2);assert.deepEqual(errors,[]);await ctx.close();
  }
  console.log('PASS 31 legacy records retained on new submission; note/delete/write failure rollback and result retry without duplicate history');
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
}
run().catch(e=>{console.error(e);process.exitCode=1;});
