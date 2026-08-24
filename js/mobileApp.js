(function(){
 let installPrompt=null;
 const isStandalone=()=>matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;
 const isIOS=()=>/iphone|ipad|ipod/i.test(navigator.userAgent);
 const syncKeyboard=()=>document.body.classList.toggle('mobile-keyboard-open',!!window.visualViewport&&window.visualViewport.height<window.innerHeight*.78);

 window.addEventListener('beforeinstallprompt',event=>{
  event.preventDefault();
  installPrompt=event;
  window.dispatchEvent(new CustomEvent('storyspark-install-ready'));
 });

 window.addEventListener('appinstalled',()=>{
  installPrompt=null;
  window.dispatchEvent(new CustomEvent('storyspark-installed'));
 });

 async function install(){
  if(isStandalone())return {status:'installed'};
  if(installPrompt){
   installPrompt.prompt();
   const choice=await installPrompt.userChoice;
   if(choice.outcome==='accepted')installPrompt=null;
   return {status:choice.outcome};
  }
  return {status:isIOS()?'ios-guide':'browser-guide'};
 }

 if('serviceWorker'in navigator&&/^https?:$/.test(location.protocol)){
  let refreshing=false;
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!refreshing){refreshing=true;location.reload()}});
  window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(error=>console.warn('Offline app setup:',error)));
 }

 window.visualViewport?.addEventListener('resize',syncKeyboard);
 window.addEventListener('orientationchange',()=>setTimeout(syncKeyboard,150));

 window.MobileApp={install,isStandalone,isIOS,get canPrompt(){return !!installPrompt}};
})();
