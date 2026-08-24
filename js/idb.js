(function(){
 const DB='story-spark-assets',STORE='audio',VERSION=1;
 let dbPromise;
 function open(){
  if(!('indexedDB' in window))return Promise.reject(new Error('Local asset storage is unavailable'));
  if(dbPromise)return dbPromise;
  dbPromise=new Promise((resolve,reject)=>{const req=indexedDB.open(DB,VERSION);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(STORE))req.result.createObjectStore(STORE,{keyPath:'id'})};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)});
  return dbPromise;
 }
 async function save(file,role='music'){
  const allowed=['audio/mpeg','audio/wav','audio/x-wav','audio/mp4','audio/m4a'];
  if(!allowed.includes(file.type)&&!(/\.(mp3|wav|m4a)$/i.test(file.name)))throw new Error('Please choose an MP3, WAV, or M4A audio file.');
  if(file.size>25*1024*1024)throw new Error('That audio file is too large. Please use a file under 25 MB.');
  const record={id:'audio-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),name:file.name,type:file.type||'audio/mpeg',role,blob:file,created:new Date().toISOString()};
  const db=await open();await new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(record);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});return {id:record.id,name:record.name,type:record.type,role:record.role};
 }
 async function get(id){const db=await open();return new Promise((resolve,reject)=>{const req=db.transaction(STORE).objectStore(STORE).get(id);req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error)})}
 async function url(id){const record=await get(id);return record?URL.createObjectURL(record.blob):null}
 async function remove(id){const db=await open();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).delete(id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}
 async function clear(){const db=await open();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).clear();tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}
 window.AudioStore={save,get,url,remove,clear,supported:'indexedDB' in window};
})();
