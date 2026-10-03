from pathlib import Path
import re

path = Path("index.html")
text = path.read_text(encoding="utf-8")
original = text


def db_line(source):
    for line in source.splitlines(keepends=True):
        if line.startswith("const DB ="):
            return line
    raise SystemExit("embedded DB line not found")


def replace_once(old, new, label):
    global text
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected 1 match, found {count}")
    text = text.replace(old, new, 1)


def regex_replace_once(pattern, replacement, label):
    global text
    text, count = re.subn(pattern, replacement, text, count=1, flags=re.S)
    if count != 1:
        raise SystemExit(f"{label}: expected 1 match, found {count}")


db_before = db_line(text)

replace_once(
    ".pastQuizStatus{display:flex;align-items:center;gap:10px;min-height:42px;margin:10px 0 8px;padding:9px 11px;border:1px solid var(--line);border-radius:10px;background:#f8fafc;font-size:14px;font-weight:700}\n.notice{",
    ".pastQuizStatus{display:flex;align-items:center;gap:10px;min-height:42px;margin:10px 0 8px;padding:9px 11px;border:1px solid var(--line);border-radius:10px;background:#f8fafc;font-size:14px;font-weight:700}\n.pastQuestionStart{scroll-margin-top:72px}\n.pastQuestionFacts{display:flex;flex-wrap:wrap;gap:6px 14px;margin:8px 0 10px;color:var(--muted);font-size:13px}\n.pastQuestionFacts span{white-space:nowrap}\n.pastMobileNav{display:none}\n.notice{",
    "past base CSS",
)

replace_once(
    "  .pastQuizStatus{align-items:flex-start;line-height:1.45}\n  .navrow>div{display:flex;gap:7px}",
    "  .pastQuizStatus{align-items:flex-start;line-height:1.45}\n  .pastQuestionFacts{gap:5px 10px}\n  .pastMobileNav{display:flex;justify-content:space-between;align-items:center;gap:8px;margin:2px 0 12px;padding:8px 0 10px;border-bottom:1px solid var(--line)}\n  .pastMobileNav .controls{flex-wrap:nowrap}\n  .pastMobileNav .btn{min-height:42px;padding:8px 10px}\n  .navrow>div{display:flex;gap:7px}",
    "past mobile CSS",
)

replace_once(
    """function updatePastProgressStatus(){
  const el=qs('#pastScoreStatus');
  if(el)el.textContent=pastProgressText();
}
function exitPastQuiz(){""",
    """function pastQuestionStateText(){
  const q=pastPaperSet[pastIndex];
  const prior=q?state.attempts[q.id]:null;
  return prior?`本題目前紀錄：${prior.correct?'✓ 正確':'✕ 錯誤'}`:'本題尚未作答';
}
function updatePastProgressStatus(){
  const el=qs('#pastScoreStatus');
  if(el)el.textContent=pastProgressText();
}
function updatePastQuestionState(){
  const el=qs('#pastQuestionState');
  if(el)el.textContent=pastQuestionStateText();
}
function pastScrollBehavior(){
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth';
}
function focusPastQuestionStart(){
  setTimeout(()=>{
    const target=qs('#pastQuestionStart');
    if(!target)return;
    target.scrollIntoView({behavior:pastScrollBehavior(),block:'start'});
    target.focus({preventScroll:true});
  },0);
}
function focusPastCompletion(){
  setTimeout(()=>{
    const target=qs('#pastCompletion');
    if(!target)return;
    target.scrollIntoView({behavior:pastScrollBehavior(),block:'start'});
    target.focus({preventScroll:true});
  },0);
}
function showPastQuizView(){
  qs('#past').innerHTML='<div id="pastQuizArea"></div>';
  renderPastQuiz();
}
function exitPastQuiz(){""",
    "past progress and focus helpers",
)

replace_once(
    '<div class="qmeta"><span class="qmetaPrimary">${p.year} 年 ${p.session} · ${p.subject}</span><span class="qmetaSecondary">${p.level} · 內建 verified 題庫</span></div>',
    '<div class="qmeta"><span class="qmetaPrimary">${p.year} 年 ${p.session} · ${p.subject}</span><span class="qmetaSecondary">${p.level}</span></div>',
    "paper metadata",
)

