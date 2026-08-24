const CACHE='story-spark-mobile-v5';
const CORE=[
  './',
  './index.html',
  './manifest.webmanifest',
  './css/styles.css?v=5.0',
  './assets/story-spark-app-icon.svg',
  './assets/star-code-hero.png',
  './js/idb.js',
  './js/movieComposer.js?v=5.0',
  './js/timelineEditor.js?v=5.0',
  './js/moviePlayer.js?v=5.0',
  './js/movieExporter.js?v=5.0',
  './js/pdfStoryReader.js?v=4.2.3',
  './js/mobileApp.js?v=1.3',
  './js/app-v2.js?v=5.0'
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
