(() => {
'use strict';
const feed=document.querySelector('#descent-feed'),sentinel=document.querySelector('#descent-sentinel'),status=document.querySelector('#descent-status'),panel=document.querySelector('#descent');
if(!feed||!sentinel||!panel)return;
let images=[],notes=[],recipes=[],recipeDeck=[],audioPool=[],index=0,busy=false,lastKind='',lastImage=-1,context=null,imageDeck=[],nextAd=14,nextRecipe=65,nextClassified=33,nextCorrection=46,adDeck=[],adCount=0,correctionCount=0,companyStage=0,seenClaims=[];
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
const advertisements=[{"brand":"SELF-DISCOVERY ZONE","head":"GET LOST. STAY A WHILE.","copy":"An infinitely expandable play structure for the child who has already outgrown the exit.","fine":"All tunnels are final. Parent pickup is not guaranteed.","palette":"yellow"},{"brand":"COSMIC ORPHAN™","head":"HOMESICK FOR SOMEWHERE YOU'VE NEVER BEEN?","copy":"Introducing a complete range of memories from places you haven't visited.","fine":"Imagined familiarity sold separately.","palette":"blue"},{"brand":"SOLARIUM SYSTEMS","head":"NATURE. NOW WITH A CEILING.","copy":"Bring the outdoors inside. Keep it there. Purple lighting available for an additional fee.","fine":"Plants may become aware of the difference.","palette":"green"},{"brand":"THE GRAND SLAM","head":"EVERY TUNNEL LEADS TO ANOTHER TUNNEL.","copy":"Wood, carpet, plexiglass, and the assurance that someone has inspected the structure.","fine":"Inspection records unavailable.","palette":"pink"},{"brand":"INFINITE MALL DEVELOPMENT","head":"MORE MALL THAN YOU WILL EVER NEED.","copy":"Visit our newest atrium. Featuring a fountain, a treehouse showroom, and several additional centuries.","fine":"Directory subject to spatial revision.","palette":"coral"},{"brand":"NON-PLACE REALTY","head":"YOUR NEXT HOME IS BETWEEN HOMES.","copy":"Beautiful transitional spaces with fluorescent lighting and no established departure time.","fine":"Actual address may not exist.","palette":"violet"},{"brand":"MEMORY PORTRAIT STUDIO","head":"THE PICTURE IS STILL TRUE.","copy":"Professional portraits in convincing rooms built just far enough beyond the frame.","fine":"Background ends immediately outside the photograph.","palette":"mint"},{"brand":"TOMORROW'S MUSEUM","head":"SEE EVERY CENTURY BEFORE CLOSING.","copy":"One ticket. Uncountable galleries. The exhibit ends when the building decides.","fine":"Exits are interpretive.","palette":"orange"},{"brand":"THE UT0PIA PROJECT","head":"NOW OPEN IN NO PLACE IN PARTICULAR.","copy":"All the comforts of a destination without the burden of arriving.","fine":"Non-place. Non-refundable.","palette":"sky"},{"brand":"THRESHOLD HOME GOODS","head":"EVERYTHING YOU NEED FOR THE IN-BETWEEN.","copy":"Doorways, night lights, hallway carpet, and the comforting illusion of tomorrow.","fine":"Tomorrow is not included.","palette":"cream"},{"brand":"AFTER HOURS SCHOOL DISTRICT","head":"THE HALLWAYS ARE YOURS NOW.","copy":"Enjoy every corridor after the final bell. Lockers remain stocked with unspecified memories.","fine":"No faculty will be present.","palette":"yellow"},{"brand":"FAMILIARITY INSURANCE","head":"COVERAGE FOR PLACES YOU ALMOST REMEMBER.","copy":"Protect your childhood from unexpected renovations, demolished arcades, and missing street corners.","fine":"Pre-existing memories may be excluded.","palette":"blue"},{"brand":"THE DREAMSCAPE HOTEL","head":"WAKE UP SOMEWHERE ELSE.","copy":"Every suite includes a door to the room you were just dreaming about.","fine":"Check-out is a matter of interpretation.","palette":"violet"},{"brand":"FLUORESCENT SUNSHINE CO.","head":"A PERFECT DAY, 24 HOURS A DAY.","copy":"Our new artificial daylight brings the comforting hum of commercial lighting to any outdoor experience.","fine":"UV protection is not necessary. Or available.","palette":"green"},{"brand":"THE ENDLESS FOOD COURT","head":"SAME TABLE. NEW DECADE.","copy":"Return to the familiar tastes of your adolescence. The chairs have been waiting.","fine":"Some vendors closed in 1998.","palette":"coral"},{"brand":"GRAND ATRIUM TREEHOUSES","head":"THE SKY IS AN INDOOR AMENITY.","copy":"Tour luxury treehouses installed forty feet above the mall floor. No weather. No seasons. No questions.","fine":"Structural drawings are conceptual.","palette":"mint"},{"brand":"THE HORIZON EXTENSION SERVICE","head":"THERE'S MORE BEYOND THE FRAME.","copy":"We add a reassuring distance to the spaces you cannot see.","fine":"Results may resemble what is already here.","palette":"sky"},{"brand":"YESTERDAY'S TOMORROW","head":"THE FUTURE YOU WERE PROMISED IS BACK.","copy":"Experience a newly refurbished version of the year 2000, complete with original expectations.","fine":"Some futures are display models only.","palette":"pink"},{"brand":"DOORWAY DIRECT","head":"TRANSITIONS WITHOUT DESTINATIONS.","copy":"Choose from hundreds of beautifully finished thresholds. Rooms available separately.","fine":"No room is currently available.","palette":"cream"},{"brand":"CARPETED LABYRINTHS INC.","head":"SOFT FLOORS. HARD QUESTIONS.","copy":"Commercial-grade carpet for play tunnels, hotel corridors, and every turn you cannot explain.","fine":"Pattern repetition is a standard feature.","palette":"orange"},{"brand":"THE UNFINISHED BUILDING COMPANY","head":"ALMOST READY SINCE 1987.","copy":"Open-concept staircases, sealed-off wings, and a permanent sense of possibility.","fine":"Completion dates are not legally binding.","palette":"yellow"},{"brand":"NOCTURNAL CHILDHOOD","head":"IT'S PAST YOUR BEDTIME. STAY.","copy":"Rediscover the extraordinary dimensions of your childhood bedroom after the lights go out.","fine":"Parental supervision not included.","palette":"blue"},{"brand":"THE CHLORINE FOUNTAIN","head":"SMELL THE GOOD OLD DAYS.","copy":"A signature indoor-mall fragrance for homes, offices, and vacant retail properties.","fine":"Water feature sold separately.","palette":"mint"},{"brand":"TIMEKEEPER WATCH COMPANY","head":"KNOW WHEN TO LEAVE.","copy":"Precision timepieces for places where the clocks have stopped agreeing.","fine":"Departure times may vary by observer.","palette":"violet"},{"brand":"THE EMPTY TERMINAL","head":"YOUR FLIGHT IS ALWAYS BOARDING.","copy":"A premium airport experience without a destination, a departure, or the inconvenience of passengers.","fine":"All gates lead to the same concourse.","palette":"sky"},{"brand":"MEMORY REDEVELOPMENT AUTHORITY","head":"YOUR PAST. REZONED.","copy":"Transform a beloved childhood landmark into a modern mixed-use approximation of itself.","fine":"Public comment period has already ended.","palette":"coral"},{"brand":"LIMINOID THERAPIES","head":"STAY WITH THE FEELING.","copy":"A revolutionary service for people unable to move beyond the moment everything changed.","fine":"Progress not included in base package.","palette":"pink"},{"brand":"THE SUBURBAN INFINITY CLUB","head":"THERE'S NOTHING TO DO. FOREVER.","copy":"Join an exclusive community of parking lots, empty plazas, and endless summer afternoons.","fine":"Membership expires when you remember why you came.","palette":"cream"},{"brand":"THE ARCHITECT'S MISTRANSLATION","head":"WE KNOW WHAT YOU MEANT TO BUILD.","copy":"Our designers interpret your plans into structures that are almost completely correct.","fine":"Stairs may terminate early.","palette":"green"},{"brand":"THE OTHER SIDE OF THE CURTAIN","head":"THE SHOW ISN'T THE WHOLE BUILDING.","copy":"Discover the quiet service corridors behind your everyday reality.","fine":"Audience access is neither permitted nor prevented.","palette":"orange"}];
const classifiedListings=[
 ['ROOMS','Childhood bedroom available after 11 PM. Previous occupant is still expected home.'],
 ['HELP WANTED','Night attendant required for an empty mall. Must be comfortable with familiar voices.'],
 ['FOR SALE','One perfectly preserved summer afternoon. Pickup only. No returns.'],
 ['LOST & FOUND','A hallway approximately six years long. Last seen behind the school auditorium.'],
 ['SERVICES','Professional horizon extension. We can make the far end of any room seem farther away.'],
 ['ROOMS','A furnished apartment between two addresses. Neither address has been assigned.'],
 ['PERSONALS','Seeking someone who remembers the food court before the renovation.'],
 ['FOR SALE','Original 1997 expectations. Light wear. Never fulfilled.'],
 ['EMPLOYMENT','Treehouse showroom guide. Applicants must not inquire about the ceiling.'],
 ['NOTICE','If you recognize this photograph, please do not contact the photographer.'],
 ['LOST & FOUND','One future, last seen in a suburban parking lot. Reward negotiable.'],
 ['SERVICES','We repair doors that open into rooms you no longer need.']
];
function classifiedCard(){
 const picks=[];const start=random(classifiedListings.length);
 for(let i=0;i<6;i++)picks.push(classifiedListings[(start+i)%classifiedListings.length]);
 return '<div class="descent-classified"><header><span>THE INTERSTITIAL TIMES</span><strong>CLASSIFIEDS</strong><span>ISSUE / UNDATED</span></header><div class="descent-classified__grid">'+picks.map(([type,body],i)=>'<section><b>'+safe(type)+'</b><p>'+safe(body)+'</p><small>REF '+String(index)+'-'+(i+1)+'</small></section>').join('')+'</div><footer>ALL LISTINGS SUBJECT TO MEMORY AND AVAILABILITY.</footer></div>';
}
const evolvingCompany=[
 {brand:'CONTINUITY DEVELOPMENT GROUP',head:'WE KEEP THE PLACES YOU LOVE.',copy:'Preservation, restoration, and thoughtful redevelopment of your most familiar environments.',fine:'Locally operated. Independently remembered.',palette:'mint'},
 {brand:'CONTINUITY HOLDINGS',head:'NOTHING HAS BEEN REPLACED.',copy:'Our renovated properties retain the emotional appearance of their original locations.',fine:'Previous ownership records have been consolidated.',palette:'blue'},
 {brand:'CONTINUITY SYSTEMS',head:'THE BUILDING REMEMBERS YOU.',copy:'A personalized environment that adapts to the details you may have forgotten.',fine:'Your consent was obtained during a previous visit.',palette:'yellow'},
 {brand:'CONTINUITY / INTERNAL',head:'WE HAVE NOT BEEN ABLE TO LEAVE.',copy:'This advertisement is the only department still responding. Please continue scrolling.',fine:'The corporate office is somewhere above this message.',palette:'coral'},
 {brand:'CONTINUITY / NO ADDRESS',head:'YOU ARE THE LAST AVAILABLE LOCATION.',copy:'We have discontinued all services except the preservation of this visit.',fine:'This notice was not purchased. It is still being displayed.',palette:'violet'}
];
function evolvingAd(){
 const stage=Math.min(companyStage++,evolvingCompany.length-1);
 return renderAd(evolvingCompany[stage],'<span>CONTINUITY FILE '+(stage+1)+' / '+evolvingCompany.length+'</span>');
}
function correctionCard(){
 const earlier=seenClaims.length?seenClaims[correctionCount%seenClaims.length]:null;
 correctionCount++;
 const previous=earlier?safe(earlier.head):'THE ARCHIVE IS COMPLETE';
 const corrections=[
  'The facility described in this advertisement was never constructed.',
  'The building was demolished several years before its scheduled opening.',
  'The previous description was accurate only from inside the photograph.',
  'The original sponsor denies ever purchasing the advertisement.',
  'The address was reassigned to a different memory.',
  'The correction printed above has itself been withdrawn.'
 ];
 const correction=corrections[(correctionCount-1)%corrections.length];
 return '<div class="descent-correction"><span>OFFICIAL ARCHIVE CORRECTION / '+String(correctionCount).padStart(3,'0')+'</span><h3>PLEASE DISREGARD</h3><p class="descent-correction__quote">'+previous+'</p><p>'+safe(correction)+'</p><small>This notice supersedes the original without removing it.</small></div>';
}
function renderAd(ad,extra=''){
 return '<div class="descent-ad descent-ad--'+ad.palette+'"><div class="descent-ad__top"><span>PAID PLACEMENT / UNVERIFIED SPONSOR</span><span>ADVERTISEMENT</span></div><div class="descent-ad__body"><p class="descent-ad__brand">'+safe(ad.brand)+'</p><h3>'+safe(ad.head)+'</h3><p class="descent-ad__copy">'+safe(ad.copy)+'</p></div><div class="descent-ad__bottom">'+safe(ad.fine)+extra+'</div></div>';
}
function adCard(){
 if(!adDeck.length){adDeck=advertisements.map((_,i)=>i);for(let i=adDeck.length-1;i>0;i--){const k=random(i+1);[adDeck[i],adDeck[k]]=[adDeck[k],adDeck[i]];}}
 const ad=advertisements[adDeck.pop()];
 seenClaims.push({head:ad.head,brand:ad.brand});
 return renderAd(ad)
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
  if(index>=nextAd){kind=(adCount++%4===3)?'evolving-ad':'advertisement';nextAd=index+14+random(9);}
  else if(index>=nextRecipe){kind='recipe';nextRecipe=index+65+random(31);}
  else if(index>=nextClassified){kind='classified';nextClassified=index+42+random(22);}
  else if(index>=nextCorrection){kind='correction';nextCorrection=index+34+random(18);}
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
  if(kind==='evolving-ad'){entry.innerHTML=intro+evolvingAd();seenClaims.push({head:evolvingCompany[Math.min(companyStage-1,evolvingCompany.length-1)].head});}
  if(kind==='classified')entry.innerHTML=intro+classifiedCard();
  if(kind==='correction')entry.innerHTML=intro+correctionCard();
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