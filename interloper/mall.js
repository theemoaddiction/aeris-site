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
        route: route.length ? route : previousRoute
      }));
    } catch {
      // The page can still show this visit’s route.
    }
  }

  if (previousVisits) showPlayback(previousRoute, visits > 2);
  rememberStop();
  saveVisit();
  window.addEventListener('hashchange', rememberStop);
})();
