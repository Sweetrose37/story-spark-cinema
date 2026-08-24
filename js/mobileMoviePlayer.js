(function(){
 const desktop=window.CinemaPlayer;
 const MUSIC_BASE='assets/audio/music/';
 let runtime=null;
 const mobileMode=()=>matchMedia('(max-width:760px), (pointer:coarse)').matches;

 class MobilePlayer{
  constructor(comp,hooks={}){
   this.comp=comp;this.hooks=hooks;this.index=Math.min(comp.playhead||0,comp.scenes.length-1);this.elapsed=0;this.playing=false;this.timer=null;this.startedAt=0;this.audio=null;this.audioUrl='';this.noticeShown=false;this.boundVisibility=()=>{if(document.hidden)this.pause()};
  }
  scene(){return this.comp.scenes[this.index]}
  mount(){
   this.audio=document.querySelector('#mobileMovieAudio');
   this.prepareAudio();this.draw();this.bind();this.update();
   document.addEventListener('visibilitychange',this.boundVisibility);
   return this;
  }
  async prepareAudio(){
   if(!this.audio)return false;
   this.audio.pause();this.audio.removeAttribute('src');this.audio.loop=true;this.audio.preload='auto';this.audio.volume=this.comp.musicVolume??.45;
   try{
    if(this.comp.musicSelection==='uploaded'){
     const ref=this.comp.uploadedAudio?.find(item=>item.role==='music');
     if(ref){this.audioUrl=await AudioStore.url(ref.id)||'';if(this.audioUrl)this.audio.src=this.audioUrl}
    }else this.audio.src=MUSIC_BASE+(this.comp.musicSelection||'adventure')+'.wav';
    if(this.audio.src)this.audio.load();
    return !!this.audio.src;
   }catch(error){this.message('Music could not be opened, but the movie can still play.');return false}
  }
  bind(){
   document.querySelectorAll('[data-mobile-player-action]').forEach(button=>button.onclick=event=>{
    event.preventDefault();event.stopPropagation();
    const action=button.dataset.mobilePlayerAction;
    if(action==='toggle')this.toggle();
    if(action==='prev')this.prev();
    if(action==='next')this.next();
    if(action==='restart')this.restart();
    if(action==='narration')this.toggleNarration();
   });
   const volume=document.querySelector('[data-mobile-player-volume]');
   if(volume)volume.oninput=event=>this.setVolume(event.target.value);
  }
  play(){
   if(this.playing)return;
   this.playing=true;this.startedAt=performance.now()-this.elapsed*1000;
   if(this.audio?.src)this.audio.play().catch(()=>{if(!this.noticeShown){this.noticeShown=true;this.message('The movie is playing. Tap the sound button once if Android muted the music.')}});
   this.draw();this.timer=setInterval(()=>this.tick(),100);this.update();
  }
  pause(){
   if(!this.playing)return;
   this.elapsed=(performance.now()-this.startedAt)/1000;this.playing=false;clearInterval(this.timer);this.timer=null;this.audio?.pause();
   document.querySelector('#mobileMovieScreen')?.classList.remove('is-running');
   if('speechSynthesis'in window)speechSynthesis.cancel();this.update();
  }
  toggle(){this.playing?this.pause():this.play()}
  tick(){
   const scene=this.scene();if(!scene)return;
   this.elapsed=(performance.now()-this.startedAt)/1000;
   if(this.elapsed>=scene.duration){if(this.index>=this.comp.scenes.length-1){this.finish();return}this.index+=1;this.elapsed=0;this.startedAt=performance.now();this.comp.playhead=this.index;this.draw()}
   this.update();
  }
  next(){if(this.index<this.comp.scenes.length-1){this.index+=1;this.elapsed=0;this.startedAt=performance.now();this.comp.playhead=this.index;this.draw();this.update()}}
  prev(){if(this.elapsed>2)this.elapsed=0;else if(this.index>0)this.index-=1;this.startedAt=performance.now();this.comp.playhead=this.index;this.draw();this.update()}
  restart(){this.index=0;this.elapsed=0;this.startedAt=performance.now();this.comp.playhead=0;if(this.audio){this.audio.currentTime=0}this.draw();if(!this.playing)this.play();else this.update()}
  jump(index){if(index<0||index>=this.comp.scenes.length)return;this.index=index;this.elapsed=0;this.startedAt=performance.now();this.comp.playhead=index;this.draw();this.update()}
  finish(){this.pause();this.comp.playhead=0;this.update();this.hooks.onFinish?.()}
  draw(){
   const scene=this.scene(),screen=document.querySelector('#mobileMovieScreen');if(!scene||!screen)return;
   const art=scene.background?.image||'',credits=scene.sceneType==='credits',title=scene.sceneType==='title';
   screen.className=`mobile-native-screen mobile-camera-${slug(scene.cameraMotion)}${this.playing?' is-running':''}${art?' has-book-page':''}`;
   screen.style.setProperty('--mobile-scene1',scene.background?.colors?.[0]||'#17265d');screen.style.setProperty('--mobile-scene2',scene.background?.colors?.[1]||'#a45cf2');screen.style.setProperty('--mobile-duration',scene.duration+'s');
   screen.innerHTML=art?`<img class="mobile-book-page" src="${escape(art)}" alt="${escape(scene.title||'Book page')}">`:`<div class="mobile-scene-glow"></div><span class="mobile-scene-world">${scene.background?.icon||'✦'}</span>${(scene.characterLayers||[]).map((character,index)=>`<div class="mobile-scene-character" style="--mobile-layer:${index}">${character.image?`<img src="${escape(character.image)}" alt="${escape(character.name)}">`:`<b>${escape(character.initial||character.name?.[0]||'?')}</b>`}<small>${escape(character.name)}</small></div>`).join('')}${title?`<div class="mobile-title-card"><small>STORY SPARK CINEMA PRESENTS</small><h1>${escape(this.comp.title)}</h1><p>Tap Play to begin</p></div>`:credits?`<div class="mobile-credit-card"><h2>${escape(this.comp.title)}</h2>${escape(scene.narration).split('\n').map(line=>`<p>${line}</p>`).join('')}</div>`:`<div class="mobile-scene-caption"><small>${escape(scene.background?.name||'Movie Scene')}</small><h2>${escape(scene.title)}</h2><p>${escape(scene.narration)}</p>${scene.dialogue?`<blockquote>${escape(scene.dialogue)}</blockquote>`:''}</div>`}`;
   const label=document.querySelector('#mobileSceneLabel');if(label)label.textContent=`Scene ${this.index+1} of ${this.comp.scenes.length}`;
   if(this.playing)this.speak();
  }
  update(){
   const scene=this.scene();if(!scene)return;
   const total=MovieStudio.totalDuration(this.comp),before=this.comp.scenes.slice(0,this.index).reduce((sum,item)=>sum+item.duration,0),current=before+Math.min(this.elapsed,scene.duration),progress=total?current/total*100:0;
   const fill=document.querySelector('#mobileMovieProgress');if(fill)fill.style.width=progress+'%';
   const time=document.querySelector('#mobileMovieTime');if(time)time.textContent=`${format(current)} / ${format(total)}`;
   const play=document.querySelector('[data-mobile-player-action="toggle"]');if(play){play.textContent=this.playing?'❚❚ PAUSE':'▶ PLAY';play.classList.toggle('is-playing',this.playing)}
   const narration=document.querySelector('[data-mobile-player-action="narration"]');if(narration)narration.classList.toggle('is-on',!!this.comp.narrationSettings.enabled);
   this.comp.updatedDate=new Date().toISOString();
  }
  toggleNarration(){this.comp.narrationSettings.enabled=!this.comp.narrationSettings.enabled;if(!this.comp.narrationSettings.enabled&&'speechSynthesis'in window)speechSynthesis.cancel();else if(this.playing)this.speak();this.update()}
  speak(){if(!this.comp.narrationSettings.enabled||!('speechSynthesis'in window))return;const scene=this.scene();speechSynthesis.cancel();const voice=new SpeechSynthesisUtterance([scene.title,scene.narration,scene.dialogue].filter(Boolean).join('. ')),settings=this.comp.narrationSettings;voice.rate=settings.rate||1;voice.pitch=settings.pitch||1;voice.volume=settings.volume??.85;speechSynthesis.speak(voice)}
  setVolume(value){this.comp.musicVolume=Math.max(0,Math.min(1,Number(value)));if(this.audio)this.audio.volume=this.comp.musicVolume}
  message(text){this.hooks.onMessage?.(text)}
  cleanup(){clearInterval(this.timer);this.timer=null;this.playing=false;if(this.audio){this.audio.pause();this.audio.removeAttribute('src')}if(this.audioUrl)URL.revokeObjectURL(this.audioUrl);this.audioUrl='';if('speechSynthesis'in window)speechSynthesis.cancel();document.removeEventListener('visibilitychange',this.boundVisibility)}
 }

 function render(comp){return `<div class="mobile-native-player"><header class="mobile-player-header"><button class="mobile-player-exit" data-player-action="exit">← BACK</button><div><small>NOW PLAYING</small><h1>${escape(comp.title)}</h1></div><button class="mobile-player-export" data-export-movie>EXPORT</button></header><main class="mobile-player-stage"><div id="mobileMovieScreen" class="mobile-native-screen"></div></main><section class="mobile-player-console"><div class="mobile-player-meta"><span id="mobileSceneLabel">Scene 1 of ${comp.scenes.length}</span><span id="mobileMovieTime">0:00 / ${format(MovieStudio.totalDuration(comp))}</span></div><div class="mobile-player-progress"><i id="mobileMovieProgress"></i></div><div class="mobile-player-buttons"><button data-mobile-player-action="restart" aria-label="Restart movie">↻</button><button data-mobile-player-action="prev" aria-label="Previous scene">◀</button><button class="mobile-player-play" data-mobile-player-action="toggle">▶ PLAY</button><button data-mobile-player-action="next" aria-label="Next scene">▶</button><button data-mobile-player-action="narration" aria-label="Toggle narration">🎙</button></div><label class="mobile-player-volume">🔊 <input type="range" min="0" max="1" step=".05" value="${comp.musicVolume??.45}" data-mobile-player-volume></label></section><audio id="mobileMovieAudio" preload="auto" playsinline></audio></div>`}
 function mount(comp,hooks){runtime?.cleanup();runtime=new MobilePlayer(comp,hooks).mount();return runtime}
 function cleanup(){runtime?.cleanup();runtime=null}
 function action(name,value){if(!runtime)return;if(name==='toggle')runtime.toggle();if(name==='restart')runtime.restart();if(name==='prev')runtime.prev();if(name==='next')runtime.next();if(name==='narration')runtime.toggleNarration();if(name==='volume')runtime.setVolume(value)}
 function jump(index){runtime?.jump(index)}
 function format(seconds){const whole=Math.max(0,Math.floor(seconds));return `${Math.floor(whole/60)}:${String(whole%60).padStart(2,'0')}`}
 function slug(value){return String(value||'static').toLowerCase().replace(/[^a-z0-9]+/g,'-')}
 function escape(value){return String(value??'').replace(/[&<>"']/g,character=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]))}

 const mobile={render,mount,cleanup,action,jump,get active(){return runtime}};
 window.DesktopCinemaPlayer=desktop;window.MobileCinemaPlayer=mobile;
 window.CinemaPlayer={
  render(comp){return mobileMode()?mobile.render(comp):desktop.render(comp)},
  mount(comp,hooks){return mobileMode()?mobile.mount(comp,hooks):desktop.mount(comp,hooks)},
  cleanup(){mobile.cleanup();desktop.cleanup()},
  action(name,value){return mobileMode()?mobile.action(name,value):desktop.action(name,value)},
  jump(index){return mobileMode()?mobile.jump(index):desktop.jump(index)},
  get active(){return mobileMode()?mobile.active:desktop.active}
 };
})();