replace_once(
    """      <div class="notice" style="margin-top:12px"><b>已內建 verified 官方題庫：</b>700 題直接由產品內的 canonical dataset 載入，不再於作答時下載或解析官方 PDF；官方 PDF 連結仍保留供來源核對。</div>
      <div id="pastLoadStatus" class="small" style="margin-top:8px"></div>
    </div>
    <div id="pastQuizArea"></div>""",
    """      <div id="pastLoadStatus" class="small" role="status" aria-live="polite" style="margin-top:8px"></div>
    </div>""",
    "list technical notice and embedded quiz area",
)

regex_replace_once(
    r"async function loadPastPaperById\(id\)\{.*?function renderPastSharedContext",
    """async function loadPastPaperById(id){
  const paper=pastPapers.find(p=>p.id===id);
  if(!paper)return;
  const status=qs("#pastLoadStatus");
  try{
    status.textContent=`正在開啟 ${paper.year} 年 ${paper.session} ${paper.subject}…`;
    const parsed=await getBundledPastPaper(paper);
    pastPaperSet=parsed.questions;pastPaperMeta=parsed.meta;pastAnswered=false;
    const firstUnanswered=pastPaperSet.findIndex(q=>!state.attempts[q.id]);
    pastIndex=firstUnanswered>=0?firstUnanswered:0;
    showPastQuizView();
    focusPastQuestionStart();
  }catch(err){
    console.error(err);
    status.innerHTML=`<span class="bad">暫時無法開卷：</span>${esc(err.message||String(err))}　<a href="${paper.pdf}" target="_blank" rel="noopener">查看官方 PDF</a>`;
  }
}
function renderPastSharedContext""",
    "loadPastPaperById",
)

regex_replace_once(
    r"function renderPastQuiz\(\)\{.*?function answerPast",
    """function renderPastQuiz(){
  const area=qs('#pastQuizArea');
  if(!area)return;
  if(!pastPaperSet.length){
    area.innerHTML='';
    return;
  }
  const q=pastPaperSet[pastIndex];
  const prog=currentPastProgress();
  area.innerHTML=`<div class="card questionCard officialQuestion" style="margin-bottom:12px">
    <div class="pastQuizTop pastQuestionStart" id="pastQuestionStart" tabindex="-1" aria-label="第 ${q.number} 題開始">
      <div class="qmeta"><span class="qmetaPrimary">官方考古題 · 第 ${q.number} 題</span><span class="qmetaSecondary">${esc(pastPaperMeta?.title||'')}</span></div>
      <button class="btn secondary pastExitBtn" onclick="exitPastQuiz()">← 返回考卷列表</button>
    </div>
    <div id="pastScoreStatus" class="pastQuizStatus" role="status" aria-live="polite">${pastProgressText()}</div>
    <div class="pastQuestionFacts">
      <span>題目位置：第 ${pastIndex+1}/${pastPaperSet.length} 題</span>
      <span>已作答：${prog.answered}/${pastPaperSet.length} 題</span>
      <span id="pastQuestionState" aria-live="polite">${pastQuestionStateText()}</span>
      <span><a href="${pastPaperMeta?.pdf||'#'}" target="_blank" rel="noopener">核對官方原題 PDF</a></span>
    </div>
    <div class="pastMobileNav" aria-label="考古題快速導覽">
      <span class="small"><b>第 ${pastIndex+1}/${pastPaperSet.length} 題</b></span>
      <div class="controls"><button class="btn secondary" onclick="pastPrev()" ${pastIndex===0?"disabled":""}>上一題</button><button class="btn primary" onclick="pastNext()">${pastIndex===pastPaperSet.length-1?"完成":"下一題"}</button></div>
    </div>
    <div class="progress" role="progressbar" aria-label="目前題目位置" aria-valuemin="1" aria-valuemax="${pastPaperSet.length}" aria-valuenow="${pastIndex+1}"><div style="width:${(pastIndex+1)/pastPaperSet.length*100}%"></div></div>
    ${renderPastSharedContext(q)}
    <div class="qtext" tabindex="-1">${esc(q.question)}</div>
    ${renderPastVisuals(q)}
    <div id="pastOpts" role="group" aria-label="作答選項" tabindex="-1">${q.options.map((o,i)=>`<button class="option" data-i="${i}"><b>${String.fromCharCode(65+i)}.</b> ${esc(o)}</button>`).join('')}</div>
    <div class="navrow">
      <div><button class="btn secondary" onclick="pastPrev()" ${pastIndex===0?"disabled":""}>上一題</button> <button class="btn secondary" onclick="reportPastQuestion()">回報此題</button></div>
      <div><button class="btn secondary" onclick="restartPastQuiz()">重新作答本份</button> <button class="btn primary" onclick="pastNext()">${pastIndex===pastPaperSet.length-1?"完成這份":"下一題"}</button></div>
    </div>
  </div>`;
  qsa('#pastOpts .option').forEach(b=>b.onclick=()=>answerPast(+b.dataset.i));
}

function answerPast""",
    "renderPastQuiz",
)

