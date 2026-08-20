
function playBoot(){const a=document.getElementById('boot-audio'); if(a){a.volume=.35; a.play().catch(()=>{});} document.body.classList.add('activated');}
const phrases=['RECIRCULATED EXHALE DETECTED','SPENCER\'S ENCOUNTER LOGGED','IF... HAS ENTERED THE ROOM','DO NOT TRUST THE ESCALATOR','SHE SINGS'];
setInterval(()=>{document.title=phrases[Math.floor(Math.random()*phrases.length)];},1800);

(() => {
  const raven=document.querySelector('.pixel-raven'),modal=document.querySelector('.raven-catch');
  if(!raven||!modal)return;
  const close=modal.querySelector('.raven-catch__close'),count=modal.querySelector('.raven-catch__count strong'),audio=modal.querySelector('audio'),trackName=modal.querySelector('.raven-catch__track'),flavor=modal.querySelector('.raven-catch__flavor'),behavior=modal.querySelector('.raven-catch__behavior');
  const key='aeris-ravens-caught-v2',total=7; let timer,currentTrack,loadedTrack,objectUrl;
  const tracks=[
    {id:'food-court',title:'Raven (Crying in the Food Court)',slug:'raven-food-court',parts:9,flavor:'It learned to cry quietly so nobody would ask what was wrong.',behavior:'OBSERVED BEHAVIOR: Pretends the mall is still open.'},
    {id:'medication-resistant',title:'Raven (Medication Resistant)',slug:'raven-medication-resistant',parts:8,flavor:'It has survived several recommended treatments and one extremely confident pharmacist.',behavior:'OBSERVED BEHAVIOR: Gets louder when approached calmly.'},
    {id:'radio-edit',title:'Raven (Radio Edit for Cowards)',slug:'raven-radio-edit-for-cowards',parts:8,flavor:'Its sharpest edges have been removed for your comfort and continued engagement.',behavior:'OBSERVED BEHAVIOR: Answers to focus groups.'},
    {id:'trenchcoat',title:'Raven (8 Ravens in a Trenchcoat)',slug:'raven-8-ravens-in-a-trenchcoat',parts:8,flavor:'Nobody knows how they coordinated this. Nobody wants to be the one who checks.',behavior:'OBSERVED BEHAVIOR: Alternates between emotional collapse and pretending to have a job.'},
    {id:'emotional-support',title:'Raven (Producer’s Emotional Support Version)',slug:'raven-producers-emotional-support-version',parts:9,flavor:'It was not trained for this. It just makes reassuring noises when the room becomes unbearable.',behavior:'OBSERVED BEHAVIOR: Beeps. Boops. Remains nearby.'},
    {id:'captivity',title:'Raven (Raised in Captivity)',slug:'raven-raised-in-captivity',parts:8,flavor:'It has never seen the ocean, but appears to remember it.',behavior:'OBSERVED BEHAVIOR: Sways gently when cornered.'},
    {id:'cornered',title:'Raven (Pretty When Cornered)',slug:'raven-pretty-when-cornered',parts:8,flavor:'It becomes unusually beautiful when it realizes there is nowhere left to go.',behavior:'OBSERVED BEHAVIOR: Mistakes survival for performance.'}
  ];
  const caught=()=>{try{return JSON.parse(localStorage.getItem(key)||'[]')}catch{return[]}};
  const chooseTrack=()=>{const found=caught(),unseen=tracks.filter(track=>!found.includes(track.id)),pool=unseen.length?unseen:tracks;return pool[Math.floor(Math.random()*pool.length)]};
  const loadTrack=track=>{if(loadedTrack===track.id)return Promise.resolve();const parts=Array.from({length:track.parts},(_,i)=>`audio/${track.slug}.part-${String(i).padStart(2,'0')}`);return Promise.all(parts.map(path=>fetch(path).then(response=>{if(!response.ok)throw new Error(`Missing Raven signal: ${path}`);return response.blob()}))).then(blobs=>{if(objectUrl)URL.revokeObjectURL(objectUrl);objectUrl=URL.createObjectURL(new Blob(blobs,{type:'audio/mpeg'}));audio.src=objectUrl;audio.load();loadedTrack=track.id})};
  const schedule=()=>{clearTimeout(timer);timer=setTimeout(release,120000+Math.random()*240000)};
  function release(){if(!raven.hidden||!modal.hidden)return;currentTrack=chooseTrack();loadTrack(currentTrack).catch(()=>{});const left=Math.random()>.5,max=Math.max(140,innerHeight-180);raven.hidden=false;raven.classList.toggle('pixel-raven--reverse',!left);raven.style.setProperty('--raven-start',left?'-180px':'calc(100vw + 180px)');raven.style.setProperty('--raven-end',left?'calc(100vw + 180px)':'-180px');raven.style.setProperty('--raven-top',`${90+Math.random()*(max-90)}px`);raven.style.setProperty('--raven-duration',`${7+Math.random()*4}s`);raven.classList.remove('pixel-raven--flying');void raven.offsetWidth;raven.classList.add('pixel-raven--flying')}
  function finish(){raven.hidden=true;raven.classList.remove('pixel-raven--flying');schedule()}
  function catchIt(){if(!currentTrack)return;const found=caught();if(!found.includes(currentTrack.id))found.push(currentTrack.id);localStorage.setItem(key,JSON.stringify(found));finish();count.textContent=`${Math.min(found.length,total)}/${total}`;trackName.textContent=currentTrack.title.toUpperCase();flavor.textContent=currentTrack.flavor;behavior.textContent=currentTrack.behavior;modal.hidden=false;document.body.classList.add('raven-caught');close.focus();loadTrack(currentTrack).then(()=>{audio.currentTime=0;audio.play().catch(()=>{})}).catch(()=>{})}
  function closeIt(){audio.pause();modal.hidden=true;document.body.classList.remove('raven-caught')}
  raven.addEventListener('click',catchIt);raven.addEventListener('animationend',e=>{if(e.animationName==='raven-flight')finish()});close.addEventListener('click',closeIt);modal.addEventListener('click',e=>{if(e.target===modal)closeIt()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)closeIt()});count.textContent=`${Math.min(caught().length,total)}/${total}`;schedule();
  if(new URLSearchParams(location.search).has('release-raven'))setTimeout(release,300);
})();
// Raven collection deployment refresh: 2026-08-03


