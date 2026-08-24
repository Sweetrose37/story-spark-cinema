const fs=require('fs');
const vm=require('vm');
const source=fs.readFileSync('js/app-v2.js','utf8');
const dataSource=source.slice(0,source.indexOf('const FEATURES='));
const sandbox={structuredClone};
vm.createContext(sandbox);
vm.runInContext(`${dataSource}\nglobalThis.testData={PACKS,WORLDS,STORY_OPTIONS};`,sandbox);
const {PACKS,WORLDS,STORY_OPTIONS}=sandbox.testData;
const failures=[];
const assert=(condition,message)=>{if(!condition)failures.push(message)};

assert(WORLDS.length===20,`Expected 20 worlds, found ${WORLDS.length}`);
assert(Object.keys(STORY_OPTIONS).length===6,'Story builder is missing an option category');
assert(Object.keys(PACKS).length===3,`Expected 3 story packs, found ${Object.keys(PACKS).length}`);

for(const [packId,pack] of Object.entries(PACKS)){
  const scenes=Object.values(pack.scenes);
  const endings=scenes.filter(scene=>scene.endingFlag);
  const rewards=scenes.flatMap(scene=>scene.choices||[]).filter(choice=>choice.itemReward);
  const conditional=scenes.flatMap(scene=>scene.choices||[]).filter(choice=>choice.requires);
  assert(scenes.length>=5&&scenes.length<=8,`${packId} must contain 5–8 scenes`);
  assert(endings.length>=2,`${packId} must contain at least 2 endings`);
  assert(rewards.length>=1,`${packId} must contain a collectible`);
  assert(conditional.length>=1,`${packId} must contain an inventory-gated choice`);
  assert(pack.scenes[pack.start],`${packId} start scene is missing`);
  for(const scene of scenes){
    for(const choice of scene.choices||[]){
      assert(pack.scenes[choice.nextScene],`${packId}/${scene.id} points to missing ${choice.nextScene}`);
      assert(typeof choice.starsReward==='number',`${packId}/${scene.id} has a choice without starsReward`);
    }
  }
}

if(failures.length){
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('Engine smoke test passed: 3 packs, 20 worlds, valid branches, multiple endings, collectibles, and gated choices.');
