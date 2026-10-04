// Scoped content regression for Issue #64. Existing Playwright + installed Edge only.
// NODE_PATH=<existing runtime node_modules> node scripts/test_question_batch4f.cjs [OUTPUT_DIR]
// Serves the actual app with only the 24 scoped DB records; fresh browser profiles.
// Production code/assets and native confirm remain intact. No persistent user storage.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),out=process.argv[2];
const expected={Q382:2,Q383:2,Q384:2,Q385:0,Q386:0,Q387:3,Q406:0,Q407:0,Q408:3,Q409:0,Q410:3,Q411:0,Q436:1,Q437:2,Q438:0,Q439:3,Q440:0,Q441:3,Q460:0,Q461:0,Q462:0,Q463:2,Q464:2,Q465:1};
const source=fs.readFileSync(path.join(root,'index.html'),'utf8');
const db=JSON.parse(fs.readFileSync(path.join(root,'data/practice-questions.json'),'utf8'));assert.equal(db.questions.length,483);
db.questions=db.questions.filter(q=>Object.hasOwn(expected,q.id));assert.equal(db.questions.length,24);
for(const q of db.questions)assert.equal(q.answer,expected[q.id],q.id+' protected key');
const html=source;
const findQuestion=text=>{const q=db.questions.find(q=>q.question===text);assert(q,'visible question belongs to scope');return q;};
const evidence=[];
async function run(){
 const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html);return;}
  if(url.pathname==='/data/practice-questions.json'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify(db));return;}
  if(url.pathname==='/favicon.ico'){res.writeHead(204);res.end();return;}
  const file=path.resolve(root,'.'+decodeURIComponent(url.pathname)),rel=path.relative(root,file);
  if(rel.startsWith('..')||path.isAbsolute(rel)){res.writeHead(403);res.end();return;}
  try{res.setHeader('Content-Type',file.endsWith('.json')?'application/json':file.endsWith('.png')?'image/png':'text/plain');res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end();}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));let browser;
 try{
  browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL||'msedge'});
  if(out)fs.mkdirSync(out,{recursive:true});
  for(const width of [1280,375]){
   const context=await browser.newContext({viewport:{width,height:900}}),page=await context.newPage(),errors=[],httpErrors=[],dialogs=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(['error','warning'].includes(m.type()))errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)httpErrors.push(r.url());});
   page.on('dialog',async d=>{dialogs.push(d.message());await d.accept();});
   const overflow=async()=>assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'page overflow');
   const shot=async name=>{if(out)await page.screenshot({path:path.join(out,`${name}-${width}.png`),fullPage:true});};
   await page.goto(`http://127.0.0.1:${server.address().port}/`);
   await page.getByRole('tab',{name:'刷題練習',exact:true}).click();await page.getByLabel('題數',{exact:true}).selectOption('all');await page.getByRole('button',{name:'開始練習',exact:true}).click();
   const practice=[];
   for(let i=0;i<24;i++){
    const q=findQuestion(await page.locator('#practiceArea .qtext').innerText());practice.push(q.id);
    assert.deepEqual(await page.locator('#opts .option').allTextContents(),q.options.map((s,j)=>'ABCD'[j]+'. '+s));
    const pick=q.id==='Q382'?(q.answer+1)%4:q.answer;
    await page.locator(`#opts .option[data-i="${pick}"]`).click();
    const feedback=await page.locator('#pexplain').innerText();assert(feedback.includes((q.id==='Q382'?'答錯了':'答對了')+'｜正解 '+'ABCD'[q.answer]));assert(feedback.includes(q.explanation));assert(feedback.includes(q.sourceType));
    await overflow();
    if(['Q382','Q406','Q436','Q460'].includes(q.id))await shot('practice-'+q.id);
    if(i<23)await page.getByRole('button',{name:'下一題',exact:true}).click();
   }
   assert.deepEqual([...practice].sort(),Object.keys(expected).sort());
   await page.getByRole('tab',{name:'錯題本',exact:true}).click();assert((await page.locator('#wrong').innerText()).includes('錯題本（1）'));assert((await page.locator('#wrong').innerText()).includes('Q382'));
   await page.getByRole('tab',{name:'弱點分析',exact:true}).click();const stats=await page.locator('#stats').innerText();assert(stats.includes('5/6 正確'));assert(stats.includes('83%'));
   await page.getByRole('tab',{name:'錯題本',exact:true}).click();await page.getByRole('button',{name:'重刷錯題',exact:true}).click();
   assert.equal(findQuestion(await page.locator('#practiceArea .qtext').innerText()).id,'Q382');await page.locator('#opts .option[data-i="2"]').click();
   await page.getByRole('tab',{name:'錯題本',exact:true}).click();assert((await page.locator('#wrong').innerText()).includes('錯題本（0）'));
   const mocks=[];
   for(const [subject,wrongId] of [['L22','Q382'],['L23','Q460']]){
    await page.getByRole('tab',{name:'正式模擬',exact:true}).click();await page.getByLabel('模擬科目',{exact:true}).selectOption(subject);await page.getByRole('button',{name:'開始計時模擬',exact:true}).click();
    const ids=[],count=db.questions.filter(q=>q.subject===subject).length,score=Math.round((count-1)/count*100);
    for(let i=0;i<count;i++){
     const q=findQuestion(await page.locator('#examArea .qtext').innerText());assert.equal(q.subject,subject);ids.push(q.id);
     const pick=q.id===wrongId?(q.answer+1)%4:q.answer;
     await page.locator(`#examArea .option[data-i="${pick}"]`).click();await overflow();
     if(i<count-1)await page.getByRole('button',{name:'下一題',exact:true}).click();
    }
    assert.deepEqual([...ids].sort(),db.questions.filter(q=>q.subject===subject).map(q=>q.id).sort());
    await page.getByRole('button',{name:'交卷',exact:true}).click();await page.getByRole('heading',{name:'模擬完成',exact:true}).waitFor();
    assert((await page.locator('#examArea').innerText()).includes(`${count} 題中答對 ${count-1} 題、答錯 1 題、未作答 0 題`));assert.equal(await page.locator('#examArea .kpi').first().innerText(),String(score));
    await page.getByRole('button',{name:'只看錯題',exact:true}).click();const review=await page.locator('#examArea').innerText(),q=db.questions.find(q=>q.id===wrongId);
    assert(review.includes(q.question));assert(review.includes('你的答案：'+'ABCD'[(q.answer+1)%4]));assert(review.includes('正確答案：'+'ABCD'[q.answer]));assert(review.includes(q.explanation));await overflow();await shot('mock-'+subject);
    mocks.push({subject,ids,wrongId,correct:count-1,wrong:1,blank:0,score});
    await page.getByRole('button',{name:'返回模擬設定',exact:true}).click();
   }
   // Exercise the same page's untouched bundled-paper loader after scoped practice.
   await page.getByRole('tab',{name:'考古題',exact:true}).click();await page.getByRole('button',{name:'開始刷題',exact:true}).nth(2).click();
   await page.waitForFunction(()=>document.querySelector('#pastQuizArea')?.textContent.includes('第 1/50 題'));
   assert((await page.locator('#pastQuizArea').innerText()).includes('115 年 第二次'));await overflow();
   const tabs=[];for(const name of ['總覽','刷題練習','正式模擬','考古題','錯題本','弱點分析','官方範圍']){await page.getByRole('tab',{name,exact:true}).click();await overflow();tabs.push(name);}
   assert.equal(dialogs.length,2);assert(dialogs.every(d=>d.includes('確定要交卷')));assert.deepEqual(errors,[]);assert.deepEqual(httpErrors,[]);
   evidence.push({width,height:900,practice,mocks,wrongRetry:'Q382 removed after correct retry',weakArea:'L22203 5/6 83%',nativeConfirmations:dialogs.length,tabs,pageErrors:errors,httpErrors});
   console.log('PASS Batch 4F',width,': all 24 Practice + all 24 Mock; scores 83/94; wrong/retry/stats/official/tabs/overflow; 2 native confirms');
   await context.close();
  }
  if(out)fs.writeFileSync(path.join(out,'batch4f-results.json'),JSON.stringify(evidence,null,2)+'\n');
 }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
}
run().catch(e=>{console.error(e);process.exitCode=1;});
