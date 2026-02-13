const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const buttons = document.getElementById('buttons');
const result = document.getElementById('result');
const flowers = document.getElementById('flowers');
const confettiCanvas = document.getElementById('confetti');

const noPhrases = [
  "No",
  "Are you sure?",
  "Really sure?",
  "Don't do this 😭",
  "I'll cry",
  "Ok last chance",
  "Please?",
  "No (but why)",
];

let noCount = 0;
let yesScale = 1;
let confettiRunning = false;

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function makeFlowers(count = 80) {
  const { innerWidth: w, innerHeight: h } = window;
  flowers.innerHTML = "";

  const flowerSvgs = [
    'url("assets/flowers/daisy.svg")',
    'url("assets/flowers/sakura.svg")',
    'url("assets/flowers/tulip.svg")',
  ];

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'flower';

    const size = rand(34, 92);
    const x = rand(0, w);
    const y = rand(0, h);
    const rot = `${Math.floor(rand(0, 360))}deg`;

    const img = flowerSvgs[Math.floor(rand(0, flowerSvgs.length))];
    const hueRot = `${Math.floor(rand(-25, 35))}deg`;
    const opacity = rand(0.55, 0.92).toFixed(2);

    el.style.setProperty('--size', String(size));
    el.style.setProperty('--rot', rot);
    el.style.setProperty('--img', img);
    el.style.setProperty('--huerot', hueRot);
    el.style.setProperty('--opacity', opacity);
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;

    // allow hover even though the parent is aria-hidden
    el.setAttribute('role', 'presentation');

    flowers.appendChild(el);
  }
}

function layoutNoButtonAwayFromPointer(clientX, clientY) {
  const containerRect = buttons.getBoundingClientRect();
  const noRect = noBtn.getBoundingClientRect();

  // Current position relative to container
  const currentLeft = noRect.left - containerRect.left;
  const currentTop = noRect.top - containerRect.top;

  const targetDx = clientX < noRect.left + noRect.width / 2 ? 1 : -1;
  const targetDy = clientY < noRect.top + noRect.height / 2 ? 1 : -1;

  const moveX = targetDx * rand(60, 140);
  const moveY = targetDy * rand(40, 110);

  const maxLeft = containerRect.width - noRect.width;
  const maxTop = containerRect.height - noRect.height;

  const nextLeft = clamp(currentLeft + moveX, 0, maxLeft);
  const nextTop = clamp(currentTop + moveY, 0, maxTop);

  // Switch to absolute positioning once we start moving it.
  noBtn.style.position = 'absolute';
  noBtn.style.left = `${nextLeft}px`;
  noBtn.style.top = `${nextTop}px`;
}

function tickNoPhrase() {
  noCount += 1;
  noBtn.textContent = noPhrases[Math.min(noCount, noPhrases.length - 1)];

  // Make "Yes" noticeably larger with every "No" attempt.
  yesScale = clamp(yesScale + 0.22, 1, 3.2);
  yesBtn.style.transform = `scale(${yesScale})`;
  yesBtn.style.letterSpacing = `${clamp((yesScale - 1) * 0.4, 0, 0.6)}px`;
}

function shakeNo() {
  noBtn.classList.remove('isShaking');
  // restart animation
  // eslint-disable-next-line no-unused-expressions
  noBtn.offsetWidth;
  noBtn.classList.add('isShaking');
}

function showYesResult() {
  // Hide the whole button area and the buttons themselves.
  buttons.hidden = true;
  yesBtn.hidden = true;
  noBtn.hidden = true;
  yesBtn.disabled = true;
  noBtn.disabled = true;
  result.hidden = false;
  startConfetti();
}

// --- Confetti (small canvas particle burst) ---

function fitCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const rect = confettiCanvas.getBoundingClientRect();
  confettiCanvas.width = Math.floor(rect.width * dpr);
  confettiCanvas.height = Math.floor(rect.height * dpr);
  const ctx = confettiCanvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

function startConfetti() {
  if (confettiRunning) return;
  confettiRunning = true;

  const ctx = fitCanvas();
  const particles = [];
  const colors = [
    '#ff4793',
    '#ff7ab7',
    '#ffd24d',
    '#7de2d1',
    '#8ecae6',
    '#ffafcc',
  ];

  const W = confettiCanvas.getBoundingClientRect().width;
  const H = confettiCanvas.getBoundingClientRect().height;

  for (let i = 0; i < 160; i++) {
    particles.push({
      x: W / 2 + rand(-30, 30),
      y: H / 2 + rand(-20, 10),
      vx: rand(-5.5, 5.5),
      vy: rand(-9.5, -2.8),
      g: rand(0.12, 0.18),
      r: rand(3, 6.5),
      rot: rand(0, Math.PI),
      vr: rand(-0.2, 0.2),
      color: colors[Math.floor(rand(0, colors.length))],
      life: rand(70, 120),
    });
  }

  let frame = 0;
  function draw() {
    frame += 1;
    ctx.clearRect(0, 0, W, H);

    for (const p of particles) {
      p.life -= 1;
      p.vy += p.g;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.r, -p.r * 0.6, p.r * 2, p.r * 1.2);
      ctx.restore();
    }

    // keep only living particles
    for (let i = particles.length - 1; i >= 0; i--) {
      if (particles[i].life <= 0 || particles[i].y > H + 60) {
        particles.splice(i, 1);
      }
    }

    if (particles.length > 0 && frame < 260) {
      requestAnimationFrame(draw);
      return;
    }

    confettiRunning = false;
    ctx.clearRect(0, 0, W, H);
  }

  requestAnimationFrame(draw);
}

// --- Events ---

yesBtn.addEventListener('click', () => {
  showYesResult();
});

// Make "No" hard to click: reacts only to click/tap attempts (not hover).
// Use pointerdown so the button can dodge before the click is completed.
noBtn.addEventListener('pointerdown', (e) => {
  e.preventDefault();

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    layoutNoButtonAwayFromPointer(e.clientX, e.clientY);
  }

  shakeNo();
  tickNoPhrase();
});

// Also support keyboard activation (Enter/Space).
noBtn.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  e.preventDefault();
  shakeNo();
  tickNoPhrase();
});

// Prevent any accidental navigation/submit behavior if a click happens anyway.
noBtn.addEventListener('click', (e) => {
  e.preventDefault();
});

window.addEventListener('resize', () => {
  makeFlowers();
  if (confettiRunning) fitCanvas();
});

// init
makeFlowers();
