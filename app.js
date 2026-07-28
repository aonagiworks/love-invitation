// Pure helpers come from lib/utils.js (must be loaded before this file in index.html).
// Guard against missing window.LoveUtils to avoid a silent crash.
if (!window.LoveUtils) {
  throw new Error('[love-invitation] window.LoveUtils is not defined. Make sure lib/utils.js is loaded before app.js.');
}
const { escAttr, countdownFrom, formatClock } = window.LoveUtils;

const C = {
  name1: 'You',
  name2: 'Me',
  startDate: '2024-02-14',
  // Spotify track (primary UI). YouTube fallback for reliable autoplay:
  spotifyTrack: '37Esp6rBYhZa8pxJs5xzIV',
  ytId: 'dCfpg0_Hz-o', // YouTube audio (beats Spotify for autoplay reliability)
  useYoutubeAudio: true, // set false to rely on Spotify embed only
  secretMsg: [
    'Hey you,',
    'I made this little corner just so you could feel how much you mean to me — even on the quiet days.',
    'Thank you for every laugh, every late-night talk, and the way you turn ordinary moments into home.',
    "Whenever the world feels cold, come back here. I'll always leave a light on for you.",
    'I love you — softly, loudly, always.',
    '— Me',
  ],
  letter: [
    'My dearest,',
    "I don't always find the right words — so I built you a place instead. A place with our song, our story, and a quiet reminder that you're never alone.",
    'Thank you for being my safe place, my favorite person, and the reason ordinary days feel like home.',
    "Here's to us — to every moment we've shared, and every one still waiting.",
    'Forever yours,',
    '— Me',
  ],
};

const slides = [...document.querySelectorAll('.slide')];
let cur = 0;
let musicOn = false;
let started = false;

// dots
const dotsEl = document.getElementById('dots');
slides.forEach((_, i) => {
  const d = document.createElement('div');
  d.className = 'dot' + (i === 0 ? ' on' : '');
  d.onclick = () => go(i);
  dotsEl.appendChild(d);
});

function updateClock() {
  document.getElementById('clock').textContent = formatClock(new Date());
}
updateClock();
setInterval(updateClock, 30000);

// fill content with empty typewriter slots
const noteEl = document.getElementById('note');
noteEl.innerHTML = C.secretMsg
  .map((p) => `<span class="tw placeholder" data-text="${escAttr(p)}"></span>`)
  .join('');

const letterEl = document.getElementById('letter');
letterEl.innerHTML = C.letter
  .map((p, i, a) => {
    const cls = i === a.length - 3 ? 'tw placeholder script-style' : 'tw placeholder';
    return `<span class="${cls}" data-text="${escAttr(p)}"></span>`;
  })
  .join('');

// photo captions — hidden until tapped
document.querySelectorAll('.g-photo').forEach((el) => {
  const cap = el.querySelector('.cap');
  if (cap) cap.textContent = el.dataset.cap || '';
  el.addEventListener('click', () => el.classList.toggle('tapped'));
});

// typewriter engine
const typedOnce = { note: false, letter: false };
function typeInto(el, text, speed = 28) {
  return new Promise((resolve) => {
    el.classList.remove('placeholder');
    el.classList.add('typing');
    let i = 0;
    const tick = () => {
      if (i <= text.length) {
        el.textContent = text.slice(0, i);
        i++;
        setTimeout(tick, Math.max(12, speed + (Math.random() * 18 - 8)));
      } else {
        el.classList.remove('typing');
        el.classList.add('done');
        resolve();
      }
    };
    tick();
  });
}
async function runTypewriter(container, key) {
  if (key && typedOnce[key]) return;
  if (key) typedOnce[key] = true;
  const els = [...container.querySelectorAll('.tw')];
  els.forEach((el) => {
    el.textContent = '';
    el.classList.add('placeholder');
    el.classList.remove('done', 'typing');
  });
  for (const el of els) {
    await typeInto(el, el.dataset.text || '', 24);
    await new Promise((r) => setTimeout(r, 260));
  }
}

