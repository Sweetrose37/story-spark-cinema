const fs=require('fs');
const assert=require('assert');
const vm=require('vm');

const html=fs.readFileSync('index.html','utf8');
const mobile=fs.readFileSync('js/mobileMoviePlayer.js','utf8');
const styles=fs.readFileSync('css/styles.css','utf8');
const worker=fs.readFileSync('sw.js','utf8');

assert(html.indexOf('js/moviePlayer.js?v=5.2')<html.indexOf('js/mobileMoviePlayer.js?v=1.0'),'Dedicated mobile player must wrap the loaded desktop player');
assert(html.includes('css/styles.css?v=5.5'),'Dedicated mobile player styles are not cache-busted');
assert(worker.includes("'./js/mobileMoviePlayer.js?v=1.0'"),'Dedicated mobile player is unavailable offline');
assert(worker.includes("const CACHE='story-spark-mobile-v19'"),'Installed phones will not receive the dedicated player');
assert(mobile.includes("matchMedia('(max-width:760px), (pointer:coarse)').matches"),'Phone and coarse-pointer detection is missing');
assert(mobile.includes('window.DesktopCinemaPlayer=desktop;window.MobileCinemaPlayer=mobile'),'Desktop and mobile player engines are not independently exposed');
assert(mobile.includes('button.onclick=event=>'),'Mobile controls do not use native click activation');
assert(!mobile.includes('onpointerdown'),'Mobile player still depends on desktop pointer-down handling');
assert(!mobile.includes('onpointerup'),'Mobile player still depends on press-and-hold pointer handling');
assert(mobile.includes('this.audio.play().catch'),'Android audio is not started directly from the native Play click');
assert(mobile.includes('setInterval(()=>this.tick(),100)'),'Dedicated mobile scene clock is missing');
assert(mobile.includes("scene.background?.image||''"),'Dedicated player does not read imported PDF/image artwork');
assert(mobile.includes('class="mobile-book-page"'),'Imported book pages are not rendered by the mobile player');
assert(mobile.includes('playsinline'),'Mobile media element is not configured for inline phone playback');
assert(styles.includes('.mobile-native-player'),'Dedicated phone player layout is missing');
assert(styles.includes('.mobile-player-buttons'),'Fixed phone playback controls are missing');
assert(styles.includes('@media(max-width:760px) and (orientation:landscape)'),'Phone landscape player layout is missing');

const desktop={render(){return 'desktop'},mount(){},cleanup(){},action(){},jump(){},active:null};
const sandbox={window:{CinemaPlayer:desktop},matchMedia:()=>({matches:true}),document:{},AudioStore:{},MovieStudio:{totalDuration:()=>9},URL,performance,setInterval,clearInterval,SpeechSynthesisUtterance:function(){}};
vm.createContext(sandbox);vm.runInContext(mobile,sandbox);
const composition={title:'My Book',playhead:0,musicSelection:'adventure',musicVolume:.4,uploadedAudio:[],narrationSettings:{enabled:false,rate:1,pitch:1,volume:.8},scenes:[{title:'Cover',narration:'Once upon a time',dialogue:'Hello',duration:9,sceneType:'story',background:{name:'Page 1',colors:['#111','#222'],image:'data:image/jpeg;base64,page'},characterLayers:[]}]};
const rendered=sandbox.window.CinemaPlayer.render(composition);
assert(rendered.includes('mobile-native-player'),'A phone still receives the desktop player markup');
assert(rendered.includes('data-mobile-player-action="toggle"'),'Phone Play control is not owned by the dedicated player');
assert(rendered.includes('id="mobileMovieAudio"'),'Dedicated Android audio element is missing');
assert(!rendered.includes('data-player-action="toggle"'),'Desktop Play control leaked into the phone player');

console.log('Dedicated mobile player smoke passed: separate engine, native taps, Android audio, book artwork, portrait controls, landscape layout, and offline delivery are connected.');
