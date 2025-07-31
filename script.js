// Load lyrics JSON
let lyrics = [];
fetch('public/lyrics.json')
  .then(response => response.json())
  .then(data => {
    lyrics = data;
  })
  .catch(err => {
    console.error('Failed to load lyrics:', err);
  });

const audio = document.getElementById('audio');
const video = document.getElementById('bg-video');
const lyricDiv = document.getElementById('current-lyric');
const seekBar = document.getElementById('seek-bar');
const volumeBar = document.getElementById('volume');
const playPauseBtn = document.getElementById('play-pause');
const skipBackBtn = document.getElementById('skip-back');
const skipForwardBtn = document.getElementById('skip-forward');

// Ghoul eye elements
const pupil = document.getElementById('eye-pupil');
const eyeLid = document.getElementById('eye-lid');

let isPlaying = false;

audio.onplay = () => {
  isPlaying = true;
  video.currentTime = audio.currentTime;
  video.play();
};

audio.onpause = () => {
  isPlaying = false;
  video.pause();
};

audio.ontimeupdate = () => {
  if (Math.abs(video.currentTime - audio.currentTime) > 0.2) {
    video.currentTime = audio.currentTime % video.duration;
  }
  updateLyric();

  seekBar.value = (audio.currentTime / audio.duration) * 100 || 0;
};

seekBar.addEventListener('input', () => {
  const pct = seekBar.value / 100;
  audio.currentTime = pct * audio.duration;
});

playPauseBtn.onclick = () => {
  if (audio.paused) {
    audio.play();
    playPauseBtn.textContent = '❚❚';
  } else {
    audio.pause();
    playPauseBtn.textContent = '►';
  }
};

skipBackBtn.onclick = () => {
  audio.currentTime = Math.max(0, audio.currentTime - 5);
};

skipForwardBtn.onclick = () => {
  audio.currentTime = Math.min(audio.duration, audio.currentTime + 5);
};

volumeBar.addEventListener('input', () => {
  audio.volume = volumeBar.value;
});

audio.onended = () => {
  audio.currentTime = 0;
  playPauseBtn.textContent = '►';
  video.pause();
};

let lastLyricIdx = -1;

function updatePupilPosition(progress) {
  const clamped = Math.min(Math.max(progress, 0), 1);
  const leftMin = 35;
  const leftMax = 65;
  const posLeft = leftMin + (leftMax - leftMin) * clamped;

  pupil.style.left = `${posLeft}%`;
  pupil.style.top = '50%';
}

function animateLyricsWithPupilTracking(text) {
  lyricDiv.innerHTML = text.split('').map(letter =>
    `<span class="letter">${letter === ' ' ? '&nbsp;' : letter}</span>`
  ).join('');

  const letters = lyricDiv.querySelectorAll('.letter');

  anime.timeline()
    .add({
      targets: letters,
      opacity: [0, 1],
      filter: [
        'drop-shadow(0 0 12px crimson) blur(4px)',
        'drop-shadow(0 0 0 crimson) blur(0)'
      ],
      translateY: [30, 0],
      easing: 'easeOutQuart',
      duration: 600,
      delay: anime.stagger(80),
      update: anim => {
        const progress = anim.progress / 100;
        updatePupilPosition(progress);
      }
    });
}

function updateLyric() {
  if (!lyrics.length) return;

  const t = audio.currentTime;
  let idx = lyrics.findIndex((l, i) =>
    i === lyrics.length - 1 || (t >= l.time && t < lyrics[i + 1].time)
  );

  if (idx !== lastLyricIdx) {
    lyricDiv.style.opacity = 0;

    setTimeout(() => {
      const text = (lyrics[idx] && lyrics[idx].text) || '';
      animateLyricsWithPupilTracking(text);
      lyricDiv.style.opacity = 1;
    }, 90);

    lastLyricIdx = idx;
  }
}

function blink() {
  eyeLid.style.display = 'block';
  eyeLid.style.animation = 'blink 0.33s cubic-bezier(.71,1.55,.45,0.91)';
  setTimeout(() => {
    eyeLid.style.animation = '';
    eyeLid.style.display = 'none';
  }, 330);
}

setInterval(() => {
  blink();
}, 5000);

const spiderlilyDiv = document.getElementById('spiderlilies');
if (spiderlilyDiv) {
  for (let i = 0; i < 13; i++) {
    const img = document.createElement('img');
    img.src = 'public/spiderlily.png';
    img.style.marginLeft = (Math.random() * 2.3 + 1.2) + "vw";
    img.style.filter += ` blur(${Math.random() * 0.7}px)`;
    img.style.opacity = (Math.random() * 0.3 + 0.7).toString();
    img.style.animationDuration = (1.3 + Math.random() * 0.9) + 's';
    spiderlilyDiv.appendChild(img);
  }
}

const butterfly = document.getElementById('butterfly');
const spiderlilyLarge = document.getElementById('spiderlily-large');

