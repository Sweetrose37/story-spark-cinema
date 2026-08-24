const fs=require('fs');
const vm=require('vm');
const source=fs.readFileSync('js/app-v2.js','utf8');
const dataSource=source.slice(0,source.indexOf('const FEATURES='));
const sandbox={structuredClone};
vm.createContext(sandbox);
vm.runInContext(`${dataSource}\nglobalThis.PACKS_OUT=PACKS;`,sandbox);
const PACKS=sandbox.PACKS_OUT;

function play(packId,chooser){
  const pack=PACKS[packId],inventory=[],history=[];
  let id=pack.start,stars=0;
  for(let turn=0;turn<12;turn++){
    const scene=pack.scenes[id];
    if(!scene)throw new Error(`${packId}: missing scene ${id}`);
    if(scene.endingFlag)return {ending:scene.endingFlag,inventory,history,stars};
    const available=(scene.choices||[]).filter(c=>!c.requires||inventory.includes(c.requires));
    if(!available.length)throw new Error(`${packId}/${id}: no available choice`);
    const choice=chooser(available,scene,inventory,turn)||available[0];
    history.push({scene:id,choice:choice.text});
    if(choice.itemReward&&!inventory.includes(choice.itemReward))inventory.push(choice.itemReward);
    stars+=choice.starsReward;
    id=choice.nextScene;
  }
  throw new Error(`${packId}: playthrough did not reach an ending`);
}

for(const id of Object.keys(PACKS)){
  const first=play(id,choices=>choices[0]);
  const alternate=play(id,choices=>choices[choices.length-1]);
  if(!first.ending||!alternate.ending)throw new Error(`${id}: ending missing`);
  if(!first.inventory.length&&!alternate.inventory.length)throw new Error(`${id}: no item collected`);
  if(first.history.length<2||alternate.history.length<2)throw new Error(`${id}: story is too short`);
  console.log(`${id}: ${first.ending} / ${alternate.ending}; items ${[...new Set([...first.inventory,...alternate.inventory])].join(', ')}`);
}

function reachableEndings(pack){
  const endings=new Set(),queue=[{id:pack.start,items:[],depth:0}],seen=new Set();
  while(queue.length){
    const state=queue.shift(),scene=pack.scenes[state.id];
    const key=`${state.id}|${state.items.slice().sort().join(',')}`;
    if(seen.has(key)||state.depth>10)continue;
    seen.add(key);
    if(scene.endingFlag){endings.add(scene.endingFlag);continue;}
    for(const choice of scene.choices||[]){
      if(choice.requires&&!state.items.includes(choice.requires))continue;
      const items=[...state.items];
      if(choice.itemReward&&!items.includes(choice.itemReward))items.push(choice.itemReward);
      queue.push({id:choice.nextScene,items,depth:state.depth+1});
    }
  }
  return endings;
}
for(const [id,pack] of Object.entries(PACKS)){
  const endings=reachableEndings(pack);
  if(endings.size<2)throw new Error(`${id}: fewer than two reachable endings`);
  console.log(`${id}: reachable endings → ${[...endings].join(', ')}`);
}
console.log('Playable path smoke test passed.');
