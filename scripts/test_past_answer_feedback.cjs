// No browser/dependencies required. Browser contrast/layout QA is recorded separately.
// Run: node scripts/test_past_answer_feedback.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const answerCode=html.slice(html.indexOf('function answerPast('),html.indexOf('function pastNext('));
const escCode=html.slice(html.indexOf('function esc('),html.indexOf('function switchPanel('));
function element(){
  const classes=new Set();
  return {disabled:false,children:[],innerHTML:'',focused:false,
    classList:{add:s=>classes.add(s),remove:s=>classes.delete(s),contains:s=>classes.has(s)},
    appendChild(child){this.children.push(child)},focus(){this.focused=true}};
}
for(let answer=0;answer<4;answer++){
  for(let selected=0;selected<4;selected++){
    const options=Array.from({length:4},element),feedback=element();
    const question={id:'PAST-TEST-1',answer,options:['<A>','B & C','"quoted"','第四項'],
      explanation:'UNVERIFIED EXPLANATION MUST NOT BE PRESENTED AS OFFICIAL',sourceType:'iPAS 官方公告試題 PDF'};
    const original=JSON.stringify(question);
    let saves=0;
    const context={pastAnswered:false,pastIndex:0,pastPaperSet:[question],
      pastPaperMeta:{title:'Official test paper',pdf:'https://example.test/official.pdf'},
      state:{attempts:{KEEP:{correct:true}},wrong:{'PAST-TEST-1':true},bookmarks:{KEEP:true},examHistory:[{score:80}]},
      Date:{now:()=>123456789},save:()=>saves++,
      qsa:selector=>{assert.equal(selector,'#pastOpts .option');return options},
      qs:selector=>{assert.equal(selector,'#pastExplain');return feedback},
      document:{createElement:tag=>{assert.equal(tag,'span');return {}}}};
    vm.createContext(context);vm.runInContext(escCode+answerCode,context);
    context.answerPast(selected);
    assert.equal(saves,1);
    const result=context.state.attempts[question.id];
    assert.deepEqual(JSON.parse(JSON.stringify(result)),{
      correct:selected===answer,last:123456789,subject:'PAST',topic:'Official test paper'});
    assert.equal(Boolean(context.state.wrong[question.id]),selected!==answer);
    assert.deepEqual(context.state.attempts.KEEP,{correct:true});
    assert.deepEqual(context.state.bookmarks,{KEEP:true});
    assert.deepEqual(context.state.examHistory,[{score:80}]);
    assert.equal(JSON.stringify(question),original,'question content must not mutate');
    options.forEach((option,i)=>{
      assert(option.disabled,'answered options remain noninteractive');
      assert.equal(option.classList.contains('correct'),i===answer);
      assert.equal(option.classList.contains('wrong'),i===selected&&selected!==answer);
      assert.equal(option.children.length,Number(i===answer||i===selected));
    });
    assert.equal(options[answer].children[0].textContent,selected===answer?'你的答案 · 官方正解':'官方正解');
    if(selected!==answer)assert.equal(options[selected].children[0].textContent,'你的答案 · 錯誤');
    assert(feedback.focused,'keyboard focus moves to readable result');
    assert(feedback.innerHTML.includes('官方公告未提供逐選項解析'));
    assert(feedback.innerHTML.includes('來源：iPAS 官方公告試題 PDF'));
    assert(feedback.innerHTML.includes('https://example.test/official.pdf'));
    assert(!feedback.innerHTML.includes(question.explanation));
    assert(feedback.innerHTML.includes(`官方正解：</b>${'ABCD'[answer]}.`));
    assert(feedback.innerHTML.includes(`你的答案：</b>${'ABCD'[selected]}.`));
    if(answer===0||selected===0)assert(feedback.innerHTML.includes('&lt;A&gt;'));
    const saved=JSON.stringify(context.state),rendered=feedback.innerHTML;
    context.answerPast((selected+1)%4);
    assert.equal(saves,1,'repeat activation must not save or rescore');
    assert.equal(JSON.stringify(context.state),saved);
    assert.equal(feedback.innerHTML,rendered);
  }
}
console.log('PASS: all 16 answer/selection combinations, labels, escaping, source disclosure, repeat guard and progress invariants.');
