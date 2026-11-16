(() => {
'use strict';
const feed=document.querySelector('#descent-feed');
if(!feed)return;
let inserted=false;
function install(){
 if(inserted || feed.querySelectorAll(':scope > .descent-entry').length<32)return;
 inserted=true;
 const section=document.createElement('section');
 section.className='descent-mirror';
 section.id='descent-mirror';
 section.setAttribute('aria-label','The other homepage');
 section.innerHTML=`
 <div class="descent-mirror__edge"><span>YOU HAVE REACHED THE TOP OF THE WEBSITE</span><span>THIS IS NOT THE TOP OF THE WEBSITE</span></div>
 <header class="descent-mirror__header">
  <a class="descent-mirror__logo" href="#descent-mirror" aria-label="Return to the other homepage">AERIS <em>MANDRAKE</em></a>
  <nav aria-label="Other homepage navigation">
   <a href="#mirror-records">RECORD ROOM</a>
   <a href="#mirror-about">ABOUT</a>
   <a href="#mirror-entrance">ANOMALIES</a>
   <a href="#descent">HOME</a>
  </nav>
 </header>
 <div class="descent-mirror__hero">
  <p class="descent-mirror__kicker">OFFICIAL WEBSITE / RESTORED FROM MEMORY</p>
  <h2>THE RECORD ROOM<br><span>WAS OPEN.</span></h2>
  <p>Everything is still where you left it. We have made a few changes to what that means.</p>
  <a class="descent-mirror__cta" href="#mirror-records">ENTER THE RECORD ROOM</a>
 </div>
 <div class="descent-mirror__records" id="mirror-records">
  <p class="descent-mirror__kicker">FEATURED RELEASES / ALTERNATE INVENTORY</p>
  <div class="descent-mirror__grid">
   <a href="records/#release=oh1god"><img src="records/assets/oh1god-single.png" loading="lazy" alt="OH1GOD single artwork"><strong>OH1GOD</strong><small>STILL AVAILABLE / ORIGINAL RECORDING</small></a>
   <a href="records/"><img src="assets/if-bedroom-cover-home.webp" loading="lazy" alt="if... album artwork"><strong>if...</strong><small>THE ROOM WAS NEVER EMPTY</small></a>
   <a href="interloper/"><img src="assets/liminal-escalator-home.webp" loading="lazy" alt="Empty escalator"><strong>INTERLOPER</strong><small>WE ARE PLEASED YOU RETURNED</small></a>
  </div>
 </div>
 <div class="descent-mirror__about" id="mirror-about">
  <p class="descent-mirror__kicker">ABOUT THE ARTIST / REVISED</p>
  <h3>THIS IS THE SAME PERSON.</h3>
  <p>There are years of recordings here. Some were made by someone who believed the next song would explain the last one. Some were made after that stopped being true.</p>
  <p>Nothing has been erased. The version you remember is still available upstairs.</p>
 </div>
 <div class="descent-mirror__entrance" id="mirror-entrance">
  <p class="descent-mirror__kicker">OTHER DEPARTMENTS</p>
  <a href="interloper/concourse.html">VISIT THE CONCOURSE <span>THE LIGHTS ARE STILL ON</span></a>
  <a href="office-across-the-street/">THE OFFICE ACROSS THE STREET <span>BUSINESS AS USUAL</span></a>
  <a href="holiday-catalog/">THE HOLIDAY CATALOG <span>ALL ITEMS SUBJECT TO CHANGE</span></a>
 </div>
 <footer class="descent-mirror__footer">
  <p>© AERIS MANDRAKE / ALL PERSONALITIES SUBJECT TO CHANGE</p>
  <button type="button" class="descent-mirror__continue">THIS IS NOT THE END OF THE PAGE ↓</button>
 </footer>`;
 const entries=[...feed.querySelectorAll(':scope > .descent-entry')];
 entries[31].after(section);
 section.querySelector('.descent-mirror__continue').addEventListener('click',()=>{
   const next=section.nextElementSibling;
   if(next)next.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
   else document.querySelector('#descent-sentinel')?.scrollIntoView({behavior:'smooth'});
 });
}
const observer=new MutationObserver(install);observer.observe(feed,{childList:true});install();
})();