replace_once(
    """  updatePastProgressStatus();
  qsa('#pastOpts .option').forEach((b,idx)=>{""",
    """  updatePastProgressStatus();
  updatePastQuestionState();
  qsa('#pastOpts .option').forEach((b,idx)=>{""",
    "answer state refresh",
)

regex_replace_once(
    r"function pastNext\(\)\{.*?function getQuestionById",
    """function pastNext(){
  if(!pastPaperSet.length)return;
  if(pastIndex<pastPaperSet.length-1){
    pastIndex++;pastAnswered=false;renderPastQuiz();focusPastQuestionStart();
  }else{
    const answered=pastPaperSet.filter(q=>state.attempts[q.id]).length;
    const correct=pastPaperSet.filter(q=>state.attempts[q.id]&&state.attempts[q.id].correct).length;
    const score=answered?Math.round(correct/pastPaperSet.length*100):0;
    qs('#pastQuizArea').innerHTML=`<div class="card questionCard" id="pastCompletion" tabindex="-1"><h3>這份官方考古題完成了</h3><div class="kpi ${score>=70?'good':'bad'}">${score} 分</div><p>${correct}/${pastPaperSet.length} 題正確。作答紀錄已保留在此裝置，你可以返回考卷列表選其他考卷，或重新作答本份。</p><div class="controls"><button class="btn secondary" onclick="exitPastQuiz()">返回考卷列表</button><button class="btn primary" onclick="restartPastQuiz()">重新作答這份</button></div></div>`;
    focusPastCompletion();
  }
}
function pastPrev(){
  if(pastIndex>0){pastIndex--;pastAnswered=false;renderPastQuiz();focusPastQuestionStart();}
}
function restartPastQuiz(){
  pastIndex=0;pastAnswered=false;
  if(!qs('#pastQuizArea'))qs('#past').innerHTML='<div id="pastQuizArea"></div>';
  renderPastQuiz();focusPastQuestionStart();
}

function getQuestionById""",
    "past navigation",
)

if db_line(text) != db_before:
    raise SystemExit("embedded self-authored DB changed unexpectedly")

for forbidden in (
    "已內建 verified 官方題庫",
    "canonical dataset",
    "內建 verified 題庫載入成功",
):
    if forbidden in text:
        raise SystemExit(f"implementation-facing copy still present: {forbidden}")

for marker in (
    "function showPastQuizView()",
    'id="pastQuestionStart"',
    'id="pastQuestionState"',
    "pastMobileNav",
    'id="pastCompletion"',
):
    if marker not in text:
        raise SystemExit(f"missing Issue #109 marker: {marker}")

if text == original:
    raise SystemExit("patch produced no changes")

path.write_text(text, encoding="utf-8")
print("Issue #109 patch applied; embedded DB unchanged")
