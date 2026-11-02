(() => {
  'use strict';
  const releases = window.RECORDS;
  const grid = document.querySelector('#records');
  const dialog = document.querySelector('#release-dialog');
  const content = document.querySelector('#release-content');
  const search = document.querySelector('#search');
  const sort = document.querySelector('#sort');
  let artist = 'all', currentId = null, audio = null, playingIndex = -1, previousFocus = null;
  const escape = value => String(value).replace(/[&<>"']/g, x => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
  const date = r => r.year ? `${r.approx ? 'c. ' : ''}${r.year}` : 'Undated';
  const imagePath = r => r.cover && (r.cover.startsWith('../') ? r.cover : `assets/${r.cover}`);
  const art = (r, index) => r.cover ? `<img src="${escape(imagePath(r))}" alt="${escape(r.title)} cover" loading="lazy" width="600" height="600">` : `<span class="number">ARCHIVE / ${String(index + 1).padStart(2, '0')}</span><strong>${escape(r.title)}</strong><small>ARTWORK TO FOLLOW</small>`;
  function render() {
    const query = search.value.trim().toLocaleLowerCase();
    const filtered = releases.filter(r => (artist === 'all' || r.artist === artist) && [r.title,r.artist,r.year,...r.tracks.map(t => t.title)].join(' ').toLocaleLowerCase().includes(query));
    filtered.sort((a,b) => sort.value === 'title' ? a.title.localeCompare(b.title) : a.year == null ? (b.year == null ? 0 : 1) : b.year == null ? -1 : (sort.value === 'new' ? b.year-a.year : a.year-b.year));
    grid.innerHTML = filtered.map(r => `<a class="record" href="#release=${encodeURIComponent(r.id)}" aria-label="Open ${escape(r.title)} by ${escape(r.artist)}"><div class="art ${r.cover ? '' : 'art-placeholder'}">${art(r,releases.indexOf(r))}${r.artNote === 'New archive artwork' ? '<span class="art-note">NEW ARCHIVE SLEEVE</span>' : ''}<span class="open" aria-hidden="true">↗</span></div><div class="record-meta"><span>${date(r)}</span><span>${escape(r.kind.toUpperCase())}</span></div><h3>${escape(r.title)}</h3><p class="record-artist">${escape(r.artist)}</p></a>`).join('');
    document.querySelector('#record-count').textContent = `${String(filtered.length).padStart(2,'0')} RECORD${filtered.length === 1 ? '' : 'S'}`;
    document.querySelector('#empty').hidden = filtered.length !== 0;
  }
  document.querySelectorAll('[data-artist]').forEach(button => button.addEventListener('click', () => {
    artist = button.dataset.artist;
    document.querySelectorAll('[data-artist]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    render();
  }));
  search.addEventListener('input',render); sort.addEventListener('change',render);
  function stopAudio() { if (audio) { audio.pause(); audio.removeAttribute('src'); audio.load(); audio = null; } playingIndex = -1; }
  function openRelease(id) {
    const r = releases.find(item => item.id === id);
    if (!r) return;
    if (id === currentId && dialog.open) return;
    if (!dialog.open) previousFocus = document.activeElement;
    stopAudio(); currentId = id;
    const playable = r.tracks.some(t => t.audio);
    content.innerHTML = `<div class="release-head">${r.cover ? `<div><img class="release-art" src="${escape(imagePath(r))}" alt="${escape(r.title)} cover">${r.artNote ? `<p class="art-credit">${escape(r.artNote)}</p>` : ''}</div>` : `<div class="art art-placeholder empty-art">${art(r,releases.indexOf(r))}</div>`}<div><p class="eyebrow">${escape(r.kind.toUpperCase())} / ${date(r)}</p><h2 id="release-title">${escape(r.title)}</h2><div class="release-byline">${escape(r.artist)}${r.tracks.length ? ` · ${r.tracks.length} tracks listed` : ''}</div><p class="release-summary">${escape(r.summary)}</p>${r.edition ? `<p class="track-note">${escape(r.edition)}</p>` : ''}<div class="release-links">${r.links.map((link,i) => `<a ${i===0?'class="primary"':''} href="${escape(link.url)}" ${link.url.startsWith('https:')?'target="_blank" rel="noopener"':''}>${escape(link.label)} ↗</a>`).join('')}</div></div></div><div class="release-body"><div class="track-heading"><h3>${r.tracks.length ? 'TRACK LIST' : 'FROM THE ARCHIVE'}</h3>${playable ? '<button class="play-all" type="button">▶ Play album</button>' : ''}</div>${r.trackNote ? `<p class="track-note">${escape(r.trackNote)}</p>` : ''}${playable ? '<p class="now-playing" aria-live="polite">Choose a track to listen.</p><audio class="audio-player" controls preload="none"></audio>' : ''}${r.tracks.length ? `<ol class="track-list">${r.tracks.map((track,i) => `<li class="track" data-track="${i}"><span class="track-number">${String(i+1).padStart(2,'0')}</span><span class="track-title">${escape(track.title)}</span><div class="track-actions">${track.audio ? `<button type="button" class="track-play" data-play="${i}" aria-label="Play ${escape(track.title)}">▶</button><a href="${escape(track.audio)}" download aria-label="Download ${escape(track.title)}">MP3 ↓</a>` : ''}</div></li>`).join('')}</ol>` : '<p class="not-yet">The sleeve is here. Track details and recordings will follow.</p>'}${!playable && !r.links.length ? '<p class="not-yet">Listening and download links will be added as the recordings are gathered.</p>' : ''}${r.related.length ? `<section class="related"><h3>FOLLOW THE THREAD</h3>${r.related.map(id => {const other=releases.find(x => x.id===id);return `<a href="#release=${other.id}">${escape(other.title)} <small>(${date(other)})</small> →</a>`;}).join('')}</section>` : ''}</div>`;
    if (playable) {
      audio = content.querySelector('audio');
      audio.addEventListener('ended', () => { const next = r.tracks.findIndex((t,i) => i > playingIndex && t.audio); if (next >= 0) playTrack(next); else updatePlaying(false); });
      audio.addEventListener('play', () => updatePlaying(true)); audio.addEventListener('pause', () => updatePlaying(false));
      audio.addEventListener('error', () => { content.querySelector('.now-playing').textContent='This recording couldn’t load. Try its MP3 download link.'; });
      content.querySelector('.play-all').addEventListener('click', () => playTrack(r.tracks.findIndex(t => t.audio)));
      content.querySelectorAll('[data-play]').forEach(b => b.addEventListener('click', () => {const i=Number(b.dataset.play);if(i === playingIndex && !audio.paused) audio.pause();else playTrack(i);}));
    }
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0; document.body.classList.add('modal-open');
  }
  function updatePlaying(playing) {content.querySelectorAll('[data-track]').forEach(row => {const active=Number(row.dataset.track)===playingIndex;row.classList.toggle('playing',active);const button=row.querySelector('[data-play]');if(button){button.textContent=active&&playing?'Ⅱ':'▶';button.setAttribute('aria-label',`${active&&playing?'Pause':'Play'} ${row.querySelector('.track-title').textContent}`);}});}
  function playTrack(index) {
    const r=releases.find(x => x.id===currentId), track=r.tracks[index];if(!track?.audio || !audio)return;
    if(index!==playingIndex){audio.src=track.audio;playingIndex=index;}
    content.querySelector('.now-playing').textContent=`${String(index+1).padStart(2,'0')} / ${track.title}`;
    audio.play().catch(() => {content.querySelector('.now-playing').textContent='Press play in the audio controls to begin.';});
  }
  function syncHash() {const match=location.hash.match(/^#release=([a-z0-9-]+)$/);if(match)openRelease(match[1]);else if(dialog.open)dialog.close();}
  function closeRelease(){dialog.close();if(location.hash.startsWith('#release='))history.replaceState(null,'',location.pathname+location.search+'#catalog');}
  document.querySelector('.close').addEventListener('click',closeRelease);
  dialog.addEventListener('cancel',event => {event.preventDefault();closeRelease();});
  dialog.addEventListener('click',event => {if(event.target===dialog){const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)closeRelease();}});
  dialog.addEventListener('close',() => {stopAudio();currentId=null;document.body.classList.remove('modal-open');if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});});
  window.addEventListener('hashchange',syncHash);render();syncHash();
})();
