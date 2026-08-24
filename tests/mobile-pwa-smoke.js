const fs = require('fs');
const assert = require('assert');

const html = fs.readFileSync('index.html','utf8');
const app = fs.readFileSync('js/app-v2.js','utf8');
const mobile = fs.readFileSync('js/mobileApp.js','utf8');
const player = fs.readFileSync('js/moviePlayer.js','utf8');
const worker = fs.readFileSync('sw.js','utf8');
const styles = fs.readFileSync('css/styles.css','utf8');
const manifest = JSON.parse(fs.readFileSync('manifest.webmanifest','utf8'));

assert(html.includes('viewport-fit=cover'), 'iPhone safe-area viewport support is missing');
assert(html.includes('rel="manifest"'), 'Web app manifest is not linked');
assert(html.includes('apple-mobile-web-app-capable'), 'iPhone standalone support is missing');
assert(html.includes('js/mobileApp.js?v=1.4'), 'Current mobile app controller is not loaded');
assert.equal(manifest.display,'standalone','Manifest is not configured for standalone launch');
assert.equal(manifest.start_url,'./','Manifest start URL is incorrect');
assert(manifest.icons.some(icon=>icon.purpose.includes('maskable')), 'Maskable Android app icon is missing');
assert(fs.existsSync('assets/story-spark-app-icon.svg'), 'Mobile app icon is missing');
assert(worker.includes("const CACHE='story-spark-mobile-v17'"), 'Current versioned offline cache is missing');
assert(app.includes('function save(showFeedback=false)'), 'Background changes still display Saved feedback');
assert(app.includes('function saveComposition(comp,showFeedback=false)'), 'Composition updates still display Saved feedback');
assert(app.includes('save(showFeedback);return comp'), 'Composition feedback is not controlled by the explicit save action');
assert(!app.includes('mode selected'), 'Age selection still shows a bottom popup');
assert(app.includes('if(!AGE[nextAge]||state.age===nextAge)return'), 'Selected age taps still repeat their action');
assert(app.includes("saveComposition(comp,true);toast('Movie edits saved locally!')"), 'The explicit Save Edits action lost its save confirmation');
assert(worker.includes("request.mode==='navigate'"), 'Offline navigation fallback is missing');
assert(mobile.includes("navigator.serviceWorker.register('./sw.js')"), 'Service worker registration is missing');
assert(mobile.includes("'controllerchange'"), 'Installed phones do not refresh after an app-shell update');
assert(mobile.includes("classList.contains('file-import-active')"), 'A service-worker refresh can interrupt an active phone import');
assert(mobile.includes("'storyspark-import-finished'"), 'Deferred mobile refresh is not resumed after importing');
assert(mobile.includes("'beforeinstallprompt'"), 'Android install prompt support is missing');
assert(mobile.includes('window.navigator.standalone'), 'iPhone installed-mode detection is missing');
assert(app.includes('installStorySparkApp()'), 'Install action is not connected to the app UI');
assert(app.includes('INSTALL ON IPHONE OR IPAD'), 'iPhone install guide is missing');
assert(app.includes('INSTALL ON ANDROID'), 'Android install guide is missing');
assert(styles.includes('env(safe-area-inset-top)'), 'Notch safe-area styling is missing');
assert(styles.includes('@media(display-mode:standalone)'), 'Standalone app styling is missing');
assert(styles.includes('min-height:100dvh'), 'Dynamic mobile viewport support is missing');
assert(app.includes('applyMobileNavigation()'), 'Phone bottom navigation is missing');
assert(styles.includes('.mobile-bottom-nav'), 'Phone navigation styling is missing');
assert(app.includes('applyMobileDrawerChrome()'), 'Mobile drawer close controls are missing');
assert(app.includes('setMobileDrawer(open)'), 'Mobile drawer state management is missing');
assert(app.includes("if(!['menu','close-mobile-menu'].includes(b.dataset.action))"), 'More is still bound through two competing action paths');
assert(app.includes('bindIntentionalTap(menu,()=>setMobileDrawer'), 'More does not use the scroll-safe mobile tap handler');
assert(app.includes("menus=$$('[data-action=\"menu\"]')"), 'Both More controls do not share drawer state');
assert(styles.includes('.mobile-menu-scrim'), 'Mobile drawer backdrop is missing');
assert(styles.includes('html[data-route="movies"] .library-toolbar{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))'), 'My Movies toolbar still overflows phone width');
assert(styles.includes('html[data-route="movies"] .library-toolbar .btn{width:100%;min-width:0'), 'My Movies toolbar buttons cannot shrink to phone width');
assert(styles.includes('aspect-ratio:4/3!important'), 'Android movie screen sizing is not repaired');
assert(styles.includes('.mobile-keyboard-open'), 'Android keyboard overlap handling is missing');
assert(mobile.includes('window.visualViewport'), 'Android keyboard detection is missing');
assert(app.includes("function bindMobileTap(element,handler){if(!element)return;let active=false,suppressClick=false,releaseTimer=null"), 'Player controls do not use a one-touch Android activation latch');
assert(app.includes("element.onpointerdown=begin"), 'Android player controls do not track touch-down');
assert(app.includes("element.onpointerup=finish"), 'Android player controls do not activate on quick tap release');
assert(app.includes("element.ontouchstart="), 'Older Android touch-start fallback is missing');
assert(app.includes("element.ontouchend=finish"), 'Older Android touch-end activation is missing');
assert(app.includes("if(suppressClick){suppressClick=false;clearTimeout(releaseTimer);return}"), 'Android compatibility clicks can double-trigger controls');
assert(!app.includes("Date.now()-directAt"), 'Android click suppression can expire while a touch is still finishing');
assert(app.includes('bindIntentionalTap(element,handler)'), 'Scroll-safe mobile activation is missing');
assert(app.includes('element.onpointercancel'), 'Cancelled Android touches are not ignored');
assert(app.includes('hamburger-icon'), 'Mobile hamburger control is missing');
assert(styles.includes('.mobile-screen-play'), 'Large mobile movie play control is missing');
assert(player.includes('class="mobile-screen-play"'), 'Mobile movie play button is not rendered');
assert(player.includes("querySelectorAll('[data-player-action=\"toggle\"]')"), 'Mobile and standard play buttons do not stay synchronized');
assert(player.includes('startMusic()'), 'Android-safe media startup is missing');
assert(player.includes("this.music.preload='auto'"), 'Movie audio is not prepared before Android playback');
assert(player.indexOf('this.playing=true;this.startMusic()')>=0, 'Music is not started at the beginning of the Android tap gesture');
assert(player.includes("classList.remove('scene-running')"), 'Pausing does not pause the movie-screen animation');
assert(styles.includes('.scene-running .movie-pdf-art'), 'Imported PNG/PDF scenes still look frozen during playback');
assert(styles.includes('@keyframes artKenBurns'), 'Imported page motion animation is missing');
assert(!/function render\(\).*save\(\)}/.test(app), 'Rendering still saves state without a user action');
assert(/function autosave\(\).*if\(i>=0\)/.test(app), 'Draft autosave still creates unwanted movie-library entries');
assert(app.includes("story:{mission:'',problem:'',sidekick:'',item:'',twist:'',ending:''}"), 'New stories still arrive with choices already selected');
assert(app.includes("if(!p.title)return toast('Choose a movie title"), 'The app does not require an intentional title choice');
assert(app.includes("restored.route='home'"), 'A fresh mobile launch can reopen a stale player or editor route');
assert(app.includes("function route(r){state.route=r;persistState(false)"), 'Navigation state is not persisted intentionally');

for(const asset of ['./index.html','./manifest.webmanifest','./assets/story-spark-app-icon.svg','./js/mobileApp.js?v=1.4']){
  assert(worker.includes(`'${asset}'`), `Offline cache is missing ${asset}`);
}
for(const folder of ['assets/audio/music','assets/audio/sfx']){
  for(const file of fs.readdirSync(folder).filter(name=>name.endsWith('.wav'))){
    const asset=`./${folder}/${file}`;
    assert(worker.includes(`'${asset}'`), `Offline cache is missing player audio: ${asset}`);
  }
}

console.log('Mobile PWA smoke passed: Android/iPhone install paths, app icon, standalone launch, offline shell, safe areas, and touch sizing are connected.');
