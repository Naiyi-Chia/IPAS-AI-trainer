const assert=require("node:assert/strict");
const MAPS={
  "114-4-L11":Object.fromEntries([...Array(50)].map((_,i)=>{const n=i+1;return [n,n<=3?n:(n===50?4:n+1)]})),
  "114-2-L23":Object.assign(Object.fromEntries([...Array(39)].map((_,i)=>[i+1,i+1])),{40:41,41:42,42:43,43:44,44:46,45:47,46:48,47:49,48:50,49:40,50:45})
};
function remap(store,paperId,mapping){
  const source={...(store||{})},next={...(store||{})};
  Object.keys(mapping).forEach(oldNo=>delete next[`PAST-${paperId}-${oldNo}`]);
  Object.entries(mapping).forEach(([oldNo,newNo])=>{const oldKey=`PAST-${paperId}-${oldNo}`;if(Object.prototype.hasOwnProperty.call(source,oldKey))next[`PAST-${paperId}-${newNo}`]=source[oldKey]});
  return next;
}
function migrate(input){
  if(Number(input.migrations?.officialPastCanonical||0)>=2)return structuredClone(input);
  const state=structuredClone(input);
  for(const [paperId,mapping] of Object.entries(MAPS)){
    state.attempts=remap(state.attempts,paperId,mapping);
    state.wrong=remap(state.wrong,paperId,mapping);
    state.bookmarks=remap(state.bookmarks,paperId,mapping);
  }
  state.migrations={...(state.migrations||{}),officialPastCanonical:2};
  return state;
}
for(const mapping of Object.values(MAPS)){
  const targets=Object.values(mapping).map(Number).sort((a,b)=>a-b);
  assert.deepEqual(targets,[...Array(50)].map((_,i)=>i+1),"mapping must be bijective");
}
const original={
  attempts:{"PAST-114-4-L11-4":{correct:true,last:44,subject:"PAST"},"PAST-114-4-L11-50":{correct:false,last:50},"PAST-114-2-L23-40":{correct:false,last:40},"PAST-114-2-L23-49":{correct:true,last:49},"PAST-115-1-L11-7":{correct:true,last:7}},
  wrong:{"PAST-114-4-L11-4":true,"PAST-114-2-L23-49":true,"PAST-115-1-L11-7":true},
  bookmarks:{"PAST-114-4-L11-50":{note:"legacy"},"PAST-115-1-L11-7":true},
  examHistory:[{score:88,date:1}]
};
const once=migrate(original);
assert.deepEqual(once.attempts["PAST-114-4-L11-5"],original.attempts["PAST-114-4-L11-4"]);
assert.deepEqual(once.attempts["PAST-114-4-L11-4"],original.attempts["PAST-114-4-L11-50"]);
assert.deepEqual(once.attempts["PAST-114-2-L23-41"],original.attempts["PAST-114-2-L23-40"]);
assert.deepEqual(once.attempts["PAST-114-2-L23-40"],original.attempts["PAST-114-2-L23-49"]);
assert.deepEqual(once.attempts["PAST-115-1-L11-7"],original.attempts["PAST-115-1-L11-7"],"unaffected attempt changed");
assert.deepEqual(once.wrong["PAST-115-1-L11-7"],original.wrong["PAST-115-1-L11-7"],"unaffected wrong changed");
assert.deepEqual(once.bookmarks["PAST-115-1-L11-7"],original.bookmarks["PAST-115-1-L11-7"],"unaffected bookmark changed");
assert.deepEqual(once.examHistory,original.examHistory,"examHistory changed");
assert.equal(once.migrations.officialPastCanonical,2);
assert.deepEqual(migrate(once),once,"migration is not idempotent");
console.log("PASS: #72 progress migration mapping, preservation, and idempotence");
