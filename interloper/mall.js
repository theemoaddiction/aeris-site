(() => {
  const playback = document.querySelector('#storefront-playback');
  const transcript = document.querySelector('#storefront-transcript');
  const rooms = new Map([
    ['#inherited-self', 'electronics storefront'],
    ['#the-machine', 'atrium'],
    ['#whats-left', 'service corridor']
  ]);
  const storageKey = 'interloper-mall-visit-v1';
  let stored = null;

  try {
    stored = JSON.parse(localStorage.getItem(storageKey));
  } catch {
    // Repeat passes still work during this visit.
  }

  const previousRoute = Array.isArray(stored?.route)
    ? stored.route.filter(room => rooms.has(room)).slice(-3)
    : [];
  const previousVisits = Number.isSafeInteger(stored?.visits) && stored.visits > 0
    ? Math.min(stored.visits, 2)
    : 0;
  const visits = previousVisits + 1;
  const route = [];
  const mapLinks = [...document.querySelectorAll('.map-room')];
  const mapPosition = document.querySelector('#map-position');
  const mapReturn = document.querySelector('#map-return');
  const hiddenRoom = document.querySelector('#behind-the-tvs');
  const misplacedMarker = new Map([
    ['#the-machine', '#whats-left'],
    ['#whats-left', '#inherited-self'],
    ['#inherited-self', '#the-machine']
  ]);
  const followedMarkers = new Set();
  let currentRoom = '#the-machine';
  let plottedRoom = null;
  let mapOpened = Boolean(stored?.mapOpened);
  let photosTaken = Boolean(stored?.photosTaken);
  let storefrontPasses = 0;

  function showPlayback(stops, diverged) {
    const description = stops.map(stop => rooms.get(stop)).join(' → ');
    transcript.textContent = description
      ? `The middle television plays back your route. ${description}.`
      : 'The middle television plays back the moment you arrived.';
    if (diverged) {
      transcript.textContent += ' In this copy, you stop and look into the store. You remember walking past.';
    }
    playback.hidden = false;
  }

  function rememberStop() {
    const stop = location.hash;
    if (!rooms.has(stop) || route.at(-1) === stop) return;
    if (stop === '#inherited-self') {
      storefrontPasses++;
      if (storefrontPasses > 1) {
        showPlayback(route.slice(-3), storefrontPasses > 2 || visits > 2);
      }
    }
    route.push(stop);
    if (route.length > 3) route.shift();
    saveVisit();
  }

  function saveVisit() {
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        visits,
        route: route.length ? route : previousRoute,
        mapOpened,
        photosTaken
      }));
    } catch {
      // The page can still show this visit’s route.
    }
  }

  if (previousVisits) showPlayback(previousRoute, visits > 2);
  rememberStop();
  saveVisit();
  function updateMap() {
    const stop = location.hash;
    if (rooms.has(stop)) {
      currentRoom = stop;
      if (stop === plottedRoom) followedMarkers.add(stop);
      plottedRoom = null;
      if (followedMarkers.size === rooms.size && !mapOpened) {
        mapOpened = true;
        saveVisit();
      }
    }

    const marker = mapOpened ? '#behind-the-tvs' : misplacedMarker.get(currentRoom);
    hiddenRoom.hidden = !mapOpened;
    for (const link of mapLinks) {
      const target = link.getAttribute('href');
      link.toggleAttribute('data-marker', target === marker);
      if (target === '#behind-the-tvs') link.hidden = !mapOpened;
    }

    if (stop === '#floor-plan') {
      plottedRoom = marker;
      mapReturn.href = currentRoom;
      mapReturn.textContent = `← ${rooms.get(currentRoom)}`;
      mapPosition.textContent = `You are here · ${rooms.get(marker) ?? 'behind the televisions'}`;
    }
  }

  const photoStrip = document.querySelector('#photo-strip');
  const shutter = document.querySelector('#take-photos');
  const boothStatus = document.querySelector('#booth-status');

  function showStrip() {
    photoStrip.hidden = false;
    shutter.hidden = true;
    boothStatus.textContent = 'The strip is in the slot. Your curtain is still closed.';
  }

  if (photosTaken) showStrip();
  shutter.addEventListener('click', () => {
    shutter.disabled = true;
    let exposure = 0;
    boothStatus.textContent = 'Keep still.';
    const cycle = window.setInterval(() => {
      exposure++;
      boothStatus.textContent = `Exposure ${exposure} of 4.`;
      if (exposure === 4) {
        window.clearInterval(cycle);
        photosTaken = true;
        saveVisit();
        showStrip();
      }
    }, 580);
  });

  const doorAudio = document.querySelector('#door-audio');
  const listen = document.querySelector('#listen');
  const leanIn = document.querySelector('#lean-in');
  const doorStatus = document.querySelector('#door-status');
  let audioContext;
  let doorFilter;
  let closeToDoor = false;

  async function playAtDoor() {
    try {
      if (!audioContext && window.AudioContext) {
        audioContext = new AudioContext();
        doorFilter = audioContext.createBiquadFilter();
        doorFilter.type = 'lowpass';
        doorFilter.Q.value = Math.SQRT1_2;
        audioContext.createMediaElementSource(doorAudio).connect(doorFilter);
        doorFilter.connect(audioContext.destination);
      }
      if (doorFilter) {
        doorFilter.frequency.setTargetAtTime(closeToDoor ? 19000 : 420, audioContext.currentTime, 0.035);
        if (audioContext.state === 'suspended') await audioContext.resume();
      }
      if (location.hash !== '#service-door') return;
      await doorAudio.play();
      doorStatus.textContent = doorFilter && !closeToDoor ? 'The sound is muffled by the wall.' : 'The recording is audible.';
    } catch {
      doorStatus.textContent = 'The recording could not start. Try again.';
    }
  }

  listen.addEventListener('click', () => {
    if (doorAudio.paused) playAtDoor();
    else doorAudio.pause();
  });
  leanIn.addEventListener('click', () => {
    closeToDoor = !closeToDoor;
    leanIn.setAttribute('aria-pressed', String(closeToDoor));
    playAtDoor();
  });
  doorAudio.addEventListener('playing', () => { listen.textContent = 'Pause recording'; });
  doorAudio.addEventListener('pause', () => { listen.textContent = 'Resume recording'; });
  doorAudio.addEventListener('ended', () => { listen.textContent = 'Listen again'; });
  doorAudio.addEventListener('error', () => { doorStatus.textContent = 'The recording could not load.'; });

  updateMap();
  window.addEventListener('hashchange', () => {
    rememberStop();
    updateMap();
    if (location.hash !== '#service-door' && !doorAudio.paused) doorAudio.pause();
  });
})();
