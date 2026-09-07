(() => {
  const key = 'aeris-office-east-refreshes-v1';
  const previous = Number.parseInt(localStorage.getItem(key) || '0', 10);
  const visits = Number.isFinite(previous) ? Math.min(previous + 1, 6) : 1;
  localStorage.setItem(key, String(visits));
  document.body.classList.add(`state-${visits}`);

  const clock = document.querySelector('time');
  const updateClock = () => {
    const now = new Date();
    clock.dateTime = now.toISOString();
    clock.textContent = now.toLocaleString('en-US', {
      month: '2-digit', day: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    }).replace(',', '');
  };
  updateClock();
  setInterval(updateClock, 1000);

  const message = document.querySelector('.feed__message');
  const delayed = [
    '',
    'MOTION EVENT DISMISSED',
    'AUTO-EXPOSURE CORRECTED',
    'LIGHTING ZONE 2 UNAVAILABLE',
    'OCCUPANCY: 0',
    'PLEASE LEAVE THE FEED OPEN'
  ];
  if (delayed[visits - 1]) {
    setTimeout(() => { message.textContent = delayed[visits - 1]; message.style.opacity = '1'; }, 5000);
    setTimeout(() => { message.style.opacity = '0'; }, 9000);
  }

  const button = document.querySelector('#audio-toggle');
  let context;
  let hum;
  button.addEventListener('click', () => {
    if (!context) {
      context = new (window.AudioContext || window.webkitAudioContext)();
      const master = context.createGain();
      master.gain.value = 0.018;
      master.connect(context.destination);
      [60, 120, 181].forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = index === 0 ? 'sine' : 'triangle';
        oscillator.frequency.value = frequency;
        gain.gain.value = index === 0 ? 1 : .2;
        oscillator.connect(gain).connect(master);
        oscillator.start();
      });
      hum = master;
    }
    const enabled = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed', String(enabled));
    button.textContent = enabled ? 'AUDIO: MONITORING' : 'AUDIO: MUTED';
    hum.gain.setTargetAtTime(enabled ? .018 : 0, context.currentTime, .08);
    if (enabled) context.resume();
  });
})();
