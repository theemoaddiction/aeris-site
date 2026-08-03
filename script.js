
function playBoot(){const a=document.getElementById('boot-audio'); if(a){a.volume=.35; a.play().catch(()=>{});} document.body.classList.add('activated');}
const phrases=['RECIRCULATED EXHALE DETECTED','SPENCER\'S ENCOUNTER LOGGED','IF... HAS ENTERED THE ROOM','DO NOT TRUST THE ESCALATOR','SHE SINGS'];
setInterval(()=>{document.title=phrases[Math.floor(Math.random()*phrases.length)];},1800);

(() => {
  const raven=document.querySelector('.pixel-raven'),modal=document.querySelector('.raven-catch');
  if(!raven||!modal)return;
  const close=modal.querySelector('.raven-catch__close'),count=modal.querySelector('.raven-catch__count strong'),audio=modal.querySelector('audio');
  const key='aeris-ravens-caught'; let timer;
  const parts=Array.from({length:9},(_,i)=>`audio/raven-food-court.part-${String(i).padStart(2,'0')}`);
  Promise.all(parts.map(path=>fetch(path).then(response=>{if(!response.ok)throw new Error(`Missing Raven signal: ${path}`);return response.blob()}))).then(blobs=>{audio.src=URL.createObjectURL(new Blob(blobs,{type:'audio/mpeg'}));audio.load()}).catch(()=>{});
  const caught=()=>parseInt(localStorage.getItem(key)||'0',10);
  const schedule=()=>{clearTimeout(timer);timer=setTimeout(release,120000+Math.random()*240000)};
  function release(){if(!raven.hidden||!modal.hidden)return;const left=Math.random()>.5,max=Math.max(140,innerHeight-180);raven.hidden=false;raven.classList.toggle('pixel-raven--reverse',!left);raven.style.setProperty('--raven-start',left?'-180px':'calc(100vw + 180px)');raven.style.setProperty('--raven-end',left?'calc(100vw + 180px)':'-180px');raven.style.setProperty('--raven-top',`${90+Math.random()*(max-90)}px`);raven.style.setProperty('--raven-duration',`${7+Math.random()*4}s`);raven.classList.remove('pixel-raven--flying');void raven.offsetWidth;raven.classList.add('pixel-raven--flying')}
  function finish(){raven.hidden=true;raven.classList.remove('pixel-raven--flying');schedule()}
  function catchIt(){const n=Math.max(caught(),1);localStorage.setItem(key,n);finish();count.textContent=`${n}/8`;modal.hidden=false;document.body.classList.add('raven-caught');close.focus();audio.currentTime=0;audio.play().catch(()=>{})}
  function closeIt(){audio.pause();modal.hidden=true;document.body.classList.remove('raven-caught')}
  raven.addEventListener('click',catchIt);raven.addEventListener('animationend',e=>{if(e.animationName==='raven-flight')finish()});close.addEventListener('click',closeIt);modal.addEventListener('click',e=>{if(e.target===modal)closeIt()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)closeIt()});count.textContent=`${Math.min(caught(),8)}/8`;schedule();
  if(new URLSearchParams(location.search).has('release-raven'))setTimeout(release,300);
})();