function go(i) {
  if (i < 0 || i >= slides.length) return;
  if (i > 0 && !started) return;
  slides[cur].classList.remove('active');
  slides[cur].classList.add('leave');
  setTimeout(() => slides[cur]?.classList.remove('leave'), 700);
  cur = i;
  slides[cur].classList.add('active');
  document.querySelectorAll('.dot').forEach((d, idx) => d.classList.toggle('on', idx === cur));
  document.getElementById('progress').style.width = (cur / (slides.length - 1)) * 100 + '%';
  document.getElementById('prev').disabled = cur <= 1;
  document.getElementById('next').disabled = cur >= slides.length - 1;
  // show chrome after leave cover
  if (cur > 0) {
    document.getElementById('nav').classList.add('show');
    document.getElementById('vinyl-dock').classList.add('show');
  } else {
    document.getElementById('nav').classList.remove('show');
    document.getElementById('vinyl-dock').classList.remove('show');
  }
  // typewriter when landing on letter slide
  if (cur === 7) {
    setTimeout(() => runTypewriter(document.getElementById('letter'), 'letter'), 400);
  }
}

function startJourney() {
  started = true;
  softConfetti();
  // try start music on user gesture
  playMusic(true);
  go(1);
}

function openGift() {
  const g = document.getElementById('gift');
  if (g.classList.contains('open')) return;
  g.classList.add('open');
  softConfetti();
  document.getElementById('gift-label').textContent = "it's you and me, always 💕";
  document.getElementById('gift-next').style.display = 'inline-block';
  setTimeout(() => softConfetti(), 250);
}

function revealNote() {
  document.getElementById('env').style.display = 'none';
  document.getElementById('note').style.display = 'block';
  softConfetti();
  // typewriter for the note — char by char
  runTypewriter(document.getElementById('note'), 'note');
}

function setVinylSpin(on) {
  document.getElementById('vinyl-mini').classList.toggle('spinning', on);
  document.getElementById('vinyl-hero').classList.toggle('spinning', on);
  document.getElementById('vinyl-stage').classList.toggle('playing', on);
  document.getElementById('vinyl-dock').classList.toggle('playing', on);
}

function playMusic(forceOn) {
  if (forceOn === true) musicOn = true;
  else if (forceOn === false) musicOn = false;
  else musicOn = !musicOn;

  const yt = document.getElementById('yt-audio');
  if (musicOn) {
    setVinylSpin(true);
    if (C.useYoutubeAudio && C.ytId) {
      // reliable autoplay after user gesture
      yt.src = `https://www.youtube.com/embed/${C.ytId}?autoplay=1&loop=1&playlist=${C.ytId}&controls=0`;
    }
  } else {
    setVinylSpin(false);
    yt.src = '';
  }
}
function toggleMusic() {
  playMusic();
}

// countdown
function tick() {
  const parts = countdownFrom(C.startDate);
  if (!parts) return;
  document.getElementById('cd-d').textContent = parts.days.toLocaleString();
  document.getElementById('cd-h').textContent = parts.hours;
  document.getElementById('cd-m').textContent = parts.minutes;
  document.getElementById('cd-s').textContent = parts.seconds;
}
setInterval(tick, 1000);
tick();

function softConfetti() {
  confetti({
    particleCount: 45,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#f8a5c2', '#c4898f', '#c9a06c', '#fff', '#f5e1e4'],
    gravity: 0.7,
    scalar: 0.85,
  });
}

// swipe
let sx = 0;
document.addEventListener(
  'touchstart',
  (e) => {
    sx = e.changedTouches[0].screenX;
  },
  { passive: true }
);
document.addEventListener(
  'touchend',
  (e) => {
    if (!started) return;
    const dx = e.changedTouches[0].screenX - sx;
    if (Math.abs(dx) < 50) return;
    if (dx < 0) go(cur + 1);
    else go(cur - 1);
  },
  { passive: true }
);

// keyboard
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === ' ') {
    e.preventDefault();
    if (!started) startJourney();
    else go(cur + 1);
  }
  if (e.key === 'ArrowLeft') go(cur - 1);
});

// Expose handlers used by inline onclick attributes in index.html
window.go = go;
window.startJourney = startJourney;
window.openGift = openGift;
window.revealNote = revealNote;
window.toggleMusic = toggleMusic;
