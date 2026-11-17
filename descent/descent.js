(() => {
'use strict';
const feed=document.querySelector('#descent-feed'),sentinel=document.querySelector('#descent-sentinel'),status=document.querySelector('#descent-status'),panel=document.querySelector('#descent');
if(!feed||!sentinel||!panel)return;
let images=[],notes=[],recipes=[],recipeDeck=[],audioPool=[],index=0,busy=false,lastKind='',lastImage=-1,context=null,imageDeck=[],nextAd=14,nextRecipe=65,adDeck=[];
const random=(n)=>Math.floor(Math.random()*n);
const choose=a=>a[random(a.length)];
const safe=(s)=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const releases=window.RECORDS||[];
audioPool=releases.flatMap(r=>(r.tracks||[]).filter(t=>t.audio).map(t=>({title:t.title,artist:r.artist,src:t.audio.replace(/^\.\.\//,'')})));
const architecture=['marginalia','shaft','negative','footnote','redaction','corridor','inversion','sideways','stack','orbit','dislocation'];
const templates=[
 {kind:'image',weight:5},{kind:'diptych',weight:2},{kind:'statement',weight:2},
 {kind:'recording',weight:2},{kind:'echo',weight:1},{kind:'interruption',weight:1}
];
function kindFor(depth){
 const pool=templates.flatMap(t=>Array(t.weight+(depth>1&&['echo','interruption'].includes(t.kind)?2:0)).fill(t.kind));
 const weights=[0,1,2,3,4];for(const kind of architecture)for(let n=0;n<weights[depth];n++)pool.push(kind);
 let kind=choose(pool);if(kind===lastKind)kind=choose(pool.filter(k=>k!==lastKind));lastKind=kind;return kind;
}
function picture(){
 if(!images.length)return '';
 if(!imageDeck.length){imageDeck=images.map((_,i)=>i);for(let i=imageDeck.length-1;i>0;i--){const j=random(i+1);[imageDeck[i],imageDeck[j]]=[imageDeck[j],imageDeck[i]];}if(imageDeck.length>1&&imageDeck[imageDeck.length-1]===lastImage){[imageDeck[0],imageDeck[imageDeck.length-1]]=[imageDeck[imageDeck.length-1],imageDeck[0]];}}
 const n=imageDeck.pop();lastImage=n;
 return '<img loading="lazy" decoding="async" src="'+safe(images[n])+'" alt="Recovered visual material">';
}
function line(){return choose(notes)||'The archive has retained this item without an explanation.';}
function audioCard(depth){
 if(!audioPool.length)return '<p class="descent-entry__note">'+safe(line())+'</p>';
 const track=choose(audioPool),treatment=choose(depth>=2?['memory','tape','transmission','ghost']:['memory','transmission']);
 return '<div class="descent-record"><p class="descent-entry__index">DEGRADED COPY / '+safe(treatment.toUpperCase())+'</p><p class="descent-record__title">'+safe(track.title)+'</p><p class="descent-entry__track">'+safe(track.artist)+' / ALTERED PLAYBACK</p><audio controls preload="none" crossorigin="anonymous" data-treatment="'+treatment+'" src="'+safe(track.src)+'"></audio><p class="descent-record__disclaimer">A live reconstruction. The original recording remains unchanged.</p></div>';
}
function recipeCard(depth){
 if(!recipes.length)return '<p class="descent-entry__note">'+safe(line())+'</p>';
 if(!recipeDeck.length){recipeDeck=recipes.map((_,i)=>i);for(let i=recipeDeck.length-1;i>0;i--){const k=random(i+1);[recipeDeck[i],recipeDeck[k]]=[recipeDeck[k],recipeDeck[i]];}}
 const recipe=recipes[recipeDeck.pop()],damaged=depth>=2;
 return '<div class="descent-prescription'+(damaged?' descent-prescription--aged':'')+'"><p class="descent-prescription__heading">THE GORDON APOTHECARY / FORMULARY '+String(recipe.id).padStart(3,'0')+'</p><h3>'+safe(recipe.name)+'</h3><ul>'+recipe.ingredients.map(i=>'<li>'+safe(i)+'</li>').join('')+'</ul>'+(recipe.note?'<p class="descent-prescription__note">UNVERIFIED: '+safe(recipe.note)+'</p>':'')+'<a href="apothecary/#formula-'+encodeURIComponent(recipe.id)+'">CONSULT ORIGINAL FORMULA ↗</a></div>';
}
function architecturalCard(kind,depth){
 const first=safe(line()),second=safe(line());
 switch(kind){
 case 'marginalia':return '<div class="arch-marginalia"><aside>ARCHIVAL ANNOTATION / '+index+'<p>'+first+'</p></aside><p>'+second+'</p></div>';
 case 'shaft':return '<div class="arch-shaft"><small>THE PASSAGE NARROWS</small><p>'+first+'</p><small>NO WIDTH RECORDED</small></div>';
 case 'negative':return '<div class="arch-negative"><figure>'+picture()+'<figcaption>'+first+'</figcaption></figure><small>THE REST OF THE ROOM IS NOT INCLUDED.</small></div>';
 case 'footnote':return '<div class="arch-footnote"><p>'+first+'<sup>1</sup></p><aside><small>1. CORRECTION TO THE ABOVE</small><p>'+second+'</p><small>Further amendments may be filed without notice.</small></aside></div>';
 case 'redaction':return '<div class="arch-redaction"><small>PARTIALLY RELEASED / REVISION '+depth+'</small><p>'+first.split(' ').map((w,i)=>i%4===1||i%7===3?'<span aria-label="redacted" class="arch-blackout">█████</span>':w).join(' ')+'</p><small>'+second+'</small></div>';
 case 'corridor':return '<div class="arch-corridor"><p>'+first+'</p><p aria-hidden="true">'+first+'</p><p aria-hidden="true">'+first+'</p><p aria-hidden="true">'+first+'</p><small>YOU ARE HERE. YOU ARE HERE. YOU ARE HERE.</small></div>';
 }
 return '';
}
function violentCard(kind,depth){
 const phrase=line(),words=phrase.split(/\s+/).filter(Boolean),escaped=safe(phrase),other=safe(line());
 if(kind==='inversion')return '<div class="arch-violent arch-inversion"><p>'+escaped+'</p><small>THE DOCUMENT HAS BEEN TURNED OVER.</small><p class="arch-inversion__ghost" aria-hidden="true">'+escaped+'</p></div>';
 if(kind==='sideways')return '<div class="arch-violent arch-sideways"><span>ORIENTATION NOT RECORDED</span><p>'+escaped+'</p><small>'+other+'</small></div>';
 if(kind==='stack')return '<div class="arch-violent arch-stack"><span>TRANSCRIPTION / VERTICAL</span><p aria-label="'+safe(phrase)+'">'+words.map(w=>'<span aria-hidden="true">'+safe(w)+'</span>').join('')+'</p><small>READ DOWNWARD</small></div>';
 if(kind==='orbit'){
  const id='descent-orbit-'+index;
  const rings=[0,1,2].map((n)=>'<path id="'+id+'-'+n+'" d="M '+(300-(n*74))+' 300 a '+(n*74+1)+' '+(n*74+1)+' 0 1 1 0 1" fill="none"/>').join('');
  // Text is repeated on circular tracks, and the entire composition can be read in its accessible caption.
  const paths=[0,1,2].map((n)=>{const r=[238,168,98][n],p=id+'-ring-'+n;return '<path id="'+p+'" d="M '+(300-r)+' 300 a '+r+' '+r+' 0 1 1 '+(2*r)+' 0 a '+r+' '+r+' 0 1 1 -'+(2*r)+' 0" fill="none"/>';}).join('');
  const tracks=[0,1,2].map(n=>'<text class="arch-orbit__text arch-orbit__text--'+n+'"><textPath href="#'+id+'-ring-'+n+'" startOffset="'+(n*13)+'%">'+escaped+' · '+escaped+' · </textPath></text>').join('');
  return '<div class="arch-violent arch-orbit"><svg viewBox="0 0 600 600" role="img" aria-label="'+safe(phrase)+'" preserveAspectRatio="xMidYMid meet"><defs>'+paths+'</defs>'+tracks+'</svg><small>THIS TEXT HAS NO AGREED BEGINNING.</small></div>';
 }
 if(kind==='dislocation')return '<div class="arch-violent arch-dislocation"><p>'+escaped+'</p><p aria-hidden="true">'+other+'</p><span>LOCATION DISPUTED</span><p aria-hidden="true">'+escaped+'</p></div>';
 return '';
}
const advertisements=[{"brand":"SELF-DISCOVERY ZONE","head":"GET LOST. STAY A WHILE.","copy":"An infinitely expandable play structure for the child who has already outgrown the exit.","fine":"All tunnels are final. Parent pickup is not guaranteed.","palette":"yellow"},{"brand":"COSMIC ORPHAN™","head":"HOMESICK FOR SOMEWHERE YOU'VE NEVER BEEN?","copy":"Introducing a complete range of memories from places you haven't visited.","fine":"Imagined familiarity sold separately.","palette":"blue"},{"brand":"SOLARIUM SYSTEMS","head":"NATURE. NOW WITH A CEILING.","copy":"Bring the outdoors inside. Keep it there. Purple lighting available for an additional fee.","fine":"Plants may become aware of the difference.","palette":"green"},{"brand":"THE GRAND SLAM","head":"EVERY TUNNEL LEADS TO ANOTHER TUNNEL.","copy":"Wood, carpet, plexiglass, and the assurance that someone has inspected the structure.","fine":"Inspection records unavailable.","palette":"pink"},{"brand":"INFINITE MALL DEVELOPMENT","head":"MORE MALL THAN YOU WILL EVER NEED.","copy":"Visit our newest atrium. Featuring a fountain, a treehouse showroom, and several additional centuries.","fine":"Directory subject to spatial revision.","palette":"coral"},{"brand":"NON-PLACE REALTY","head":"YOUR NEXT HOME IS BETWEEN HOMES.","copy":"Beautiful transitional spaces with fluorescent lighting and no established departure time.","fine":"Actual address may not exist.","palette":"violet"},{"brand":"MEMORY PORTRAIT STUDIO","head":"THE PICTURE IS STILL TRUE.","copy":"Professional portraits in convincing rooms built just far enough beyond the frame.","fine":"Background ends immediately outside the photograph.","palette":"mint"},{"brand":"TOMORROW'S MUSEUM","head":"SEE EVERY CENTURY BEFORE CLOSING.","copy":"One ticket. Uncountable galleries. The exhibit ends when the building decides.","fine":"Exits are interpretive.","palette":"orange"},{"brand":"THE UT0PIA PROJECT","head":"NOW OPEN IN NO PLACE IN PARTICULAR.","copy":"All the comforts of a destination without the burden of arriving.","fine":"Non-place. Non-refundable.","palette":"sky"},{"brand":"THRESHOLD HOME GOODS","head":"EVERYTHING YOU NEED FOR THE IN-BETWEEN.","copy":"Doorways, night lights, hallway carpet, and the comforting illusion of tomorrow.","fine":"Tomorrow is not included.","palette":"cream"}];
function adCard(){
 if(!adDeck.length){adDeck=advertisements.map((_,i)=>i);for(let i=adDeck.length-1;i>0;i--){const k=random(i+1);[adDeck[i],adDeck[k]]=[adDeck[k],adDeck[i]];}}
 const ad=advertisements[adDeck.pop()];
 return '<div class="descent-ad descent-ad--'+ad.palette+'"><div class="descent-ad__top"><span>PAID PLACEMENT / UNVERIFIED SPONSOR</span><span>ADVERTISEMENT</span></div><div class="descent-ad__body"><p class="descent-ad__brand">'+safe(ad.brand)+'</p><h3>'+safe(ad.head)+'</h3><p class="descent-ad__copy">'+safe(ad.copy)+'</p></div><div class="descent-ad__bottom">'+safe(ad.fine)+'</div></div>';
}
const interruptions=[
 ['YOU ARE STILL ON THE SAME WEBSITE.','THIS PAGE IS PART OF THE ORIGINAL WEBSITE.','YOU MAY CONTINUE SCROLLING.'],
 ['YOUR LOCATION WITHIN THE WEBSITE HAS BEEN UPDATED.','NO ACTION IS REQUIRED.','THE CONTENT BELOW MAY DIFFER FROM THE CONTENT ABOVE.'],
 ['THIS IS A COPY OF THE WEBSITE.','THE ORIGINAL REMAINS AVAILABLE ABOVE.','THE RECORDS HAVE NOT BEEN MOVED.'],
 ['THE WEBSITE HAS BEEN RESTORED FROM MEMORY.','SOME DETAILS COULD NOT BE VERIFIED.','THE WEBSITE DOES NOT CONSIDER THIS A PROBLEM.'],
 ['THIS IS THE WEBSITE THAT REMEMBERS YOU.','THE ORIGINAL VERSION IS NO LONGER IN THIS DIRECTION.','YOU HAVE NOT LEFT.']
];
function interruption(depth){const pool=interruptions[Math.min(depth,interruptions.length-1)];const message=choose(pool);return '<div class="descent-interruption"><p>'+safe(message)+'</p><p>'+safe(line())+'</p></div>';}
function add(){
 if(busy||!images.length)return;busy=true;
 const frag=document.createDocumentFragment();
 for(let n=0;n<4;n++){
  const depth=Math.min(4,Math.floor(index/8));
  let kind;
  if(index>=nextAd){kind='advertisement';nextAd=index+14+random(9);}
  else if(index>=nextRecipe){kind='recipe';nextRecipe=index+65+random(31);}
  else kind=kindFor(depth);
  lastKind=kind;
  const entry=document.createElement('article');
  entry.className='descent-entry descent-entry--'+kind+' descent-entry--depth-'+depth;
  entry.dataset.depth=depth;
  const serial=String(++index).padStart(3,'0');
  const intro='<p class="descent-entry__index">RECOVERED / '+serial+'</p>';
  if(kind==='image')entry.innerHTML=intro+picture()+'<p class="descent-entry__note">'+safe(line())+'</p>';
  if(kind==='diptych')entry.innerHTML=intro+'<div class="descent-diptych">'+picture()+picture()+'</div><p class="descent-entry__note">'+safe(line())+'</p>';
  if(kind==='statement')entry.innerHTML=intro+'<p class="descent-statement">'+safe(line())+'</p>';
  if(kind==='recording')entry.innerHTML=intro+audioCard(depth);
  if(kind==='recipe')entry.innerHTML=intro+recipeCard(depth);
  if(kind==='advertisement')entry.innerHTML=intro+adCard();
  if(kind==='echo')entry.innerHTML=intro+'<div class="descent-echo"><span>AERIS MANDRAKE</span><span>THE RECORD ROOM IS OPEN</span><span class="descent-echo__broken">THE RECORD ROOM IS '+(depth>2?'STILL':'ALMOST')+' OPEN</span></div><p class="descent-entry__note">'+safe(line())+'</p>';
  if(kind==='interruption')entry.innerHTML=intro+interruption(depth);
  if(architecture.includes(kind))entry.innerHTML=intro+(['inversion','sideways','stack','orbit','dislocation'].includes(kind)?violentCard(kind,depth):architecturalCard(kind,depth));
  frag.appendChild(entry);
 }
 feed.appendChild(frag);
 panel.dataset.depth=String(Math.min(4,Math.floor(index/8)));
 if(status)status.textContent='ARCHIVE POSITION '+String(index).padStart(3,'0')+' / NO END OF FILE';
 busy=false;
}
function configureAudio(audio){
 if(audio.dataset.configured)return;
 audio.dataset.configured='yes';
 const mode=audio.dataset.treatment;
 const speed={memory:.82,tape:.68,transmission:.96,ghost:.76}[mode]||1;
 audio.playbackRate=speed;
 try{
  const AC=window.AudioContext||window.webkitAudioContext;
  if(!AC)return;
  context=context||new AC();
  const source=context.createMediaElementSource(audio),filter=context.createBiquadFilter(),gain=context.createGain();
  filter.type=mode==='ghost'?'lowpass':'bandpass';
  filter.frequency.value=mode==='transmission'?1100:mode==='ghost'?900:1700;
  filter.Q.value=mode==='transmission'?.9:.35;
  gain.gain.value=.75;
  source.connect(filter);filter.connect(gain);gain.connect(context.destination);
  if(mode==='ghost'||mode==='tape'){
   const delay=context.createDelay(1),feedback=context.createGain(),wet=context.createGain();
   delay.delayTime.value=mode==='ghost'?.39:.18;feedback.gain.value=.22;wet.gain.value=.22;
   filter.connect(delay);delay.connect(wet);wet.connect(context.destination);
   delay.connect(feedback);feedback.connect(delay);
  }
 }catch(e){/* playbackRate remains available when audio processing is unsupported */}
}
feed.addEventListener('play',event=>{
 const audio=event.target;if(!(audio instanceof HTMLAudioElement))return;
 feed.querySelectorAll('audio').forEach(other=>{if(other!==audio)other.pause();});
 configureAudio(audio);
 if(context&&context.state==='suspended')context.resume().catch(()=>{});
},true);
fetch('descent/manifest.json?fresh='+Date.now(), {cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Archive unavailable');return r.json();}).then(data=>{
 images=(data.images||[]).filter(s=>typeof s==='string'&&s.startsWith('assets/'));
 notes=(data.notes||[]).filter(s=>typeof s==='string'&&s.trim());
 recipes=(data.recipes||[]).filter(r=>r&&Number.isInteger(r.id)&&typeof r.name==='string'&&Array.isArray(r.ingredients));
 if(!images.length)throw Error('No images');
 add();
 const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting))add();},{rootMargin:'700px 0px'});
 observer.observe(sentinel);
}).catch(()=>{if(status)status.textContent='THE ARCHIVE CANNOT BE RETRIEVED.';});
})();