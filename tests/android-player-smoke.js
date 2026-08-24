const fs = require('fs');
const assert = require('assert');

const app = fs.readFileSync('js/app-v2.js','utf8');
const player = fs.readFileSync('js/moviePlayer.js','utf8');
const styles = fs.readFileSync('css/styles.css','utf8');
const worker = fs.readFileSync('sw.js','utf8');
const html = fs.readFileSync('index.html','utf8');

const mobileTap = app.match(/function bindMobileTap\(element,handler\)\{[^\n]+/u)?.[0]||'';
assert(mobileTap.includes('element.onclick='), 'Android player taps are not connected to native click');
assert(!mobileTap.includes('moved'), 'Android player taps are still canceled by finger movement');
assert(!mobileTap.includes('onpointermove'), 'Android player controls still use a fragile pointer movement filter');

const playBody = player.match(/play\(\)\{[^\n]+/u)?.[0]||'';
assert(playBody.indexOf('this.startMusic()')<playBody.indexOf('this.draw()'), 'Android music starts too late in the user gesture');
assert(playBody.includes('setInterval(()=>this.tick(),100)'), 'The visual scene timer is not started');
assert(player.includes("if(this.playing){screen.classList.add('scene-running')"), 'PNG motion still depends on a throttled Android animation-frame callback');
assert(!player.includes("requestAnimationFrame(()=>screen.classList.add('scene-running'))"), 'Android scene motion can still be delayed indefinitely');
assert(player.includes("document.querySelector('#movieScreen')?.classList.remove('scene-running')"), 'Pause leaves visual motion running');
assert(styles.includes('.scene-running .movie-pdf-art{animation:artKenBurns'), 'PNG and PDF artwork has no visible playback motion');
assert(html.includes('js/moviePlayer.js?v=5.2'), 'Repaired player script is not cache-busted');
assert(html.includes('css/styles.css?v=5.2'), 'Repaired player animation styles are not cache-busted');
assert(worker.includes("const CACHE='story-spark-mobile-v9'"), 'Installed Android app will not receive the repaired player');

for(const music of ['adventure','calm','comedy','emotional','epic','happy','magical','mystery','space','spooky-cute','victory']){
  assert(worker.includes(`'./assets/audio/music/${music}.wav'`), `${music} music is unavailable offline`);
}

console.log('Android player smoke passed: native taps, immediate music unlock, scene timer, PNG motion, pause behavior, audio cache, and cache-busting are connected.');
