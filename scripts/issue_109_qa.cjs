const assert=require('node:assert/strict');
const {chromium}=require('playwright');

const base='http://127.0.0.1:4173/';

async function waitForFocus(page,id){
  await page.waitForFunction(expected=>document.activeElement?.id===expected,id);
}

async function desktopFlow(browser){
  const context=await browser.newContext({viewport:{width:1280,height:900}});
  const page=await context.newPage();
  await page.goto(base);
  await page.evaluate(()=>localStorage.clear());
  await page.reload();
  await page.click('#tab-past');
  await page.waitForSelector('#pastPapersHeading');

  const listText=await page.locator('#past').innerText();
  assert(!listText.includes('verified'));
  assert(!listText.includes('canonical dataset'));
  assert(!listText.includes('不再於作答時下載或解析'));
  assert.equal(await page.locator('button[onclick^="loadPastPaperById"]').count(),14);

  await page.locator('button[onclick*="115-3-L11"]').click();
  await page.waitForSelector('#pastQuestionStart');
  await waitForFocus(page,'pastQuestionStart');
  assert.equal(await page.locator('#pastPapersHeading').count(),0);
  assert.equal(await page.locator('button[onclick^="loadPastPaperById"]').count(),0);
  assert.equal(await page.locator('#pastQuestionState').innerText(),'本題尚未作答');

  await page.locator('#pastOpts .option').first().click();
  assert(!(await page.locator('#pastQuestionState').innerText()).includes('尚未作答'));
  assert((await page.locator('#pastScoreStatus').innerText()).includes('已作答 1 題'));

  await page.locator('.navrow .primary').click();
  await waitForFocus(page,'pastQuestionStart');
  assert((await page.locator('.qmetaPrimary').innerText()).includes('第 2 題'));
  const startBox=await page.locator('#pastQuestionStart').boundingBox();
  assert(startBox&&startBox.y>=0&&startBox.y<220,`desktop question start not visible: ${JSON.stringify(startBox)}`);

  await page.locator('.pastExitBtn').click();
  await page.waitForSelector('#pastPapersHeading');
  await waitForFocus(page,'pastPapersHeading');
  const firstCard=page.locator('button[onclick*="115-3-L11"]').locator('xpath=ancestor::div[contains(@class,"card")]');
  assert((await firstCard.innerText()).includes('已作答 1 題'));

  await page.locator('button[onclick*="115-3-L11"]').click();
  await page.waitForSelector('#pastQuestionStart');
  assert((await page.locator('.qmetaPrimary').innerText()).includes('第 2 題'));

  await page.evaluate(()=>{pastIndex=pastPaperSet.length-1;pastAnswered=false;renderPastQuiz();focusPastQuestionStart();});
  await waitForFocus(page,'pastQuestionStart');
  await page.locator('.navrow .primary').click();
  await page.waitForSelector('#pastCompletion');
  await waitForFocus(page,'pastCompletion');
  const completionBox=await page.locator('#pastCompletion').boundingBox();
  assert(completionBox&&completionBox.y>=0&&completionBox.y<220,`completion not visible: ${JSON.stringify(completionBox)}`);
  await page.locator('#pastCompletion .primary').click();
  await waitForFocus(page,'pastQuestionStart');
  assert((await page.locator('.qmetaPrimary').innerText()).includes('第 1 題'));

  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  console.log('PASS desktop list → quiz → answer → next → list → resume → completion → restart');
  await context.close();
}

async function mobileFlow(browser){
  const context=await browser.newContext({viewport:{width:375,height:812}});
  const page=await context.newPage();
  await page.goto(base);
  await page.evaluate(()=>localStorage.clear());
  await page.reload();
  await page.click('#tab-past');
  await page.locator('button[onclick*="114-2-L23"]').click();
  await page.waitForSelector('#pastQuestionStart');
  await waitForFocus(page,'pastQuestionStart');

  assert.equal(await page.locator('.pastMobileNav').evaluate(el=>getComputedStyle(el).display),'flex');
  assert.equal(await page.locator('.pastMobileNav').evaluate(el=>getComputedStyle(el).position),'static');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);

  const sharedIndex=await page.evaluate(()=>pastPaperSet.findIndex(q=>q.sharedContext));
  assert(sharedIndex>=0,'expected a shared-context question');
  await page.evaluate(i=>{pastIndex=i;pastAnswered=false;renderPastQuiz();focusPastQuestionStart();},sharedIndex);
  await waitForFocus(page,'pastQuestionStart');
  const sharedBox=await page.locator('.pastSharedContext').boundingBox();
  assert(sharedBox&&sharedBox.y>=0,`shared context starts above viewport: ${JSON.stringify(sharedBox)}`);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);

  const before=await page.evaluate(()=>pastIndex);
  await page.locator('.pastMobileNav .primary').click();
  await waitForFocus(page,'pastQuestionStart');
  assert.equal(await page.evaluate(()=>pastIndex),before+1);
  const nextBox=await page.locator('#pastQuestionStart').boundingBox();
  assert(nextBox&&nextBox.y>=0&&nextBox.y<220,`mobile next start not visible: ${JSON.stringify(nextBox)}`);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);

  console.log('PASS 375px mobile navigation, shared-context positioning, no horizontal overflow');
  await context.close();
}

(async()=>{
  const browser=await chromium.launch({headless:true});
  try{
    await desktopFlow(browser);
    await mobileFlow(browser);
  }finally{
    await browser.close();
  }
})().catch(err=>{console.error(err);process.exit(1)});
