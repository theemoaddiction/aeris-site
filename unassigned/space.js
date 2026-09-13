(() => {
  const field = document.querySelector('#field'), sheet = document.querySelector('#sheet');
  const ball = document.querySelector('#ball'), hole = document.querySelector('#hole');
  const other = document.querySelector('#other'), visitors = document.querySelector('#visitors');
  const status = document.querySelector('#status'), message = document.querySelector('#message');
  const exit = document.querySelector('#exit'), undo = document.querySelector('#undo');
  document.querySelector('#date').textContent = new Date().toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric'}).toUpperCase();
  const clamp = (v,a,b) => Math.min(b,Math.max(a,v));
  const bounds = () => field.getBoundingClientRect();
  const items = [...document.querySelectorAll('[data-feed]')];
  let damage=0, fed=[], drops=0, cursorVisible=false, cursorX=0, cursorY=0, goalX=0, goalY=0;
  let ballX=0, ballY=-30, vx=1, vy=0, ballAlive=true, dragging=null, pointer={x:0,y:0}, exitTries=0, exitDrag=null, holeSize=30, hungry=false;
  let last=performance.now(), lastCursorGoal=0, lastNudge=0, lastMessage=0;
  const say = (s) => { message.textContent=s; lastMessage=performance.now(); };
  const setBall = () => {ball.style.left=ballX+'px'; ball.style.top=ballY+'px';};
  const setHole = () => { hole.style.width=holeSize+'px';hole.style.height=holeSize+'px'; };
  function fieldPoint(e){const r=bounds();return {x:e.clientX-r.left,y:e.clientY-r.top};}
  function holeCenter(){const r=hole.getBoundingClientRect(), f=bounds();return {x:r.left+r.width/2-f.left,y:r.top+r.height/2-f.top};}
  function swallow(el){
    if(el.classList.contains('consumed'))return;
    el.classList.add('consumed');fed.push(el);undo.hidden=false;
    holeSize=Math.min(120,holeSize+12);setHole();
    if(el===ball){ballAlive=false;visitors.textContent='2 PEOPLE HERE';goalX=holeCenter().x;goalY=holeCenter().y; say('');}
    if(el===exit){exit.style.transform=''; say('');}
    if(el===other){cursorVisible=false;other.style.opacity=0;visitors.textContent='1 PERSON HERE';}
    if(fed.length>=3){hungry=true;sheet.dataset.hungry='true';status.textContent='SPACE STATUS: INCOMPLETE';}
  }
  function nearHole(x,y,pad=0){const h=holeCenter();return Math.hypot(x-h.x,y-h.y)<holeSize/2+pad;}
  function bounce(){drops++;damage=Math.min(8,drops);sheet.dataset.damage=damage;status.textContent=damage<3?'SPACE STATUS: STABLE':damage<6?'SPACE STATUS: UNVERIFIED':'SPACE STATUS: DEGRADING';
    if(drops===3) say('');
    if(drops>=6 && !hungry){hungry=true;sheet.dataset.hungry='true';}
    vy=-Math.max(4,6-drops*.12);vx=(Math.random()-.5)*5;
  }
  function toss(){if(!ballAlive)return;vy=-Math.max(8,Math.abs(vy)+3);vx+=(Math.random()-.5)*2;ball.focus({preventScroll:true});}
  function animate(t){
    const dt=Math.min((t-last)/16.67,2);last=t;const r=bounds();
    if(ballAlive && dragging?.el!==ball){
      vy+=.23*dt;ballX+=vx*dt;ballY+=vy*dt;
      if(ballX<0||ballX>r.width-23){ballX=clamp(ballX,0,r.width-23);vx*=-.84;}
      if(ballY>r.height-23){ballY=r.height-23;bounce();}
      if(nearHole(ballX+11,ballY+11,4))swallow(ball);
      setBall();
    }
    if(cursorVisible){
      if(t-lastCursorGoal>2400){lastCursorGoal=t;
        const targets=[...items.filter(el=>!el.classList.contains('consumed')),ballAlive?ball:hole].filter(Boolean);
        const target=targets[Math.floor(Math.random()*targets.length)];const rect=target.getBoundingClientRect();
        goalX=clamp(rect.left-r.left+rect.width/2,10,r.width-24);goalY=clamp(rect.top-r.top+rect.height/2,10,r.height-32);
      }
      const chase=Math.hypot(pointer.x-cursorX,pointer.y-cursorY);
      if(chase<70 && t-lastNudge>400){lastNudge=t;goalX=clamp(cursorX+(cursorX-pointer.x)*2+(Math.random()-.5)*120,6,r.width-25);goalY=clamp(cursorY+(cursorY-pointer.y)*2+(Math.random()-.5)*120,5,r.height-30);}
      cursorX+=(goalX-cursorX)*.024*dt;cursorY+=(goalY-cursorY)*.024*dt;
      other.style.left=cursorX+'px';other.style.top=cursorY+'px';
      if(ballAlive && Math.hypot(cursorX-ballX,cursorY-ballY)<22 && t-lastNudge>1200){vy-=3;vx+=(ballX-cursorX>0?1:-1);lastNudge=t;}
      if(exitTries>0 && exitTries<3 && Math.hypot(cursorX-(r.width-70),cursorY-(r.height-28))<36){exitTries=3;exit.style.transform='';}
      if(nearHole(cursorX+7,cursorY+8,3) && fed.length>=2){swallow(other);}
    }
    if(message.textContent && t-lastMessage>3500)message.textContent='';
    if(hungry && t-lastNudge>12000){const left=items.filter(el=>!el.classList.contains('consumed')&&el.dataset.feed!=='footer');if(left.length){lastNudge=t;swallow(left[Math.floor(Math.random()*left.length)]);}}
    requestAnimationFrame(animate);
  }
  setTimeout(()=>{cursorVisible=true;cursorX=bounds().width*.65;cursorY=bounds().height*.25;goalX=cursorX;goalY=cursorY;other.style.opacity=1;visitors.textContent='2 PEOPLE HERE';},4200);
  setTimeout(()=>{const r=bounds();ballX=r.width*.48;ballY=-23;ballAlive=true;ball.style.opacity=1;setBall();},5800);
  ball.style.opacity=0;ballAlive=false;
  requestAnimationFrame(animate);
  field.addEventListener('pointermove',e=>{pointer=fieldPoint(e);if(dragging){const p=fieldPoint(e);const el=dragging.el;if(el===ball){ballX=clamp(p.x-11,0,bounds().width-23);ballY=clamp(p.y-11,0,bounds().height-23);setBall();}else{el.style.transform=`translate(${e.clientX-dragging.x}px,${e.clientY-dragging.y}px) ${el.dataset.feed==='stamp'?'rotate(-7deg)':''}`;}}});
  field.addEventListener('pointerdown',e=>{const el=e.target.closest('.ball,.item,.hole');if(!el||el===hole||el.classList.contains('consumed'))return;
    if(el===ball && !ballAlive)return;
    dragging={el,x:e.clientX,y:e.clientY};el.classList.add('dragging');el.setPointerCapture(e.pointerId);if(el===ball){vx=0;vy=0;e.preventDefault();}
  });
  field.addEventListener('pointerup',e=>{if(!dragging)return;const {el,x,y}=dragging;dragging=null;el.classList.remove('dragging');const p=fieldPoint(e);
    if(nearHole(p.x,p.y,Math.min(24,el.offsetWidth*.1)))swallow(el);
    else if(el===ball){vx=clamp((e.clientX-x)*.09,-8,8);vy=clamp((e.clientY-y)*.07-7,-15,6);}
    else {el.style.transform='';}
  });
  ball.addEventListener('click',toss);ball.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toss();}});
  hole.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();if(ballAlive)swallow(ball);}});
  undo.addEventListener('click',()=>{fed.forEach(el=>{el.classList.remove('consumed');el.style.transform='';});fed=[];undo.hidden=true;holeSize=30;setHole();hungry=false;sheet.dataset.hungry='false';if(!ballAlive){ballAlive=true;ballX=bounds().width*.48;ballY=-23;vx=1;vy=0;setBall();} if(!cursorVisible){cursorVisible=true;other.style.opacity=1;visitors.textContent='2 PEOPLE HERE';} status.textContent='SPACE STATUS: RESTORED';});
  function evade(){if(exitTries>=3||exit.classList.contains('consumed'))return;exitTries++;const directions=['translate(-55px,-36px)','translate(-100px,0)','translate(-24px,-58px)'];exit.style.transform=directions[exitTries-1];if(exitTries===3)setTimeout(()=>{exit.style.transform='';},900);}
  exit.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')evade();});
  exit.addEventListener('pointerdown',e=>{if(exitTries<3){e.preventDefault();evade();return;}exitDrag={x:e.clientX,y:e.clientY,moved:false};exit.setPointerCapture(e.pointerId);});
  exit.addEventListener('click',e=>{if(exitTries<3||exitDrag?.moved||exit.classList.contains('consumed'))e.preventDefault();exitDrag=null;});
  exit.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')exitTries=3;});
  // After it stops running, the exit can be offered to the hole.
  exit.addEventListener('pointermove',e=>{if(!exitDrag)return;const dx=e.clientX-exitDrag.x,dy=e.clientY-exitDrag.y;if(Math.hypot(dx,dy)>8)exitDrag.moved=true;if(exitDrag.moved){e.preventDefault();exit.style.transform=`translate(${dx}px,${dy}px)`;const p=fieldPoint(e);if(nearHole(p.x,p.y,25))swallow(exit);}});
  exit.addEventListener('pointerup',()=>{if(exitDrag?.moved && !exit.classList.contains('consumed'))exit.style.transform='';setTimeout(()=>exitDrag=null,0);});
})();
