const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

const sandbox = { window: {}, structuredClone: global.structuredClone, console };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('js/movieComposer.js', 'utf8'), sandbox);
const Studio = sandbox.window.MovieStudio;
const project = {
  id: 'project-test', title: 'Nova and the Moon Key',
  world: { name: 'Galaxy Camp', genre: 'Sci-Fi', icon: '🚀', colors: ['#10245c', '#8a3fb4'] },
  character: { name: 'Nova', age: '6-8', look: '🧑‍🚀', outfit: 'Space Explorer' },
  story: { sidekick: 'Pip the Robot' }, cast: [{ name: 'Pip', look: '🤖' }],
  choices: [{ id: 'first', label: 'Follow the starlight', scene: 'arrival' }, { id: 'second', label: 'Help the moon fox', scene: 'moon-cave' }],
  currentScene: 'rescue', ending: 'The friends bring the moonlight home.',
  inventory: ['Moon Key'], plotTwist: 'The map was a song.', completed: true
};
const storyPack = { scenes: {
  arrival: { title: 'A Signal in the Sky', narration: 'Nova saw a bright signal above camp.', dialogue: 'Pip: Adventure time!', props: ['⭐'], sfx: 'sparkle' },
  'moon-cave': { title: 'The Singing Cave', narration: 'The key hummed beside the silver door.', dialogue: 'Nova: We can solve this together.', props: ['🔑'], sfx: 'mystery' },
  rescue: { title: 'Moonlight Returns', narration: 'Every star came back to the sky.', dialogue: 'Everyone: Hooray!', props: ['🌟'], sfx: 'victory' }
} };

const movie = Studio.build(project, storyPack);
assert.equal(Studio.validate(movie), movie);
assert.equal(movie.scenes[0].sceneType, 'title');
assert.equal(movie.scenes.at(-1).sceneType, 'credits');
assert(movie.scenes.some(scene => scene.title === 'The Singing Cave'));
assert(movie.scenes.every(scene => scene.duration >= 3 && scene.duration <= 20));
assert(Studio.totalDuration(movie) > 20);
assert.equal(new Set(movie.scenes.map(scene => scene.id)).size, movie.scenes.length);
const polished = Studio.quickPolish(structuredClone(movie));
assert.equal(Studio.validate(polished), polished);
assert(polished.scenes.every(scene => scene.transitionIn && scene.cameraMotion));
const imported = Studio.importText('The Secret Kite\n\nMia finds a glowing kite.\n\nThe kite flies over a cloud castle.\n\nMia helps everyone get safely home.', '9-12');
assert.equal(Studio.validate(imported), imported);
assert.equal(imported.title, 'THE SECRET KITE');
assert(imported.scenes.length >= 5);
const importedPages = Studio.importPages([
  {pageNumber:1,name:'Cover',text:'A bright door appeared.',image:'data:image/jpeg;base64,one'},
  {pageNumber:2,name:'The Journey',text:'Mia stepped through.',image:'data:image/jpeg;base64,two'},
  {pageNumber:3,name:'Home',text:'She brought the light home.',image:'data:image/jpeg;base64,three'}
], '9-12', {type:'images',title:'Mia Pages.png'});
const pageScenes = importedPages.scenes.filter(scene=>scene.sceneType==='story'||scene.sceneType==='ending');
assert.equal(pageScenes.length,3,'Each imported page must create exactly one story scene');
assert.deepEqual(pageScenes.map(scene=>scene.background.image),['data:image/jpeg;base64,one','data:image/jpeg;base64,two','data:image/jpeg;base64,three']);
assert.deepEqual(pageScenes.map(scene=>scene.title),['Cover','The Journey','Home']);
assert.equal(pageScenes.at(-1).sceneType,'ending');
console.log(`Composition smoke passed: ${movie.scenes.length} built scenes, ${imported.scenes.length} text scenes, and ${pageScenes.length} ordered page scenes.`);
