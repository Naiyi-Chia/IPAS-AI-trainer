// Canonical-bank startup, recovery, full-bank sampling and persisted-ID regression.
// NODE_PATH must include existing Playwright; installed Edge is the default.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),out=process.argv[2];
const bank=JSON.parse(fs.readFileSync(path.join(root,'data/practice-questions.json'),'utf8'));
const seed={attempts:{Q001:{correct:false,last:1,subject:'L11',topic:'L11101'}},wrong:{Q001:true},bookmarks:{Q002:true},examHistory:[],migrations:{officialPastCanonical:2}};
const server=http.createServer((req,res)=>{
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 if(pathname==='/favicon.ico'){res.writeHead(204);return res.end();}
 const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
 if(path.relative(root,file).startsWith('..')){res.writeHead(403);return res.end();}
 try{res.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.json')?'application/json':'image/png');res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end();}
});
async function run(){
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 let browser;
 try{
  browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'msedge',headless:true});
  const url=`http://127.0.0.1:${server.address().port}/`;
  for(const width of [1280,375]){
   const ctx=await browser.newContext({viewport:{width,height:900}}),page=await ctx.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
   await page.addInitScript(seed=>localStorage.setItem('ipasAIState',JSON.stringify(seed)),seed);
   let release;const gate=new Promise(r=>release=r);
   await page.route('**/data/practice-questions.json',async route=>{await gate;await route.continue();});
   await page.goto(url);
   assert.match(await page.locator('#home').innerText(),/正在載入/);
   assert.equal(await page.locator('.tab:disabled').count(),7);
   assert.equal(await page.locator('#practiceStart').count(),0);
   assert.deepEqual(await page.evaluate(()=>state),seed);
   await page.evaluate(()=>switchPanel('stats'));
   assert.equal(await page.locator('#home').isVisible(),true);
   release();await page.waitForFunction(()=>DB!==null&&document.querySelector('#practiceStart'));
   assert.deepEqual(await page.evaluate(()=>DB),bank);
   assert.equal(await page.locator('.tab:disabled').count(),0);
   assert.deepEqual(await page.evaluate(()=>state),seed);
   // Wrong lookup, topic statistics and complete scope metadata use loaded data.
   await page.evaluate(()=>switchPanel('wrong'));
   assert.match(await page.locator('#wrong').innerText(),/Q001/);
   await page.evaluate(()=>switchPanel('stats'));
   assert.equal(await page.locator('[data-topic="L11101"]').count(),1);
   await page.evaluate(()=>switchPanel('scope'));
   assert.equal(await page.locator('#scope .scopeLink').count(),Object.keys(bank.topics).length);
   for(const subject of Object.keys(bank.subjects)){
    await page.evaluate(subject=>{switchPanel('practice');renderPractice();qs('#psubject').value=subject;qs('#pdiff').value='medium';qs('#pcount').value='10';startPractice();},subject);
    assert(await page.evaluate(subject=>practiceSet.length===10&&practiceSet.every(q=>q.subject===subject&&q.difficulty==='medium'),subject));
    await page.evaluate(()=>{answerPractice(practiceSet[0].answer);nextP();});
    assert.equal(await page.evaluate(()=>pIndex),1);
    assert(await page.evaluate(()=>state.attempts[practiceSet[0].id].correct));
    await page.evaluate(subject=>{switchPanel('exam');renderExam();qs('#esubject').value=subject;startExam();},subject);
    assert.equal(await page.evaluate(()=>examSet.length),50);
    assert.equal(await page.evaluate(()=>new Set(examSet.map(q=>q.id)).size),50);
    assert.equal(await page.evaluate(()=>examSeconds),bank.subjects[subject].minutes*60);
    await page.waitForFunction(seconds=>examSeconds<seconds,bank.subjects[subject].minutes*60);
    await page.evaluate(()=>{for(let i=0;i<examSet.length;i++){eIndex=i;examPick(examSet[i].answer);}submitExam(true);renderExamReview();});
    assert.equal(await page.evaluate(()=>state.examHistory.at(-1).score),100);
    assert.match(await page.locator('#examArea').innerText(),new RegExp(bank.questions.find(q=>q.subject===subject).subjectName));
    assert(await page.evaluate(()=>examSubmitted));
    const stopped=await page.evaluate(()=>examSeconds);await page.waitForTimeout(1100);
    assert.equal(await page.evaluate(()=>examSeconds),stopped,'timer stops after submission');
   }
   await page.evaluate(()=>switchPanel('past'));await page.evaluate(()=>loadPastPaperById('115-2-L11'));
   assert.equal(await page.evaluate(()=>pastPaperSet.length),50);
   for(const panel of ['home','practice','exam','past','wrong','stats','scope']){
    await page.evaluate(p=>switchPanel(p),panel);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),panel+' horizontal overflow');
   }
   if(out){fs.mkdirSync(out,{recursive:true});await page.screenshot({path:path.join(out,`scope-${width}.png`)});}
   const persisted=await page.evaluate(()=>localStorage.getItem('ipasAIState'));
   await page.unroute('**/data/practice-questions.json');
   await page.addInitScript(value=>localStorage.setItem('ipasAIState',value),persisted);
   await page.reload();await page.waitForFunction(()=>DB!==null);
   assert.equal(await page.evaluate(()=>localStorage.getItem('ipasAIState')),persisted);
   assert.deepEqual(errors,[]);
   console.log('PASS',width,'delayed startup; 5 subjects practice/filter/navigation + 50-question mocks/timer/100%/review; wrong/stats/scope/official/tabs/overflow; reload preserves progress');
   await ctx.close();
  }
  for(const failure of ['http','network','json','shape']){
   const ctx=await browser.newContext(),page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(seed=>localStorage.setItem('ipasAIState',JSON.stringify(seed)),seed);
   await page.route('**/data/practice-questions.json',route=>failure==='network'?route.abort():route.fulfill({status:failure==='http'?503:200,contentType:'application/json',body:failure==='json'?'{':failure==='shape'?'{}':'unavailable'}));
   await page.goto(url);await page.locator('#home [role="alert"]').waitFor();
   assert.equal(await page.locator('.tab:disabled').count(),7);
   assert.deepEqual(await page.evaluate(()=>state),seed);
   assert.equal(await page.evaluate(()=>DB),null);
   await page.unroute('**/data/practice-questions.json');await page.getByRole('button',{name:'重新載入',exact:true}).click();
   await page.waitForFunction(()=>DB!==null);assert.deepEqual(await page.evaluate(()=>state),seed);assert.deepEqual(errors,[]);
   console.log('PASS recovery',failure,'disabled tabs + explicit retry + records preserved');await ctx.close();
  }
 }finally{await browser?.close();await new Promise(r=>server.close(r));}
}
run().catch(e=>{console.error(e);process.exitCode=1;});
