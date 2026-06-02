
function playBoot(){const a=document.getElementById('boot-audio'); if(a){a.volume=.35; a.play().catch(()=>{});} document.body.classList.add('activated');}
const phrases=['RECIRCULATED EXHALE DETECTED','SPENCER\'S ENCOUNTER LOGGED','IF... HAS ENTERED THE ROOM','DO NOT TRUST THE ESCALATOR','SHE SINGS'];
setInterval(()=>{document.title=phrases[Math.floor(Math.random()*phrases.length)];},1800);
