// Regression: first answer must refresh both visible answered counts without navigation.
// Run: node scripts/test_past_answer_count.cjs [path/to/index.html]
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const html = fs.readFileSync(process.argv[2] || path.join(__dirname, '..', 'index.html'), 'utf8');
function section(start, end) { return html.slice(html.indexOf(start), html.indexOf(end)); }
const code = section('function currentPastProgress(', 'function pastScrollBehavior(')
  + section('function renderPastQuiz(', 'function pastNext(');
for (const selected of [0, 1]) {
  const nodes = {};
  const area = {set innerHTML(value) {
    // Capture the actual rendered spans, including the original span without an ID.
    for (const match of value.matchAll(/<(span|div)\b([^>]*)>([^<]*)<\/\1>/g)) {
      const id = match[2].match(/id="([^"]+)"/);
      if (id) nodes['#' + id[1]] = {textContent: match[3]};
      if (match[3].startsWith('已作答：')) this.count = id ? nodes['#' + id[1]] : {textContent: match[3]};
    }
  }};
  const options = Array.from({length: 4}, () => ({classList: {add() {}}, appendChild() {}}));
  const context = {
    pastPaperSet: Array.from({length: 50}, (_, i) => ({id: `TEST-${i}`, number: i + 1,
      question: 'Test', options: ['A', 'B', 'C', 'D'], answer: 0})),
    pastPaperMeta: {title: 'Test paper', pdf: '#'}, pastIndex: 0, pastAnswered: false,
    state: {attempts: {}, wrong: {}}, save() {}, esc: String,
    renderPastSharedContext: () => '', renderPastVisuals: () => '',
    qs: selector => selector === '#pastQuizArea' ? area : selector === '#pastOpts' ? {focus() {}} : nodes[selector],
    qsa: () => options, document: {createElement: () => ({})}
  };
  vm.createContext(context);
  vm.runInContext(code, context);
  context.renderPastQuiz();
  assert.equal(area.count.textContent, '已作答：0/50 題');
  context.answerPast(selected);
  assert.equal(area.count.textContent, '已作答：1/50 題', 'first answer refreshes inline count immediately');
  assert.match(nodes['#pastScoreStatus'].textContent, /^已作答 1 題/);
  assert.equal(context.pastIndex, 0, 'no navigation required');
  context.answerPast(selected);
  assert.equal(area.count.textContent, '已作答：1/50 題', 'duplicate activation does not increment');
  context.pastAnswered = false;
  context.answerPast(1 - selected);
  assert.equal(area.count.textContent, '已作答：1/50 題', 're-answer does not double count');
}
console.log('PASS: first correct/wrong answer refreshes both counts; duplicate/re-answer stays at 1/50.');
