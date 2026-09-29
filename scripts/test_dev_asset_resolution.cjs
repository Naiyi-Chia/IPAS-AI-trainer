// Snapshot: main 9b7de56, dev/index.html (no raw-base injection).
// Run with existing Playwright in NODE_PATH; BROWSER_CHANNEL defaults to installed Edge.
// node scripts/test_dev_asset_resolution.cjs
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const loader=fs.readFileSync(path.join(__dirname,'fixtures/issue78-main-dev-loader.html'),'utf8');
assert(!loader.includes('__IPAS_DEV_RAW_BASE__'),'fixture must reproduce the deployed old loader');
const raw='https://raw.githubusercontent.com/Naiyi-Chia/IPAS-AI-trainer/dev/';
const pages='https://naiyi-chia.github.io/IPAS-AI-trainer/';
const override='https://qa.example.test/branch/';
const bundle=JSON.parse(fs.readFileSync(path.join(root,'data/official-past-papers.json')));
const assets=[...new Set([...Object.values(bundle.shared_contexts).flatMap(c=>c.visual_assets),...bundle.papers.flatMap(p=>p.questions.flatMap(q=>q.visual_assets))])];
const resolver=html.slice(html.indexOf('function bundledAssetUrl('),html.indexOf('const officialLearningGuide'));
function testResolver(){for(const [url,explicit,expected] of [
 [pages+'dev/',null,raw],[pages+'dev/index.html?test=1',null,raw],
 [pages,null,''],[pages+'index.html',null,''],[pages+'development/',null,''],
 ['https://example.test/IPAS-AI-trainer/dev/',null,''],['http://localhost/dev/',null,''],
 [pages+'dev/',override,override],[pages,override,override]
]){
 const location=new URL(url),ctx=vm.createContext({window:{location,__IPAS_DEV_RAW_BASE__:explicit},location});
 vm.runInContext(resolver,ctx);
 for(const file of ['data/official-past-papers.json',assets[0]])assert.equal(ctx.bundledAssetUrl('/'+file),expected+file,url);
}}
async function run(){
 const browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL||'msedge'});
 try{
  for(const scenario of [{name:'legacy-main-loader',width:1280},{name:'legacy-main-loader',width:375},{name:'production',width:1280},{name:'explicit-override',width:1280}]){
   const context=await browser.newContext({viewport:{width:scenario.width,height:900}}),page=await context.newPage();
   const requests=[],failures=[],errors=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failures.push([r.status(),r.url()]);});
   if(scenario.name==='explicit-override')await page.addInitScript(base=>{window.__IPAS_DEV_RAW_BASE__=base},override);
   await context.route('**/*',async route=>{
    const url=new URL(route.request().url()),href=url.origin+url.pathname;requests.push(href);
    let text,file;
    if(href===pages+'dev/')text=loader;
    else if(href===pages||href===raw+'index.html')text=html;
    else{
     const base=scenario.name==='production'?pages:scenario.name==='explicit-override'?override:raw;
     if(href.startsWith(base)){
      const relative=decodeURIComponent(href.slice(base.length));
      if(relative==='data/official-past-papers.json'||assets.includes(relative))file=path.join(root,relative);
     }
    }
    if(text!==undefined)return route.fulfill({status:200,contentType:'text/html; charset=utf-8',body:text});
    if(file)return route.fulfill({status:200,contentType:file.endsWith('.json')?'application/json':'image/png',body:fs.readFileSync(file)});
    return route.fulfill({status:404,body:'Not published at this URL'});
   });
   await page.goto(scenario.name==='production'?pages:pages+'dev/');
   await page.waitForFunction(()=>typeof loadOfficialPastBundle==='function');
   await page.evaluate(()=>loadOfficialPastBundle());
   assert.equal(await page.evaluate(()=>window.__IPAS_DEV_RAW_BASE__||null),scenario.name==='explicit-override'?override:null);
   const result=await page.evaluate(async()=>{
    const data=await loadOfficialPastBundle();let shared=0,question=0;
    switchPanel('past');
    for(const paper of pastPapers){
     await loadPastPaperById(paper.id);if(pastPaperSet.length!==50)throw Error('paper failed '+paper.id);
     for(let i=0;i<pastPaperSet.length;i++){
      const q=pastPaperSet[i];if(!q.hasVisual)continue;pastIndex=i;renderPastQuiz();
      const images=[...document.querySelectorAll('#pastQuizArea img')];
      // Trigger real browser image requests even for below-fold lazy images.
      await Promise.all(images.map(img=>{img.loading='eager';return img.decode();}));
      if(images.some(img=>!img.naturalWidth))throw Error('broken image '+q.id);
      shared+=document.querySelectorAll('#pastQuizArea .pastSharedContext img').length;
      question+=images.length-document.querySelectorAll('#pastQuizArea .pastSharedContext img').length;
     }
    }
    return {schema:data.schema_version,papers:data.papers.length,records:officialPastQuestionIndex.size,shared,question,overflow:document.documentElement.scrollWidth>innerWidth};
   });
   assert.equal(result.schema,3);assert.equal(result.papers,14);assert.equal(result.records,700);
   assert(result.shared>0&&result.question>0);assert.equal(result.overflow,false);
   assert.deepEqual(errors,[]);assert.deepEqual(failures,[]);
   const base=scenario.name==='production'?pages:scenario.name==='explicit-override'?override:raw;
   assert(requests.includes(base+'data/official-past-papers.json'));
   for(const asset of assets)assert(requests.includes(base+asset),'asset not requested: '+asset);
   assert(!requests.some(u=>u.startsWith(pages+'dev/data/')||u.startsWith(pages+'dev/assets/')));
   if(scenario.name==='production')assert(!requests.some(u=>u.startsWith(raw)));
   console.log('PASS',scenario.name,scenario.width,result,'63 images; no 404');await context.close();
  }
 }finally{await browser.close();}
}
run().then(testResolver).catch(e=>{console.error(e);process.exitCode=1;});
