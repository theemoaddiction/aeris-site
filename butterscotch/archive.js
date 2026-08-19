(() => {
  const root = document.querySelector('#tour');
  const status = document.querySelector('#archive-status');
  const soundButton = document.querySelector('#sound-toggle');

  const state = {
    returning: localStorage.getItem('butterscotch-complete') === 'true',
    annotations: new Set(),
    cabinet: null,
    path: [],
    sound: false
  };

  const pages = {
    welcome: {
      image: 'images/01-entry.webp', eyebrow: 'Official municipal record',
      title: () => state.returning ? 'Welcome Back' : 'The Butterscotch Municipal Archive',
      body: () => `${state.returning ? '<p class="stamp">1 returning visitor</p>' : ''}<p class="lede">Welcome to the official virtual tour of the Butterscotch Family Amusement Center.</p><p>For more than four decades, Butterscotch provided affordable recreation, supervised socialization, and weather-independent family entertainment to the residents of Bellwether Township.</p><p>The facility no longer accepts physical visitors.</p>`,
      caption: 'Archive last certified: October 14, 2003',
      choices: [{ label: state.returning ? 'Resume the approved tour' : 'Begin the approved tour', to: 'founding' }]
    },
    founding: {
      image: 'images/02-founding.webp', eyebrow: 'Exhibit 1 of 9', title: 'A Modern Kind of Play', progress: 11,
      body: '<p>Butterscotch opened to the public in the spring of 1963.</p><p>Designed as an alternative to unsupervised outdoor recreation, its original games emphasized coordination, patience, posture, and responsible use of electricity.</p><p>Admission was free. Visitors paid only for the time they remembered spending inside.</p>',
      caption: 'East Amusement Gallery, approximately 1963 · Photographer unknown · No visitors were present when this photograph was taken.',
      choices: [{ label: 'Continue to the expansion', to: 'equestrian' }]
    },
    equestrian: {
      image: 'images/03-equestrian.webp', eyebrow: 'Exhibit 2 of 9', title: 'The Equestrian Expansion', progress: 22,
      body: '<p>Public response was immediate.</p><p>In 1965, Butterscotch added twelve electrically assisted equestrian stations. The animals were designed to respond to a rider’s posture, pulse, and stated destination.</p><p>Municipal records indicate that all twelve units were removed in 1967.</p><div class="notice">Fourteen units are visible in this photograph, taken in 1971.<br><br>The discrepancy is believed to be photographic.</div>',
      choices: [{ label: 'Accept explanation and continue', to: 'midway' }]
    },
    midway: {
      image: 'images/04-midway.webp', eyebrow: 'Exhibit 3 of 9', title: 'Main Street, Indoors', progress: 33,
      body: '<p>The 1973 renovation introduced a complete indoor streetscape, allowing residents to experience nightlife without encountering weather, traffic, strangers, or night.</p><p>Shops remained open until 11:00 p.m. The overhead sky remained open until 9:30.</p><div class="caption">Promotional photograph, 1973 · The floor was not wet at the time of photography.</div><button class="inline-action" data-note="reflection">View maintenance note</button><div id="note"></div>',
      notes: { reflection: 'Persistent floor reflections were reported between 1973 and 1981. Custodial staff were instructed to mop the reflected surface rather than the tile beneath it.<br><br>This procedure was discontinued following the loss of a custodian.' },
      choices: [{ label: 'Visit the restaurant', to: 'restaurant' }, { label: 'Skip to the electronic galleries', to: 'modernization', secondary: true }]
    },
    restaurant: {
      image: 'images/05-restaurant.webp', eyebrow: 'Exhibit 4A · Licensed concession', title: 'A Familiar Meal', progress: 39,
      body: '<p>Butterscotch partnered with several national restaurant concepts during the late 1970s. Surviving contracts prohibit the archive from identifying this particular restaurant by name.</p><p>Younger visitors may remember the dining room’s celebrated tableless layout and unrestricted recreational sphere program.</p><div class="caption">Restaurant concourse after closing · Approximately 64,000 recreational spheres pictured · Municipal inventory: 312</div><div class="notice">Please do not attempt to count them. Previous totals remain active.</div>',
      choices: [{ label: 'Return to the approved route', to: 'modernization' }, { label: 'Follow the spheres', to: 'service', secondary: true }]
    },
    service: {
      image: 'images/06-service.webp', eyebrow: 'Unindexed service record', title: 'You Have Left the Public Tour', offRoute: true,
      body: '<p>This portion of the facility was not preserved.</p><p>Please select the doorway through which you entered.</p>',
      choices: [{ label: 'I do not see a door', action: 'correct' }]
    },
    serviceCorrect: {
      image: 'images/06-service.webp', eyebrow: 'Visitor response accepted', title: 'Correct.', offRoute: true,
      body: '<p>No corrective action is required.</p>',
      choices: [{ label: 'Return to the tour', to: 'modernization' }]
    },
    modernization: {
      image: 'images/07-modernization.webp', eyebrow: 'Exhibit 5 of 9', title: 'Entering the Electronic Age', progress: 55,
      body: '<p>Personal computing transformed the Butterscotch experience during the 1980s.</p><p>New cabinets offered responsive graphics, simulated companionship, and several approved forms of conflict. For the first time, visitors could enter their initials and receive evidence that they had been present.</p><p>Most entered the same three letters.</p><button class="inline-action" data-note="initials">View popular initials</button><div id="note"></div>',
      notes: { initials: 'YOU &nbsp;&nbsp; YOU &nbsp;&nbsp; YOU &nbsp;&nbsp; YOU &nbsp;&nbsp; YOU' },
      choices: [{ label: 'Proceed to the final renovation', to: 'competitive' }]
    },
    competitive: {
      image: 'images/08-competitive.webp', eyebrow: 'Exhibit 6 of 9', title: 'Games for Everyone', progress: 66,
      body: '<p>By 1994, Butterscotch housed more than 200 distinct amusement cabinets.</p><p>The Department recognizes that several cabinets pictured in this gallery do not correspond to commercially released games.</p><p>This does not mean they were invented here.</p><ul class="list"><li>CABINET 41 — Title unavailable</li><li>CABINET 42 — Manufacturer unavailable</li><li>CABINET 43 — Awaiting player</li></ul>',
      choices: [{ label: 'Inspect Cabinet 41', to: 'night' }, { label: 'Inspect Cabinet 42', to: 'spectator' }, { label: 'Continue without playing', to: 'child', secondary: true }]
    },
    night: {
      image: 'images/09-night-mode.webp', eyebrow: 'Cabinet 41', title: 'Night Mode', progress: 70,
      body: '<p>Records describe this as a competitive navigation game.</p><p>Players were instructed to locate the exit before the building completed its nightly rearrangement. No confirmed winning strategy survives.</p><div class="notice">Your current distance from the exit: <strong>0 rooms</strong></div>',
      choices: [{ label: 'Step away from the cabinet', action: 'leaveNight' }]
    },
    nightExit: {
      image: 'images/09-night-mode.webp', eyebrow: 'Cabinet 41', title: 'Night Mode', progress: 70,
      body: '<p>Thank you for observing the recommended distance.</p><div class="notice">Your current distance from the exit: <strong>1 room</strong></div>',
      choices: [{ label: 'Return to the gallery', to: 'competitiveReturn' }]
    },
    spectator: {
      image: 'images/10-spectator.webp', eyebrow: 'Cabinet 42', title: 'Spectator', progress: 70,
      body: '<p>Cabinet 42 did not include player controls.</p><p>Visitors watched footage of other visitors playing Cabinet 42. Municipal inspectors found the program relaxing and approved it for unattended operation.</p><div class="notice">Live occupancy: <strong>1</strong></div>',
      choices: [{ label: 'Stop watching', action: 'leaveSpectator' }]
    },
    spectatorExit: {
      image: 'images/10-spectator.webp', eyebrow: 'Cabinet 42', title: 'Spectator', progress: 70,
      body: '<p>Viewing session ended.</p><div class="notice">Live occupancy: <strong>1</strong></div>',
      choices: [{ label: 'Return to the gallery', to: 'competitiveReturn' }]
    },
    competitiveReturn: {
      image: 'images/08-competitive.webp', eyebrow: 'Exhibit 6 of 9', title: 'Games for Everyone', progress: 72,
      body: () => `<p>Your inspection of ${state.cabinet || 'the selected cabinet'} has been added to its operating record.</p><p>Cabinet 43 remains available.</p>`,
      choices: [{ label: 'Continue without playing', to: 'child' }]
    },
    child: {
      image: 'images/11-childrens-cabinet.webp', eyebrow: 'Exhibit not included in tour', title: 'Record Withheld', progress: 77,
      body: '<div class="notice">This exhibit is not included in the approved municipal tour.</div><p>The figure displayed on the screen has been variously identified as:</p><ul class="list"><li>A mascot</li><li>A player character</li><li>An employee</li><li>The last visitor</li><li>You, incorrectly</li></ul>',
      choices: [{ label: 'Do not interact', to: 'closure' }, { label: 'Ask who is playing', action: 'askPlayer', secondary: true }]
    },
    player: {
      image: 'images/11-childrens-cabinet.webp', eyebrow: 'Cabinet 43 · Active session', title: 'Player One Is Touring', progress: 77,
      body: '<div class="notice">Player Two is waiting.</div><p>Would you like the Department to notify Player Two?</p>',
      choices: [{ label: 'Notify', action: 'notify' }, { label: 'Return to tour', to: 'closure', secondary: true }]
    },
    notified: {
      image: 'images/11-childrens-cabinet.webp', eyebrow: 'Notification status', title: 'Player Two Has Already Been Notified', progress: 77,
      body: '<p>No further action is required from Player One.</p>',
      choices: [{ label: 'Continue to closure record', to: 'closure' }]
    },
    closure: {
      image: 'images/12-closure.webp', eyebrow: 'Exhibit 8 of 9', title: 'The End of Butterscotch', progress: 88,
      body: '<p>Butterscotch ceased public operations on October 14, 1987.</p><p>The closure followed changing consumer habits, increased home-console ownership, and the facility’s inability to remain in a single tax district.</p><p>All amusement cabinets were disconnected and removed.</p><div class="caption">Interior photograph taken October 15, 1987</div><button class="inline-action" data-note="error">Report an archival error</button><div id="note"></div>',
      notes: { error: 'Thank you. This discrepancy has been assigned to you.' },
      choices: [{ label: 'View the restored site', to: 'restoration' }]
    },
    restoration: {
      image: 'images/01-entry.webp', eyebrow: 'Exhibit 9 of 9', title: 'Preserved for the Future', progress: 100,
      body: '<p>In 2003, the municipality completed a full restoration of the original Butterscotch entrance gallery.</p><p>Because no reliable architectural plans survived, the room was reconstructed from visitor recollections.</p><p>The Department is grateful for the memory you provided during today’s tour.</p><div class="notice">Before leaving, please confirm which cabinet was present when you arrived.</div>',
      imageAction: 'cabinetImage',
      choices: [{ label: 'Left cabinet', action: 'chooseLeft' }, { label: 'Right cabinet', action: 'chooseRight' }]
    },
    removed: {
      image: 'images/01-entry.webp', eyebrow: 'Record amended', title: 'Thank You', progress: 100,
      body: () => `<p>You selected the ${state.cabinet} cabinet.</p><div class="notice">The other cabinet has been removed from the official record.</div>`,
      choices: [{ label: 'Complete tour', to: 'survey' }]
    },
    survey: {
      eyebrow: 'Visitor exit survey', title: 'Tour Complete', textOnly: true,
      body: '<p class="lede">Thank you for visiting the Butterscotch Municipal Archive.</p><p>Your responses will help us preserve the facility exactly as you remember it.</p><div class="notice">Have you visited Butterscotch before?</div>',
      choices: [{ label: 'Yes', action: 'answerYes' }, { label: 'No', action: 'answerNo' }, { label: 'I don’t remember', action: 'answerForget', secondary: true }]
    },
    ending: {
      eyebrow: 'Response certified', title: 'A Digital Location Has Been Established in Your Area', textOnly: true,
      body: () => `<p class="lede">${state.answer}</p><p>The facility no longer accepts physical visitors.</p><div class="notice">The tour may now be closed safely.</div>`,
      choices: [{ label: 'Exit to municipal website', action: 'restart' }]
    }
  };

  const actions = {
    correct: () => show('serviceCorrect'),
    leaveNight: () => { state.cabinet = 'Cabinet 41'; show('nightExit'); },
    leaveSpectator: () => { state.cabinet = 'Cabinet 42'; show('spectatorExit'); },
    askPlayer: () => show('player'),
    notify: () => show('notified'),
    chooseLeft: () => { state.cabinet = 'left'; show('removed'); },
    chooseRight: () => { state.cabinet = 'right'; show('removed'); },
    answerYes: () => finish('Welcome back. Your previous visit remains in progress.'),
    answerNo: () => finish('Our records disagree. No correction is necessary.'),
    answerForget: () => finish('This response will be treated as consent to restore from archive.'),
    restart: () => { localStorage.setItem('butterscotch-complete', 'true'); state.returning = true; state.path = []; show('welcome'); }
  };

  function finish(answer) {
    state.answer = answer;
    localStorage.setItem('butterscotch-complete', 'true');
    show('ending');
  }

  function pageValue(value) { return typeof value === 'function' ? value() : value; }

  function show(id) {
    const page = pages[id];
    if (!page) return;
    state.path.push(id);
    document.body.classList.toggle('off-route', Boolean(page.offRoute));
    status.textContent = page.offRoute ? 'PUBLIC ROUTE NOT AVAILABLE' : 'ARCHIVE CERTIFIED 10/14/2003';
    const image = page.image ? `<figure class="photo-wrap">${page.imageAction ? `<button class="image-button" data-action="${page.imageAction}" aria-label="Inspect the archival photograph">` : ''}<img class="photo" src="${page.image}" alt="Archival photograph for ${pageValue(page.title)}">${page.imageAction ? '</button>' : ''}</figure>` : '';
    const choices = (page.choices || []).map(c => `<button class="choice${c.secondary ? ' secondary' : ''}" ${c.to ? `data-to="${c.to}"` : `data-action="${c.action}"`}>${c.label}</button>`).join('');
    root.innerHTML = `<article class="record${page.textOnly ? ' text-only' : ''}">${image}<section class="copy">${page.progress ? `<div class="progress" aria-label="Tour progress"><span style="width:${page.progress}%"></span></div>` : ''}<p class="eyebrow">${page.eyebrow}</p><h${id === 'welcome' ? '1' : '2'}>${pageValue(page.title)}</h${id === 'welcome' ? '1' : '2'}><div class="body-copy">${pageValue(page.body)}</div>${page.caption ? `<div class="caption">${page.caption}</div>` : ''}<div class="choices">${choices}</div></section></article>`;
    root.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    bind(page);
    track(id);
  }

  function bind(page) {
    root.querySelectorAll('[data-to]').forEach(el => el.addEventListener('click', () => show(el.dataset.to)));
    root.querySelectorAll('[data-action]').forEach(el => el.addEventListener('click', () => {
      if (el.dataset.action === 'cabinetImage') return;
      actions[el.dataset.action]?.();
    }));
    root.querySelectorAll('[data-note]').forEach(el => el.addEventListener('click', () => {
      const note = root.querySelector('#note');
      note.className = 'annotation';
      note.innerHTML = page.notes[el.dataset.note];
      el.disabled = true;
      el.textContent = 'Record viewed';
    }));
  }

  function track(id) {
    if (window.umami) window.umami.track('butterscotch-tour', { page: id });
  }

  soundButton.addEventListener('click', () => {
    state.sound = !state.sound;
    soundButton.setAttribute('aria-pressed', String(state.sound));
    soundButton.textContent = `SOUND: ${state.sound ? 'AVAILABLE / SILENT' : 'OFF'}`;
  });

  show('welcome');
})();
