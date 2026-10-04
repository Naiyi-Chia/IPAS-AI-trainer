// Regression for Issue #140: a user can have a fresh schema-v3 response cached
// under the unchanged bundle URL before loading an app that requires schema v4.
// Run with existing Playwright in NODE_PATH; BROWSER_CHANNEL defaults to installed Edge.
// node scripts/test_past_bundle_cache_upgrade.cjs
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');

const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const currentBundle=JSON.parse(fs.readFileSync(path.join(root,'data/official-past-papers.json'),'utf8'));
assert.equal(currentBundle.schema_version,4,'fixture requires current schema v4 bundle');
assert.equal(currentBundle.source?.competency_mapping_status,'verified');
assert.equal(currentBundle.source?.row_count,700);
assert.equal(currentBundle.papers?.length,14);

const staleBundle={...currentBundle,schema_version:3};
let phase='v3';
let bundleRequests=[];

const primeHtml=`<!doctype html><meta charset="utf-8"><script>
window.prime=fetch('/data/official-past-papers.json',{cache:'force-cache'}).then(r=>r.json());
</script>`;

const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://127.0.0.1');
  if(url.pathname==='/prime.html'){
    res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});
    return res.end(primeHtml);
  }
  if(url.pathname==='/'||url.pathname==='/index.html'){
    res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});
    return res.end(html);
  }
  if(url.pathname==='/data/official-past-papers.json'){
    bundleRequests.push({phase,ifNoneMatch:req.headers['if-none-match']||null,cacheControl:req.headers['cache-control']||null});
    const body=JSON.stringify(phase==='v3'?staleBundle:currentBundle);
    const etag=phase==='v3'?'"schema-v3"':'"schema-v4"';
    res.writeHead(200,{
      'Content-Type':'application/json; charset=utf-8',
      'Cache-Control':'public, max-age=31536000, immutable',
      'ETag':etag
    });
    return res.end(body);
  }
  if(url.pathname==='/data/practice-questions.json'){
    res.writeHead(200,{'Content-Type':'application/json'});
    return res.end(fs.readFileSync(path.join(root,'data/practice-questions.json')));
  }
  res.writeHead(404,{'Content-Type':'text/plain'});res.end('not found');
});

async function listen(){
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve)});
  return `http://127.0.0.1:${server.address().port}`;
}

async function run(){
  const base=await listen();
  const browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL||'msedge'});
  try{
    for(const width of [1280,375]){
      phase='v3';bundleRequests=[];
      const context=await browser.newContext({viewport:{width,height:900}});
      const page=await context.newPage();
      const errors=[];page.on('pageerror',e=>errors.push(e.message));

      await page.goto(base+'/prime.html');
      const primedSchema=await page.evaluate(()=>window.prime.then(data=>data.schema_version));
      assert.equal(primedSchema,3,'precondition: stale schema v3 must be cached');
      assert.equal(bundleRequests.length,1,'priming should make one network request');

      phase='v4';
      await page.goto(base+'/index.html');
      await page.waitForFunction(()=>DB!==null);
      const result=await page.evaluate(async()=>{
        const data=await loadOfficialPastBundle();
        switchPanel('past');
        await loadPastPaperById(pastPapers[0].id);
        return {
          schema:data.schema_version,
          papers:data.papers.length,
          records:officialPastQuestionIndex.size,
          questions:pastPaperSet.length,
          overflow:document.documentElement.scrollWidth>innerWidth
        };
      });

      assert.equal(result.schema,4,'new app must not reuse incompatible cached schema v3');
      assert.equal(result.papers,14);assert.equal(result.records,700);assert.equal(result.questions,50);
      assert.equal(result.overflow,false);assert.deepEqual(errors,[]);
      assert(bundleRequests.length>=2,'new app must revalidate/refetch the bundle instead of serving force-cache v3');
      const upgradeRequest=bundleRequests.slice(1).find(r=>r.phase==='v4');
      assert(upgradeRequest,'server must receive a v4-phase request after stale cache priming');
      console.log('PASS stale-cache upgrade',width,result,bundleRequests);
      await context.close();
    }
  }finally{
    await browser.close();
    await new Promise(resolve=>server.close(resolve));
  }
}

run().catch(async error=>{
  console.error(error);
  if(server.listening)await new Promise(resolve=>server.close(resolve));
  process.exitCode=1;
});