(() => {
  const tracker=document.querySelector('.recovery-tracker');
  const cards=[...document.querySelectorAll('[data-anomaly-id]')];
  if(!tracker||!cards.length)return;

  const key='aeris-anomalies-recovered-v1';
  const unlistedIds=['misplaced-homepage'];
  const count=tracker.querySelector('.recovery-tracker__count');
  const bar=tracker.querySelector('.recovery-tracker__bar');
  const knownIds=new Set([...cards.map(card=>card.dataset.anomalyId),...unlistedIds]);
  const total=knownIds.size;

  const read=()=>{
    try{
      const saved=JSON.parse(localStorage.getItem(key)||'[]');
      return Array.isArray(saved)?saved.filter(id=>knownIds.has(id)):[];
    }catch{
      return [];
    }
  };

  const render=()=>{
    const recovered=new Set(read());
    cards.forEach(card=>card.dataset.recovered=String(recovered.has(card.dataset.anomalyId)));
    count.textContent=`${recovered.size} / ${total}`;
    const progress=(recovered.size/total)*100;
    tracker.style.setProperty('--recovery-progress',`${progress}%`);
    bar.setAttribute('aria-label',`${recovered.size} of ${total} anomalies recovered`);
  };

  const recover=id=>{
    const recovered=new Set(read());
    recovered.add(id);
    localStorage.setItem(key,JSON.stringify([...recovered]));
    render();
  };

  cards.forEach(card=>card.addEventListener('click',()=>recover(card.dataset.anomalyId)));
  if(document.documentElement.dataset.homeVariant==='paper')recover('misplaced-homepage');
  window.addEventListener('storage',event=>{if(event.key===key)render()});
  render();
})();

(() => {
  const paper=document.querySelector('.paper-home');
  if(!paper)return;
  paper.querySelectorAll('[data-enter-standard]').forEach(link=>{
    link.addEventListener('click',()=>{
      document.documentElement.dataset.homeVariant='standard';
      const target=document.querySelector(link.dataset.enterStandard);
      requestAnimationFrame(()=>target?.scrollIntoView({behavior:'smooth'}));
    });
  });
})();
