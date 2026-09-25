// Runs the shipped extraction/cleanup/parser, not a second implementation.
// node scripts/audit_official_pdf.cjs INPUT_DIR [BASELINE_HTML]
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),dir=path.resolve(process.argv[2]||'tmp/official-audit');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const mirror=JSON.parse(fs.readFileSync(path.join(dir,'mirror.html'),'utf8').match(/window\.APP_DATA\s*=\s*([\s\S]*?)\s*;\s*<\/script>/)[1]);
const pdfjs=require(path.join(dir,'pdf.js'));
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
function between(s,a,b){assert(s.includes(a)&&s.includes(b));return s.slice(s.indexOf(a),s.indexOf(b));}
function app(source){
  const context={console,window:{pdfjsLib:pdfjs},officialMirrorData:mirror,
    localStorage:{getItem:()=>null,setItem:()=>{}},state:{attempts:{}}};
  vm.createContext(context);
  const snippets=[between(source,'const OFFICIAL_PDF_BASE','const officialPdf')+'const officialPdf = filename => OFFICIAL_PDF_BASE + encodeURIComponent(filename);',
    between(source,'const pastPapers','const state'),
    between(source,'function getPastCache','function renderPastPapers'),
    between(source,'async function extractPdfTextFromBuffer','async function fetchArrayBufferWithFallback').replace('await ensurePdfJs();',''),
    between(source,'function mirrorExamName','async function prewarmOfficialCache'),
    between(source,'function cleanMirrorQuestion','async function fetchPaperText'),
    between(source,source.includes('function cleanOfficialPageFurniture')?'function cleanOfficialPageFurniture':'function parseOfficialPastPaper','function renderPastQuiz')];
  vm.runInContext(snippets.join('\n')+'\nthis.papers=pastPapers;',context);
  return context;
}
const current=app(html),baseline=process.argv[3]?app(fs.readFileSync(process.argv[3],'utf8')):null;
const compact=s=>s.normalize('NFKC').replace(/[^\p{L}\p{N}]/gu,'');
const fields=q=>[q.question,...q.options];
const suspicious=/公告\s*試\s*題|考試日期\s*[:：]|第\s*[一二三]\s*科\s*[:：]|第\s*\d+\s*頁\s*[,，]?\s*共|答\s*案\s*題\s*目|答\s*題\s*目\s*案/;
const rows=[],summary=[];
function compare(paper,route,oldResult,result,pdfQuestions){
  const seen=new Set();
  for(const q of result.questions){
    assert(!seen.has(q.number),`${paper.id}: duplicate number`);seen.add(q.number);
    assert.equal(q.options.length,4);assert(q.answer>=0&&q.answer<4);
    fields(q).forEach(v=>assert(!suspicious.test(v),`${paper.id}/${q.number}: residual furniture`));
    const previous=oldResult?.questions.find(x=>x.number===q.number);
    if(!previous)continue;
    assert.equal(q.id,previous.id,`${paper.id}/${q.number}: ID changed`);
    assert.equal(q.answer,previous.answer,`${paper.id}/${q.number}: key changed`);
    fields(q).forEach((v,i)=>{
      if(v===fields(previous)[i])return;
      // Match by stem rather than mirror row index: legacy mirror numbering may differ.
      const candidates=pdfQuestions.filter(x=>route==='pdf'?x.number===q.number:compact(x.question).startsWith(compact(q.question).slice(0,60)));
      assert.equal(candidates.length,1,`${paper.id}/${q.number}: ambiguous source question`);
      const official=candidates[0];
      assert.equal(q.answer,official.answer,`${paper.id}/${q.number}: official key mismatch`);
      rows.push({paper:paper.id,route,appNumber:q.number,officialNumber:official.number,
        field:['question','A','B','C','D'][i],answer:'ABCD'[q.answer],
        before:fields(previous)[i],after:v});
    });
  }
  if(oldResult)assert.deepEqual(Array.from(result.questions,q=>q.number),Array.from(oldResult.questions,q=>q.number));
}
async function run(){
  assert.equal(current.papers.length,14);
  // Positive and negative controls: no broad deletion of subject/date/page mentions.
  const keep=['某 AI 應用規劃師處理公告與試題。','第 20 頁的責任條款','考試日期: 115 年 08 月 15 日','第一科:人工智慧基礎概論','答案與題目','【公告】','0.5','資料表中的頁碼'];
  for(const s of keep)assert.equal(current.cleanOfficialPageFurniture(s),s);
  assert.equal(current.cleanOfficialPageFurniture('非結答題目案構化'),'非結構化');
  assert.equal(current.cleanOfficialPageFurniture('功答案題目能'),'功能');
  assert.equal(current.cleanOfficialPageFurniture('第 2 頁，共 15 頁').trim(),'');
  const valid={meta:{contentVersion:1},questions:[]};
  current.localStorage.getItem=()=>JSON.stringify({old:{meta:{},questions:[]},valid});
  assert.deepEqual(Object.keys(current.getPastCache()),['valid']);
  current.state.attempts={'PAST-115-3-L11-4':{correct:true}};
  assert.equal(current.paperProgress({id:'115-3-L11'}).correct,1);
  for(const paper of current.papers){
    const buffer=fs.readFileSync(path.join(dir,paper.id+'.pdf'));
    const raw=await current.extractPdfTextFromBuffer(new Uint8Array(buffer));
    // Read answer/number cells directly, including rows the option parser cannot parse.
    const sourceText=current.cleanOfficialPageFurniture(raw);
    const cells=[...sourceText.matchAll(/(?:^|\n)\s*([ABCD])\s*(\d{1,3})\.\s*/g)];
    const officialQuestions=cells.map((m,i)=>({number:Number(m[2]),answer:'ABCD'.indexOf(m[1]),
      question:sourceText.slice(m.index+m[0].length,cells[i+1]?.index??sourceText.length).split(/\(A\)/)[0]}));
    const result=current.parseOfficialPastPaper(raw,paper.file);
    const oldResult=baseline?.parseOfficialPastPaper(raw,paper.file);
    compare(paper,'pdf',oldResult,result,officialQuestions);
    const structured=await current.loadPaperFromStructuredMirror(paper);
    const oldStructured=baseline?await baseline.loadPaperFromStructuredMirror(paper):null;
    if(structured)compare(paper,'mirror',oldStructured,structured,officialQuestions);
    const active=structured||result;
    assert.equal(active.questions.length,50,`${paper.id}: active route count`);
    summary.push({paper:paper.id,pdfQuestions:result.questions.length,activeQuestions:active.questions.length,
      pdfSha256:sha(buffer),changes:rows.filter(r=>r.paper===paper.id).length});
    if(paper.id==='115-3-L11'){
      const q=result.questions.find(q=>q.number===4);
      assert.equal(q.answer,2);
      assert.equal(q.question.replace(/\s+/g,' '),'某銀行導入 AI 信用貸款評分系統上線半年後,風險稽核部門發現,即使模型訓練 資料中已不包含「職業別」欄位,仍可能透過「居住地區」與「消費類別」等高度 相關特徵,對特定職業族群產生不合理差異待遇。依據 AI 治理精神,銀行應優先 採取下列何種行動?');
      assert.equal(q.options[1],'提高「居住地區」與「消費類別」兩項特徵的資料準確度,以強化該模型整體的 預測效度 ;');
      assert.equal(q.options[3],'於核貸結果中另行加註該職業別標籤,以作為日後申 請人提出申訴時的佐證依 據');
      assert.equal(q.options[0],'增設人工複核關卡,由授信人員針對系統所有的核貸結果重新逐案審查 ;');
      assert.equal(q.options[2],'引入公平性評估指標,檢視間接關聯特徵是否造成偏誤並對模型進行調整優化 ;');
    }
    fs.writeFileSync(path.join(dir,paper.id+'.clean.json'),JSON.stringify(active,null,2));
  }
  fs.writeFileSync(path.join(dir,'audit.json'),JSON.stringify({summary,rows,mirrorSha256:sha(fs.readFileSync(path.join(dir,'mirror.html')))},null,2));
  console.log(JSON.stringify(summary,null,2));
  console.log(`PASS: 14 papers / 700 active records; furniture, Q4 and cache checks.`);
  if(baseline)console.log(`PASS: ${rows.length} changed fields; IDs/counts/keys unchanged; affected keys checked against PDF rows.`);
}
run().catch(e=>{console.error(e);process.exitCode=1});
