// Issue #154: topic disclosure follows answers in the current round only.
// Requires Playwright in NODE_PATH and installed Edge.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
async function run(){
 const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+(req.url==='/'?'/index.html':decodeURIComponent(req.url.split('?')[0])));
  const relative=path.relative(root,file);
  if(relative.startsWith('..')||path.isAbsolute(relative)){res.writeHead(403);res.end();return;}
  try{res.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.json')?'application/json':'image/png');res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end();}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));let browser;
 try{
  browser=await chromium.launch({channel:'msedge',headless:true});
  for(const width of [1280,375]){
   const context=await browser.newContext({viewport:{width,height:900}}),page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto(`http://127.0.0.1:${server.address().port}/`);
   await page.waitForFunction(()=>DB!==null);
   const expected=await page.evaluate(()=>{
    const [a,b]=DB.questions;
    state.attempts[a.id]={correct:false,last:1,subject:a.subject,topic:a.topic};state.wrong[a.id]=true;save();
    switchPanel('practice');beginPracticeSession([a,b],'QA');
    return {label:`${a.subject} · ${a.topic} ${a.topicName}`,answer:a.answer};
   });
   const hidden=async()=>{
    assert.equal(await page.locator('#practiceTopicLabel').textContent(),'');
    assert.equal(await page.locator('#practiceTopicLabel').evaluate(el=>el.attributes.length),2);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no horizontal overflow');
   };
   await hidden();assert.match(await page.locator('#practiceAttemptStatus').innerText(),/曾作答/);
   await page.getByRole('button',{name:'☆ 收藏',exact:true}).click();await hidden();
   await page.screenshot({path:path.join(root,`docs/qa/issue-154/before-${width}.png`),fullPage:true});
   await page.locator(`#opts .option[data-i="${expected.answer}"]`).click();
   assert.equal(await page.locator('#practiceTopicLabel').textContent(),expected.label);
   assert.match(await page.locator('#practiceAttemptStatus').innerText(),/本輪：✓ 正確/);
   assert.equal(await page.locator('#opts .option:disabled').count(),4);
   assert(await page.locator('#pexplain').isVisible());
   await page.screenshot({path:path.join(root,`docs/qa/issue-154/after-${width}.png`),fullPage:true});
   await page.getByRole('button',{name:'下一題',exact:true}).click();await hidden();
   await page.getByRole('button',{name:'上一題',exact:true}).click();
   assert.equal(await page.locator('#practiceTopicLabel').textContent(),expected.label);
   await page.evaluate(()=>beginPracticeSession(practiceSet,'New round'));await hidden();
   assert.match(await page.locator('#practiceAttemptStatus').innerText(),/曾作答：✓ 正確/);
   await page.reload();await page.waitForFunction(()=>DB!==null);
   await page.evaluate(()=>{const q=DB.questions[0];switchPanel('practice');beginPracticeSession([q],'Reload');});await hidden();
   // Exercise the actual Practice wrong filter, whose candidates all have history.
   await page.evaluate(()=>{
    state.wrong={};for(const q of DB.questions.slice(0,2)){state.wrong[q.id]=true;state.attempts[q.id]={correct:false,last:2,subject:q.subject,topic:q.topic};}
    renderPractice();qs('#pmode').value='wrong';qs('#psubject').value='全部';startPractice();
   });
   assert.equal(await page.evaluate(()=>practiceSet.length),2);await hidden();
   assert.match(await page.locator('#practiceAttemptStatus').innerText(),/曾作答：✕ 錯誤/);
   const wrong=await page.evaluate(()=>({choice:(practiceSet[0].answer+1)%4,label:`${practiceSet[0].subject} · ${practiceSet[0].topic} ${practiceSet[0].topicName}`}));
   await page.locator(`#opts .option[data-i="${wrong.choice}"]`).click();
   assert.equal(await page.locator('#practiceTopicLabel').textContent(),wrong.label);
   assert.match(await page.locator('#practiceAttemptStatus').innerText(),/本輪：✕ 錯誤/);
   await page.getByRole('button',{name:'下一題',exact:true}).click();await hidden();
   await page.getByRole('button',{name:'上一題',exact:true}).click();assert.equal(await page.locator('#practiceTopicLabel').textContent(),wrong.label);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   assert.deepEqual(errors,[]);await context.close();
   console.log(`PASS ${width}px: historical/reloaded/fresh-round and wrong-mode topics hidden; bookmark, correct/incorrect reveal, next/revisit, history, feedback, no overflow or JS errors`);
  }
 }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
}
run().catch(e=>{console.error(e);process.exitCode=1});
