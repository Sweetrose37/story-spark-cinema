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
assert(html.includes('js/mobileApp.js?v=1.3'), 'Current mobile app controller is not loaded');
assert.equal(manifest.display,'standalone','Manifest is not configured for standalone launch');
assert.equal(manifest.start_url,'./','Manifest start URL is incorrect');
assert(manifest.icons.some(icon=>icon.purpose.includes('maskable')), 'Maskable Android app icon is missing');
assert(fs.existsSync('assets/story-spark-app-icon.svg'), 'Mobile app icon is missing');
assert(worker.includes("const CACHE='story-spark-mobile-v5'"), 'Current versioned offline cache is missing');
assert(worker.includes("request.mode==='navigate'"), 'Offline navigation fallback is missing');
assert(mobile.includes("navigator.serviceWorker.register('./sw.js')"), 'Service worker registration is missing');
assert(mobile.includes("'controllerchange'"), 'Installed phones do not refresh after an app-shell update');
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
assert(styles.includes('.mobile-menu-scrim'), 'Mobile drawer backdrop is missing');
assert(styles.includes('aspect-ratio:4/3!important'), 'Android movie screen sizing is not repaired');
assert(styles.includes('.mobile-keyboard-open'), 'Android keyboard overlap handling is missing');
assert(mobile.includes('window.visualViewport'), 'Android keyboard detection is missing');
assert(app.includes('bindMobileTap(element,handler)'), 'Direct mobile pointer activation is missing');
assert(app.includes('bindIntentionalTap(element,handler)'), 'Scroll-safe mobile activation is missing');
assert(app.includes('element.onpointercancel'), 'Cancelled Android touches are not ignored');
assert(!app.includes('element.onpointerup=event=>'), 'Player still fires actions directly on Android pointer-up');
assert(app.includes('hamburger-icon'), 'Mobile hamburger control is missing');
assert(styles.includes('.mobile-screen-play'), 'Large mobile movie play control is missing');
assert(player.includes('class="mobile-screen-play"'), 'Mobile movie play button is not rendered');
assert(player.includes("querySelectorAll('[data-player-action=\"toggle\"]')"), 'Mobile and standard play buttons do not stay synchronized');
assert(player.includes('startMusic()'), 'Android-safe media startup is missing');
assert(player.includes("this.music.preload='auto'"), 'Movie audio is not prepared before Android playback');
assert(!/function render\(\).*save\(\)}/.test(app), 'Rendering still saves state without a user action');
assert(/function autosave\(\).*if\(i>=0\)/.test(app), 'Draft autosave still creates unwanted movie-library entries');
assert(app.includes("story:{mission:'',problem:'',sidekick:'',item:'',twist:'',ending:''}"), 'New stories still arrive with choices already selected');
assert(app.includes("if(!p.title)return toast('Choose a movie title"), 'The app does not require an intentional title choice');

for(const asset of ['./index.html','./manifest.webmanifest','./assets/story-spark-app-icon.svg','./js/mobileApp.js?v=1.3']){
  assert(worker.includes(`'${asset}'`), `Offline cache is missing ${asset}`);
}

console.log('Mobile PWA smoke passed: Android/iPhone install paths, app icon, standalone launch, offline shell, safe areas, and touch sizing are connected.');
