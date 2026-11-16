(() => {
  'use strict';
  const root = document.querySelector('#descent-feed');
  const sentinel = document.querySelector('#descent-sentinel');
  const status = document.querySelector('#descent-status');
  if (!root || !sentinel) return;
  const batchSize = 5;
  let entries = [], cursor = 0, loading = false;
  const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const shuffle = array => { const a = [...array]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; };
  const audioPool = (window.RECORDS || []).flatMap(release => (release.tracks || [])
    .filter(t => t.audio).map(t => ({title:t.title,artist:release.artist,src:t.audio.replace(/^\.\.\//,'')})));
  function build(data) {
    const pictures = shuffle(data.images || []);
    const notes = data.notes || [];
    entries = pictures.map((src, i) => ({
      src, note: notes[i % notes.length] || '',
      minDepth: i < 5 ? 0 : i < 11 ? 1 : i < 16 ? 2 : 3,
      audio: i > 5 && i % 4 === 0 && audioPool.length ? audioPool[(i * 17) % audioPool.length] : null
    }));
  }
  function addBatch() {
    if (loading || !entries.length) return;
    loading = true;
    const fragment = document.createDocumentFragment();
    for (let n=0;n<batchSize;n++) {
      const index = cursor++;
      const cycle = Math.floor(index / entries.length);
      const depth = Math.min(3, Math.floor(index / 7));
      const eligible = entries.filter(e => e.minDepth <= depth);
      const entry = eligible[(index * 7 + cycle * 3) % eligible.length];
      const article = document.createElement('article');
      article.className = 'descent-entry descent-entry--depth-' + depth;
      const number = String(index + 1).padStart(3,'0');
      const image = document.createElement('img');
      image.src = entry.src; image.alt = 'Archive image ' + number;
      image.loading = 'lazy'; image.decoding = 'async';
      article.innerHTML = '<p class="descent-entry__index">ARCHIVE / ' + number + '</p>';
      article.appendChild(image);
      const caption = document.createElement('p');
      caption.className = 'descent-entry__note'; caption.textContent = entry.note;
      article.appendChild(caption);
      if (entry.audio) {
        const label = document.createElement('p');
        label.className = 'descent-entry__track';
        label.textContent = 'RELATED RECORDING / ' + entry.audio.artist + ' / ' + entry.audio.title;
        article.appendChild(label);
        const player = document.createElement('audio');
        player.controls = true; player.preload = 'none'; player.src = entry.audio.src;
        player.addEventListener('play', () => document.querySelectorAll('#descent-feed audio').forEach(a => {if(a !== player) a.pause();}));
        article.appendChild(player);
      }
      fragment.appendChild(article);
    }
    root.appendChild(fragment);
    if(status) status.textContent = 'YOU HAVE BEEN HERE FOR ' + cursor + ' ENTRIES. THERE IS NO REQUIRED ENDING.';
    loading = false;
  }
  fetch('descent/manifest.json').then(r => {if(!r.ok) throw new Error('manifest');return r.json();})
    .then(data => {build(data);addBatch(); const observer = new IntersectionObserver(items => {
      if(items.some(item=>item.isIntersecting)) addBatch();
    }, {rootMargin:'850px 0px'});observer.observe(sentinel);})
    .catch(() => {if(status) status.textContent='THE ARCHIVE IS TEMPORARILY UNAVAILABLE.';});
})();