let landingDone = false;

window.addEventListener('mousemove', (e) => {
  if (landingDone) return;
  const offsetX = butterfly.offsetWidth / 2;
  const offsetY = butterfly.offsetHeight / 2;
  butterfly.style.left = (e.clientX - offsetX) + 'px';
  butterfly.style.top = (e.clientY - offsetY) + 'px';
});

audio.addEventListener('timeupdate', () => {
  if (
    !landingDone &&
    audio.duration &&
    audio.currentTime >= audio.duration / 2
  ) {
    landingDone = true;

    const lilyRect = spiderlilyLarge.getBoundingClientRect();
    const lilyX = lilyRect.left + lilyRect.width / 2;
    const lilyY = lilyRect.top + lilyRect.height * 0.23;

    const pageX = lilyX + window.scrollX;
    const pageY = lilyY + window.scrollY;

    const butterflyOffsetX = butterfly.offsetWidth / 2;
    const butterflyOffsetY = butterfly.offsetHeight / 2;

    butterfly.style.transition =
      'left 1s cubic-bezier(0.77,0,0.175,1), top 1s cubic-bezier(0.77,0,0.175,1)';
    butterfly.style.left = (pageX - butterflyOffsetX) + 'px';
    butterfly.style.top = (pageY - butterflyOffsetY) + 'px';

    setTimeout(() => {
      butterfly.classList.add('glow');
      spiderlilyLarge.classList.add('glow');
    }, 800);
  }
});

// --- BEGIN addition: glowing pulsing heart on mid-left ---

// Load the heart image
let heartImg = new Image();
heartImg.src = 'public/heart.png'; // make sure path is correct

// Heart animation state
let heartScale = 1.0;
const HEART_BASE_SIZE = 80;  // base size of heart in pixels
let HEART_X = 50;            // X position (left margin)
let HEART_Y = window.innerHeight / 2;             // Y position (vertically center)
let heartReady = false;

heartImg.onload = () => {
  heartReady = true;
};

// Web Audio API setup to analyze audio frequency data for pulse detection
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();
const source = audioCtx.createMediaElementSource(audio);
const analyser = audioCtx.createAnalyser();

source.connect(analyser);
analyser.connect(audioCtx.destination);

analyser.fftSize = 256;
const dataArray = new Uint8Array(analyser.frequencyBinCount);

// Resume AudioContext on user interaction (e.g. play button click)
function resumeAudioContext() {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

window.addEventListener('click', resumeAudioContext);
window.addEventListener('touchstart', resumeAudioContext);

// Setup overlay canvas for heart drawing
let heartCanvas = document.createElement('canvas');
heartCanvas.style.position = 'fixed';
heartCanvas.style.left = '0';
heartCanvas.style.top = '0';
heartCanvas.style.pointerEvents = 'none';
heartCanvas.style.zIndex = '1000'; // above all
heartCanvas.width = window.innerWidth;
heartCanvas.height = window.innerHeight;
document.body.appendChild(heartCanvas);

let heartCtx = heartCanvas.getContext('2d');

// Update canvas size on window resize
window.addEventListener('resize', () => {
  heartCanvas.width = window.innerWidth;
  heartCanvas.height = window.innerHeight;
  HEART_Y = window.innerHeight / 2;
});

// Update heart pulse scale based on bass average volume
function updateHeartPulse() {
  analyser.getByteFrequencyData(dataArray);

  // Average volume for bass frequencies (index 0 to 10)
  let bassSum = 0;
  for (let i = 0; i < 10; i++) {
    bassSum += dataArray[i];
  }
  const bassAvg = bassSum / 10;

  const threshold = 150; // tune threshold for sensitivity

  if (bassAvg > threshold) {
    heartScale = 1.3; // pulse up
  } else {
    heartScale = Math.max(1, heartScale - 0.05); // smooth pulse down
  }
}

// Draw glowing heart on overlay canvas
function drawGlowingHeart(x, y, size) {
  if (!heartReady) return;

  heartCtx.clearRect(0, 0, heartCanvas.width, heartCanvas.height);

  // Glow layers behind heart (semi-transparent multiples)
  for (let i = 6; i > 0; i--) {
    const glowSize = size * (1 + i * 0.1);
    heartCtx.globalAlpha = 0.08 / i;
    heartCtx.drawImage(heartImg, x - glowSize / 2, y - glowSize / 2, glowSize, glowSize);
  }

  // Draw main heart image solid on top
  heartCtx.globalAlpha = 1.0;
  heartCtx.drawImage(heartImg, x - size / 2, y - size / 2, size, size);
}

// Animation loop combining pulse update and draw
function animationLoop() {
  resumeAudioContext();
  updateHeartPulse();
  drawGlowingHeart(HEART_X, HEART_Y, HEART_BASE_SIZE * heartScale);
  requestAnimationFrame(animationLoop);
}

animationLoop();

// --- END addition ---
