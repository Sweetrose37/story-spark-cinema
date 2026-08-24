const fs = require('fs');
const assert = require('assert');
const vm = require('vm');

const app = fs.readFileSync('js/app-v2.js','utf8');
const player = fs.readFileSync('js/moviePlayer.js','utf8');
const styles = fs.readFileSync('css/styles.css','utf8');
const worker = fs.readFileSync('sw.js','utf8');
const html = fs.readFileSync('index.html','utf8');

const mobileTap = app.match(/function bindMobileTap\(element,handler\)\{[^\n]+/u)?.[0]||'';
assert(mobileTap.includes('element.onclick='), 'Android player taps are not connected to native click');
assert(!mobileTap.includes('moved'), 'Android player taps are still canceled by finger movement');
assert(mobileTap.includes('element.onpointerdown=begin'), 'Android player does not begin tracking a normal tap');
assert(mobileTap.includes('element.onpointerup=finish'), 'Android playback does not activate on a normal tap release');
assert(mobileTap.includes('element.ontouchstart='), 'Android playback has no legacy touch-start fallback');
assert(mobileTap.includes('element.ontouchend=finish'), 'Android playback has no legacy touch-end activation');
assert(mobileTap.includes('event.preventDefault()'), 'Android compatibility click can fire after direct touch activation');
assert(mobileTap.includes('let active=false,suppressClick=false,releaseTimer=null'), 'Android player controls have no one-touch activation latch');
assert(mobileTap.includes('if(suppressClick){suppressClick=false;clearTimeout(releaseTimer);return}'), 'Android compatibility click is not consumed after touch playback starts');
assert(!mobileTap.includes('Date.now'), 'Android click suppression still expires before a slow touch finishes');

let releaseLatch=null;
const touchSandbox={window:{PointerEvent:function PointerEvent(){}},setTimeout(fn){releaseLatch=fn;return 1},clearTimeout(){}};
vm.createContext(touchSandbox);vm.runInContext(`${mobileTap};this.bindMobileTap=bindMobileTap`,touchSandbox);
let touchCount=0,prevented=false;const touchElement={disabled:false};
touchSandbox.bindMobileTap(touchElement,()=>touchCount+=1);
touchElement.onpointerdown({pointerType:'touch',preventDefault(){prevented=true}});
assert.equal(touchCount,0,'Player activates before a normal Android tap is released');
touchElement.onpointerup({pointerType:'touch',preventDefault(){prevented=true}});
touchElement.onclick({type:'click'});
assert.equal(touchCount,1,'One Android tap fires the player more than once');
assert(prevented,'Direct Android touch does not suppress the delayed compatibility click');
let keyboardCount=0;const keyboardElement={disabled:false};
touchSandbox.bindMobileTap(keyboardElement,()=>keyboardCount+=1);keyboardElement.onclick({type:'click'});
assert.equal(keyboardCount,1,'Keyboard and accessibility clicks no longer activate the player');

const playBody = player.match(/play\(\)\{[^\n]+/u)?.[0]||'';
assert(playBody.indexOf('this.startMusic()')<playBody.indexOf('this.draw()'), 'Android music starts too late in the user gesture');
assert(playBody.includes('setInterval(()=>this.tick(),100)'), 'The visual scene timer is not started');
assert(player.includes("if(this.playing){screen.classList.add('scene-running')"), 'PNG motion still depends on a throttled Android animation-frame callback');
assert(!player.includes("requestAnimationFrame(()=>screen.classList.add('scene-running'))"), 'Android scene motion can still be delayed indefinitely');
assert(player.includes("document.querySelector('#movieScreen')?.classList.remove('scene-running')"), 'Pause leaves visual motion running');
assert(styles.includes('.scene-running .movie-pdf-art{animation:artKenBurns'), 'PNG and PDF artwork has no visible playback motion');
assert(html.includes('js/moviePlayer.js?v=5.2'), 'Repaired player script is not cache-busted');
assert(html.includes('css/styles.css?v=5.5'), 'Repaired player animation styles are not cache-busted');
assert(worker.includes("const CACHE='story-spark-mobile-v18'"), 'Installed Android app will not receive the repaired player');
assert(html.includes('js/app-v2.js?v=5.8'), 'Quick-tap player controller is not cache-busted');

for(const music of ['adventure','calm','comedy','emotional','epic','happy','magical','mystery','space','spooky-cute','victory']){
  assert(worker.includes(`'./assets/audio/music/${music}.wav'`), `${music} music is unavailable offline`);
}

console.log('Android player smoke passed: native taps, immediate music unlock, scene timer, PNG motion, pause behavior, audio cache, and cache-busting are connected.');
