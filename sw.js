const CACHE='story-spark-mobile-v13';
const CORE=[
  './',
  './index.html',
  './manifest.webmanifest',
  './css/styles.css?v=5.3',
  './assets/story-spark-app-icon.svg',
  './assets/star-code-hero.png',
  './js/idb.js',
  './js/movieComposer.js?v=5.2',
  './js/timelineEditor.js?v=5.0',
  './js/moviePlayer.js?v=5.2',
  './js/mobileMoviePlayer.js?v=1.0',
  './js/movieExporter.js?v=5.0',
  './js/pdfStoryReader.js?v=4.4.0',
  './js/mobileApp.js?v=1.4',
  './js/app-v2.js?v=5.5',
  './assets/audio/music/adventure.wav',
  './assets/audio/music/calm.wav',
  './assets/audio/music/comedy.wav',
  './assets/audio/music/emotional.wav',
  './assets/audio/music/epic.wav',
  './assets/audio/music/happy.wav',
  './assets/audio/music/magical.wav',
  './assets/audio/music/mystery.wav',
  './assets/audio/music/space.wav',
  './assets/audio/music/spooky-cute.wav',
  './assets/audio/music/victory.wav',
  './assets/audio/sfx/countdown.wav',
  './assets/audio/sfx/crowd.wav',
  './assets/audio/sfx/door.wav',
  './assets/audio/sfx/dragon.wav',
  './assets/audio/sfx/footsteps.wav',
  './assets/audio/sfx/magic.wav',
  './assets/audio/sfx/mystery.wav',
  './assets/audio/sfx/rain.wav',
  './assets/audio/sfx/robot.wav',
  './assets/audio/sfx/sparkle.wav',
  './assets/audio/sfx/treasure.wav',
  './assets/audio/sfx/victory.wav',
  './assets/audio/sfx/whoosh.wav',
  './assets/audio/sfx/wind.wav'
];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET'||request.headers.has('range'))return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;
  if(request.mode==='navigate'){
    event.respondWith(fetch(request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put('./index.html',copy));return response}).catch(()=>caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(request,copy))}return response})));
});
