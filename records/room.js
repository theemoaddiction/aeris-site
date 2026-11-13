(() => {
  'use strict';
  const releases = window.RECORDS;
  const earlyReleaseCutoff = releases.find(r => r.id === 'best-week-ever').year;
  const isEarlyRelease = r => r.year != null && r.year <= earlyReleaseCutoff;
  const grid = document.querySelector('#records');
  const dialog = document.querySelector('#release-dialog');
  const content = document.querySelector('#release-content');
  const search = document.querySelector('#search');
  const sort = document.querySelector('#sort');
  let artist = 'all', releaseType = 'all', currentId = null, audio = null, playingIndex = -1, previousFocus = null;
  let playCounted = false;
  const radioAudio = document.querySelector('#radio-audio');
  const radioToggle = document.querySelector('#radio-toggle');
  const radioSkip = document.querySelector('#radio-skip');
  const radioStatus = document.querySelector('#radio-status');
  const radioTrack = document.querySelector('#radio-track');
  const radioPool = releases.flatMap(release => release.tracks
    .filter(track => track.audio)
    .map(track => ({ release, track, weight: isEarlyRelease(release) ? 1 : 2 })));
  const recentRadioTracks = [];
  const unavailableRadioTracks = new Set();
  let radioSelection = null;
  let radioRequested = false;
  const lyricRequests = new Map();
  const escape = value => String(value).replace(/[&<>"']/g, x => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
  const date = r => r.year ? `${r.approx ? 'c. ' : ''}${r.year}` : 'Undated';
  const imagePath = r => r.cover && (r.cover.startsWith('../') ? r.cover : `assets/${r.cover}`);
  const art = (r, index) => r.cover ? `<img src="${escape(imagePath(r))}" alt="${escape(r.title)} cover" loading="lazy" width="600" height="600">` : `<span class="number">ARCHIVE / ${String(index + 1).padStart(2, '0')}</span><strong>${escape(r.title)}</strong><small>ARTWORK TO FOLLOW</small>`;
  const todayLocal = () => {
    const d = new Date();
    return [d.getFullYear(), String(d.getMonth()+1).padStart(2,'0'), String(d.getDate()).padStart(2,'0')].join('-');
  };
  const isUpcoming = r => Boolean(r.releaseDate && todayLocal() < r.releaseDate);
  const shopLink = r => (r.links || []).find(link => link.url && /^https:\/\/ko-fi\.com\/s\//.test(link.url));
  const releaseDateLabel = r => r.releaseDate ? Number(r.releaseDate.slice(5,7)) + '-' + Number(r.releaseDate.slice(8,10)) + '-' + r.releaseDate.slice(2,4) : '';
  // Shuffle the two archive sleeves behind the featured single.
  const headerAlbums = releases.filter(r => r.cover && r.kind !== 'Single');
  for (let i = headerAlbums.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [headerAlbums[i], headerAlbums[j]] = [headerAlbums[j], headerAlbums[i]];
  }
  document.querySelectorAll('.sleeves .sleeve-back, .sleeves .sleeve-mid').forEach((sleeve, i) => {
    const r = headerAlbums[i];
    if (!r) return;
    sleeve.href = `#release=${encodeURIComponent(r.id)}`;
    sleeve.setAttribute('aria-label', `Open ${r.title} by ${r.artist}`);
    const img = sleeve.querySelector('img');
    img.src = imagePath(r);
    img.alt = `${r.title} cover`;
    img.width = 600;
    img.height = 600;
    sleeve.querySelector('span').textContent = `${r.artist.toUpperCase()} / ${date(r)}`;
  });
  function renderCard(r) {
    const pending = isUpcoming(r);
    const shop = shopLink(r);
    const detail = `#release=${encodeURIComponent(r.id)}`;
    return `<article class="record ${pending ? 'record-upcoming' : ''}"><a class="record-main" href="${detail}" aria-label="Open ${escape(r.title)} by ${escape(r.artist)}"><div class="art ${r.cover ? '' : 'art-placeholder'}">${art(r,releases.indexOf(r))}${pending ? `<span class="release-overlay">COMING ${escape(releaseDateLabel(r))}</span>` : ''}<span class="open" aria-hidden="true">↗</span></div><div class="record-meta"><span>${date(r)}</span><span>${escape(r.kind.toUpperCase())}</span></div></a><div class="record-bottom"><a class="record-name" href="${detail}"><h3>${escape(r.title)}</h3><p class="record-artist">${escape(r.artist)}</p></a>${shop && !pending ? `<a class="record-buy" href="${escape(shop.url)}" target="_blank" rel="noopener noreferrer" aria-label="Buy ${escape(r.title)} on Ko-fi">BUY NOW ↗</a>` : ''}</div></article>`;
  }
  function render() {
    const query = search.value.trim().toLocaleLowerCase();
    const filtered = releases.filter(r => (artist === 'all' || r.artist === artist) && (releaseType === 'all' || (releaseType === 'singles' ? r.kind === 'Single' : r.kind !== 'Single')) && [r.title,r.artist,r.year,...r.tracks.map(t => t.title)].join(' ').toLocaleLowerCase().includes(query));
    filtered.sort((a,b) => sort.value === 'title' ? a.title.localeCompare(b.title) : a.year == null ? (b.year == null ? 0 : 1) : b.year == null ? -1 : (sort.value === 'new' ? b.year-a.year : a.year-b.year));
    const early = [];
    const later = [];
    for (const release of filtered) {
      (isEarlyRelease(release) ? early : later).push(release);
    }
    grid.innerHTML = later.map(renderCard).join('') + (early.length ? `
      <section class="early-records" aria-labelledby="early-records-title">
        <header class="early-records-heading">
          <h3 id="early-records-title">The Wrong Place to Start</h3>
          <p>Early recordings. We were still figuring out which noises were on purpose.</p>
        </header>
        <div class="records">${early.map(renderCard).join('')}</div>
      </section>` : '');
    document.querySelector('#record-count').textContent = `${String(filtered.length).padStart(2,'0')} RECORD${filtered.length === 1 ? '' : 'S'}`;
    document.querySelector('#empty').hidden = filtered.length !== 0;
  }
  document.querySelectorAll('[data-artist]').forEach(button => button.addEventListener('click', () => {
    artist = button.dataset.artist;
    document.querySelectorAll('[data-artist]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    render();
  }));
  document.querySelectorAll('[data-type]').forEach(button => button.addEventListener('click', () => {
    releaseType = button.dataset.type;
    document.querySelectorAll('[data-type]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    render();
  }));
  search.addEventListener('input',render); sort.addEventListener('change',render);
  function stopAudio() { if (audio) { audio.pause(); audio.removeAttribute('src'); audio.load(); audio = null; } playingIndex = -1; }
  function countPlay(player, release, track) {
    if (typeof window.umami?.track !== 'function') return false;
    // Played ranges exclude audio skipped by seeking.
    const ranges = player.played;
    let secondsPlayed = 0;
    for (let i = 0; i < ranges.length; i++) {
      secondsPlayed += ranges.end(i) - ranges.start(i);
    }
    if (secondsPlayed < 10) return false;
    window.umami.track('record_room_play', {
      recording: `${release.artist} / ${release.title} / ${track.title}`
    });
    return true;
  }

  function updateRadioControls(status) {
    radioStatus.textContent = status;
    radioToggle.textContent = radioRequested ? 'Ⅱ Pause' : radioSelection ? '▶ Resume' : '▶ Tune in';
    radioSkip.hidden = !radioSelection;
  }

  function pauseRadio() {
    if (!radioRequested) return;
    radioRequested = false;
    radioAudio.pause();
    updateRadioControls('Paused');
  }

  function playRadio() {
    const selection = radioSelection;
    radioRequested = true;
    audio?.pause();
    updateRadioControls('Tuning in…');
    radioAudio.play().catch(error => {
      if (!radioRequested || radioSelection !== selection || error.name === 'AbortError') return;
      if (error.name === 'NotSupportedError') {
        skipUnavailableRadioTrack();
        return;
      }
      radioRequested = false;
      updateRadioControls('Press Resume to listen.');
    });
  }

  function chooseRadioTrack() {
    const available = radioPool.filter(entry => !unavailableRadioTracks.has(entry));
    if (!available.length) return null;
    // Drop the oldest exclusions first when the pool is small.
    const recentAvailable = recentRadioTracks.filter(entry => !unavailableRadioTracks.has(entry));
    const excludeCount = Math.min(recentAvailable.length, available.length - 1);
    const excluded = excludeCount ? recentAvailable.slice(-excludeCount) : [];
    const candidates = available.filter(entry => !excluded.includes(entry));
    let draw = Math.random() * candidates.reduce((total, entry) => total + entry.weight, 0);
    return candidates.find(entry => (draw -= entry.weight) < 0);
  }

  function nextRadioTrack() {
    const entry = chooseRadioTrack();
    if (!entry) {
      pauseRadio();
      radioSelection = null;
      radioTrack.hidden = true;
      updateRadioControls('No recordings could load. Try tuning in again.');
      return;
    }

    recentRadioTracks.push(entry);
    if (recentRadioTracks.length > 5) recentRadioTracks.shift();
    radioSelection = { ...entry, counted: false };
    radioTrack.href = `#release=${encodeURIComponent(entry.release.id)}`;
    radioTrack.textContent = `${entry.track.title} · ${entry.release.artist}`;
    radioTrack.hidden = false;
    radioAudio.src = entry.track.audio;
    playRadio();
  }

  function skipUnavailableRadioTrack() {
    const failed = radioPool.find(entry => entry.track === radioSelection?.track);
    if (!radioRequested || !failed) return;
    unavailableRadioTracks.add(failed);
    nextRadioTrack();
  }

  function loadLyrics(path, panel, details) {
    let request = lyricRequests.get(path);
    if (!request) {
      request = fetch(path).then(response => {
        if (!response.ok) throw new Error('Lyrics could not load');
        return response.text();
      }).catch(error => {
        lyricRequests.delete(path);
        throw error;
      });
      lyricRequests.set(path, request);
    }
    panel.textContent = 'Loading lyrics…';
    request.then(text => {
      panel.textContent = text.trimEnd();
      details.dataset.loaded = 'true';
    }).catch(() => {
      panel.textContent = 'Lyrics couldn’t load. Close and reopen to try again.';
    });
  }

  function openRelease(id) {
    const r = releases.find(item => item.id === id);
    if (!r) return;
    if (id === currentId && dialog.open) return;
    if (!dialog.open) previousFocus = document.activeElement;
    stopAudio(); currentId = id;
    const playable = r.tracks.some(t => t.audio);
    content.innerHTML = `<div class="release-head">${r.cover ? `<div><img class="release-art" src="${escape(imagePath(r))}" alt="${escape(r.title)} cover">${r.artNote ? `<p class="art-credit">${escape(r.artNote)}</p>` : ''}</div>` : `<div class="art art-placeholder empty-art">${art(r,releases.indexOf(r))}</div>`}<div><p class="eyebrow">${escape(r.kind.toUpperCase())} / ${date(r)}</p><h2 id="release-title">${escape(r.title)}</h2><div class="release-byline">${escape(r.artist)}${r.tracks.length ? ` · ${r.tracks.length} tracks listed` : ''}</div><p class="release-summary">${escape(r.summary)}</p>${r.edition ? `<p class="track-note">${escape(r.edition)}</p>` : ''}${isUpcoming(r) ? `<p class="release-coming">Available ${escape(releaseDateLabel(r))}</p>` : ''}<div class="release-links">${r.links.filter(link => !(isUpcoming(r) && shopLink(r)?.url === link.url)).map((link,i) => `<a ${i===0?'class="primary"':''} href="${escape(link.url)}" ${link.url.startsWith('https:')?'target="_blank" rel="noopener"':''}>${escape(link.label)} ↗</a>`).join('')}</div></div></div>${r.id === "if" ? `<section class="album-spotify" aria-label="Listen to if… on Spotify"><h3>LISTEN TO IF…</h3><iframe title="if… by Aeris Mandrake on Spotify" src="https://open.spotify.com/embed/album/2C6z8lhzted3RomL6VgOjq?utm_source=generator&theme=0" width="100%" height="352" loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin"></iframe></section>` : ""}<div class="release-body"><div class="track-heading"><h3>${r.tracks.length ? 'TRACK LIST' : 'FROM THE ARCHIVE'}</h3>${playable ? '<button class="play-all" type="button">▶ Play album</button>' : ''}</div>${r.trackNote ? `<p class="track-note">${escape(r.trackNote)}</p>` : ''}${playable ? '<p class="now-playing" aria-live="polite">Choose a track to listen.</p><audio class="audio-player" controls controlsList="nodownload" preload="none"></audio>' : ''}${r.tracks.length ? `<ol class="track-list">${r.tracks.map((track,i) => `<li class="track" data-track="${i}"><span class="track-number">${String(i+1).padStart(2,'0')}</span><span class="track-title">${escape(track.title)}</span><div class="track-actions">${track.audio ? `<button type="button" class="track-play" data-play="${i}" aria-label="Play ${escape(track.title)}">▶</button>` : ''}</div>${track.lyrics ? `<details class="track-lyrics" data-lyrics="${escape(track.lyrics)}"><summary aria-label="Lyrics for ${escape(track.title)}">Lyrics</summary><div class="lyrics-text" aria-live="polite"></div></details>` : ''}</li>`).join('')}</ol>` : '<p class="not-yet">The sleeve is here. Track details and recordings will follow.</p>'}${!playable && !r.links.length ? '<p class="not-yet">Listening links will be added as the recordings are gathered.</p>' : ''}${r.related.length ? `<section class="related"><h3>FOLLOW THE THREAD</h3>${r.related.map(id => {const other=releases.find(x => x.id===id);return `<a href="#release=${other.id}">${escape(other.title)} <small>(${date(other)})</small> →</a>`;}).join('')}</section>` : ''}</div>`;
    if (playable) {
      audio = content.querySelector('audio');
      audio.addEventListener('timeupdate', event => {
        if (event.currentTarget !== audio || playingIndex < 0 || playCounted) return;
        playCounted = countPlay(audio, r, r.tracks[playingIndex]);
      });
      audio.addEventListener('ended', () => { const next = r.tracks.findIndex((t,i) => i > playingIndex && t.audio); if (next >= 0) playTrack(next); else updatePlaying(false); });
      audio.addEventListener('play', () => { pauseRadio(); updatePlaying(true); }); audio.addEventListener('pause', () => updatePlaying(false));
      audio.addEventListener('error', () => { content.querySelector('.now-playing').textContent='This recording couldn’t load. Please try again later.'; });
      content.querySelector('.play-all').addEventListener('click', () => playTrack(r.tracks.findIndex(t => t.audio)));
      content.querySelectorAll('[data-play]').forEach(b => b.addEventListener('click', () => {const i=Number(b.dataset.play);if(i === playingIndex && !audio.paused) audio.pause();else playTrack(i);}));
    }
    content.querySelectorAll('[data-lyrics]').forEach(details => {
      details.addEventListener('toggle', () => {
        if (details.open && !details.dataset.loaded) {
          loadLyrics(details.dataset.lyrics, details.querySelector('.lyrics-text'), details);
        }
      });
    });
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0; document.body.classList.add('modal-open');
  }
  function updatePlaying(playing) {content.querySelectorAll('[data-track]').forEach(row => {const active=Number(row.dataset.track)===playingIndex;row.classList.toggle('playing',active);const button=row.querySelector('[data-play]');if(button){button.textContent=active&&playing?'Ⅱ':'▶';button.setAttribute('aria-label',`${active&&playing?'Pause':'Play'} ${row.querySelector('.track-title').textContent}`);}});}
  function playTrack(index) {
    const r=releases.find(x => x.id===currentId), track=r.tracks[index];if(!track?.audio || !audio)return;
    pauseRadio();
    if (index !== playingIndex) {
      playCounted = false;
      audio.src = track.audio;
      playingIndex = index;
    }
    content.querySelector('.now-playing').textContent=`${String(index+1).padStart(2,'0')} / ${track.title}`;
    audio.play().catch(() => {content.querySelector('.now-playing').textContent='Press play in the audio controls to begin.';});
  }
  function syncHash() {const match=location.hash.match(/^#release=([a-z0-9-]+)$/);if(match)openRelease(match[1]);else if(dialog.open)dialog.close();}
  function closeRelease(){dialog.close();if(location.hash.startsWith('#release='))history.replaceState(null,'',location.pathname+location.search+'#catalog');}
  document.querySelector('.close').addEventListener('click',closeRelease);
  dialog.addEventListener('cancel',event => {event.preventDefault();closeRelease();});
  dialog.addEventListener('click',event => {if(event.target===dialog){const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)closeRelease();}});
  dialog.addEventListener('close',() => {stopAudio();currentId=null;document.body.classList.remove('modal-open');if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});});
  radioToggle.addEventListener('click', () => {
    if (radioRequested) pauseRadio();
    else if (radioSelection && !radioAudio.ended && !radioAudio.error) playRadio();
    else {
      unavailableRadioTracks.clear();
      nextRadioTrack();
    }
  });
  radioSkip.addEventListener('click', nextRadioTrack);
  radioAudio.addEventListener('playing', () => {
    if (radioRequested) updateRadioControls('Now playing');
  });
  radioAudio.addEventListener('ended', () => {
    if (radioRequested) nextRadioTrack();
  });
  radioAudio.addEventListener('error', () => {
    if (radioAudio.error) skipUnavailableRadioTrack();
  });
  radioAudio.addEventListener('timeupdate', () => {
    if (radioSelection && !radioSelection.counted) {
      const { release, track } = radioSelection;
      radioSelection.counted = countPlay(radioAudio, release, track);
    }
  });
  window.addEventListener('hashchange',syncHash);render();syncHash();
})();
