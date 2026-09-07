(() => {
  const searchEndpoint = 'https://archive.org/advancedsearch.php';
  const query = 'collection:vhsvault AND mediatype:movies';
  const params = new URLSearchParams(location.search);
  const requested = params.get('date');
  const today = new Date();
  const chicagoParts = Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(today).filter(part=>part.type!=='literal').map(part=>[part.type,part.value]));
  const todayKey = `${chicagoParts.year}-${chicagoParts.month}-${chicagoParts.day}`;
  let selectedDate = validDate(requested) ? parseDate(requested) : parseDate(todayKey);

  const notes = [
    'Tracking slips during the quiet parts. This may be intentional.',
    'Previous renter reports that the ending has been recorded over.',
    'Do not pause on the third recovered frame.',
    'Box was returned warm. Cassette was not.',
    'Audio continues for approximately four seconds after playback.',
    'Rewound by staff. Staff member not currently assigned to this location.',
    'If the title screen uses your name, eject immediately.',
    'Customer insisted this was not the tape they borrowed.'
  ];
  const conditions = ['PLAYABLE / COSMETIC WEAR','TRACKING DAMAGE','REWOUND / UNVERIFIED','LABEL MISSING','FAIR / AUDIO DRIFT','CASE DOES NOT MATCH TAPE'];
  const fees = ['$0.00','WAIVED','$2.50','ACCOUNT CLOSED','PENDING REVIEW','17 DAYS'];

  const el = id => document.getElementById(id);
  const clean = value => {
    if (Array.isArray(value)) value = value[0];
    const div = document.createElement('div');
    div.innerHTML = String(value || 'Not listed');
    return div.textContent.trim();
  };

  function isoDate(date){ return date.toISOString().slice(0,10); }
  function validDate(value){ return /^\d{4}-\d{2}-\d{2}$/.test(value || '') && !Number.isNaN(parseDate(value).valueOf()); }
  function parseDate(value){ return new Date(`${value}T12:00:00Z`); }
  function hash(value){ let h=2166136261; for(const c of value){h^=c.charCodeAt(0);h=Math.imul(h,16777619)} return h>>>0; }
  function seeded(list, seed, offset=0){ return list[(seed + offset) % list.length]; }
  function setDate(date){
    const key = isoDate(date);
    const url = new URL(location.href);
    if(key === todayKey) url.searchParams.delete('date'); else url.searchParams.set('date',key);
    history.pushState({},'',url);
    selectedDate = date;
    loadTape();
  }

  async function archiveJSON(url){
    const response = await fetch(url);
    if(!response.ok) throw new Error(`Archive response ${response.status}`);
    return response.json();
  }

  async function loadTape(){
    el('loading').hidden = false;
    el('record').hidden = true;
    el('screening').hidden = true;
    el('failure').hidden = true;
    el('display-date').textContent = selectedDate.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric',timeZone:'UTC'}).toUpperCase();
    el('display-date').dateTime = isoDate(selectedDate);
    el('next').disabled = isoDate(selectedDate) >= todayKey;

    try{
      const seed = hash(isoDate(selectedDate));
      const index = seed % 10000;
      const pageURL = `${searchEndpoint}?q=${encodeURIComponent(query)}&fl[]=identifier&rows=1&page=${index + 1}&sort[]=downloads+desc&output=json`;
      const result = await archiveJSON(pageURL);
      const identifier = result.response.docs[0]?.identifier;
      if(!identifier) throw new Error('Empty daily record');
      const data = await archiveJSON(`https://archive.org/metadata/${encodeURIComponent(identifier)}`);
      render(data, seed);
    }catch(error){
      console.error(error);
      el('loading').hidden = true;
      el('failure').hidden = false;
    }
  }

  function render(data, seed){
    const meta = data.metadata || {};
    const files = data.files || [];
    const identifier = meta.identifier;
    const images = files.filter(file => /\.(jpe?g|png|webp)$/i.test(file.name));
    const cover = images.find(file => /(front|cover|box|scan)/i.test(file.name) && !/(back|thumb|screenshot)/i.test(file.name))
      || images.find(file => /__ia_thumb\.jpg$/i.test(file.name))
      || images[0];
    const screenshots = images.filter(file => /\.thumbs\//i.test(file.name) && !/_000001\./i.test(file.name));
    const videos = files.filter(file => /\.(mp4|m4v|ogv)$/i.test(file.name) && !/(sample|thumb|preview)/i.test(file.name));
    const video = videos.sort((a,b) => (Number(b.size)||0) - (Number(a.size)||0))[0];
    const source = name => `https://archive.org/download/${encodeURIComponent(identifier)}/${name.split('/').map(encodeURIComponent).join('/')}`;

    el('box-art').src = cover ? source(cover.name) : `https://archive.org/services/img/${encodeURIComponent(identifier)}`;
    el('box-art').alt = `Archive artwork for ${clean(meta.title)}`;
    el('title').textContent = clean(meta.title);
    const year = clean(meta.year || meta.date).match(/\d{4}/)?.[0] || 'YEAR UNKNOWN';
    const subjects = Array.isArray(meta.subject) ? meta.subject.slice(0,3).join(' / ') : clean(meta.subject || 'VHS');
    el('facts').textContent = `${year} // ${subjects}`.toUpperCase();
    const description = clean(meta.description);
    el('description').innerHTML = `<p>${description.length > 700 ? `${description.slice(0,697)}…` : description}</p>`;
    el('creator').textContent = clean(meta.creator || meta.publisher);
    el('runtime').textContent = clean(meta.runtime || meta.duration || 'Not written on case');
    el('condition').textContent = seeded(conditions, seed);
    el('staff-note').textContent = seeded(notes, seed, 3);
    el('fees').textContent = seeded(fees, seed, 7);
    el('last-rented').textContent = new Date(selectedDate.valueOf() - ((seed % 340) + 31) * 86400000).toLocaleDateString('en-US',{month:'2-digit',day:'2-digit',year:'numeric',timeZone:'UTC'});
    el('inventory').textContent = `INVENTORY // ${identifier.toUpperCase()} // COPY ${(seed % 4) + 1}`;
    el('archive-link').href = `https://archive.org/details/${encodeURIComponent(identifier)}`;
    renderFrames(screenshots, video ? source(video.name) : null, source, seed);
    el('loading').hidden = true;
    el('record').hidden = false;
    el('screening').hidden = false;
  }

  function renderFrames(screenshots, videoURL, source, seed){
    const container = el('frames');
    container.replaceChildren();
    [0.18,0.47,0.76].forEach((position,index) => {
      const frame = document.createElement('div');
      frame.className = 'frame';
      const label = document.createElement('span');
      label.textContent = `FRAME ${String(index + 1).padStart(2,'0')} // ${String((seed + index * 17) % 60).padStart(2,'0')}:${String((seed + index * 29) % 60).padStart(2,'0')}`;
      if(screenshots.length){
        const image = document.createElement('img');
        const screenshotIndex = Math.min(screenshots.length - 1, Math.floor((screenshots.length - 1) * position));
        image.src = source(screenshots[screenshotIndex].name);
        image.alt = `Recovered frame ${index + 1} from the daily cassette`;
        image.loading = 'lazy';
        frame.append(image);
      }else if(videoURL){
        const video = document.createElement('video');
        video.src = videoURL;
        video.muted = true;
        video.playsInline = true;
        video.preload = 'metadata';
        video.crossOrigin = 'anonymous';
        video.addEventListener('loadedmetadata', () => {
          if(Number.isFinite(video.duration)) video.currentTime = Math.max(1,video.duration * position);
        },{once:true});
        frame.append(video);
      }else{
        frame.classList.add('frame--missing');
      }
      frame.append(label);
      container.append(frame);
    });
  }

  el('previous').addEventListener('click',()=>setDate(new Date(selectedDate.valueOf()-86400000)));
  el('next').addEventListener('click',()=>setDate(new Date(selectedDate.valueOf()+86400000)));
  el('today').addEventListener('click',()=>setDate(parseDate(todayKey)));
  el('retry').addEventListener('click',loadTape);
  addEventListener('popstate',()=>{const date=new URLSearchParams(location.search).get('date');selectedDate=validDate(date)?parseDate(date):parseDate(todayKey);loadTape()});
  loadTape();
})();
