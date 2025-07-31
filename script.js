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

let isPlaying = false;

// Ghoul eye elements
const ghoulEye = document.getElementById('ghoul-eye');
const pupil = document.getElementById('eye-pupil');
const eyeLid = document.getElementById('eye-lid');

// Sync video playback with audio
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
  // Sync video time with audio currentTime, adjust if out of sync by >0.2s
  if (Math.abs(video.currentTime - audio.currentTime) > 0.2) {
    video.currentTime = audio.currentTime % video.duration;
  }
  updateLyric();

  seekBar.value = (audio.currentTime / audio.duration) * 100 || 0;
};

// Seek bar input changes audio current time
seekBar.addEventListener('input', () => {
  const pct = seekBar.value / 100;
  audio.currentTime = pct * audio.duration;
});

// Play/pause toggle button
playPauseBtn.onclick = () => {
  if (audio.paused) {
    audio.play();
    playPauseBtn.textContent = '❚❚';
  } else {
    audio.pause();
    playPauseBtn.textContent = '►';
  }
};

// Skip backward 5 seconds
skipBackBtn.onclick = () => {
  audio.currentTime = Math.max(0, audio.currentTime - 5);
};

// Skip forward 5 seconds
skipForwardBtn.onclick = () => {
  audio.currentTime = Math.min(audio.duration, audio.currentTime + 5);
};

// Volume control
volumeBar.addEventListener('input', () => {
  audio.volume = volumeBar.value;
});

// When audio ends, reset UI and pause video
audio.onended = () => {
  audio.currentTime = 0;
  playPauseBtn.textContent = '►';
  video.pause();
};

// Lyric update helper variables
let lastLyricIdx = -1;

// --- Ghoul Eye Pupil Tracking Helper Functions ---

// Find the current red-highlighted lyric letter or word inside #current-lyric
function getActiveRedLyric() {
  return lyricDiv.querySelector('.red, .active');
}

function movePupilToTarget(targetEl) {
  if (!targetEl) {
    // Center pupil if no target
    pupil.style.left = '50%';
    pupil.style.top = '50%';
    return;
  }
  const eyeRect = ghoulEye.getBoundingClientRect();
  const pupilMaxX = (eyeRect.width / 2) - (pupil.offsetWidth / 2) - 5;
  const pupilMaxY = (eyeRect.height / 2) - (pupil.offsetHeight / 2) - 2;

  const targetRect = targetEl.getBoundingClientRect();
  const eyeCenterX = eyeRect.left + eyeRect.width / 2;
  const eyeCenterY = eyeRect.top + eyeRect.height / 2;
  const targetCenterX = targetRect.left + targetRect.width / 2;
  const targetCenterY = targetRect.top + targetRect.height / 2;

  let dx = targetCenterX - eyeCenterX;
  let dy = targetCenterY - eyeCenterY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  if (distance > 0) {
    dx = (dx / distance) * pupilMaxX;
    dy = (dy / distance) * pupilMaxY;
  }

  const newLeft = 50 + (dx / (eyeRect.width / 2)) * 50;
  const newTop = 50 + (dy / (eyeRect.height / 2)) * 50;

  pupil.style.left = `${newLeft}%`;
  pupil.style.top = `${newTop}%`;
}

function updateGhoulEye() {
  const target = getActiveRedLyric();
  movePupilToTarget(target);
}

// --- Ghoul Eye Blinking ---

function blink() {
  eyeLid.style.display = 'block';
  eyeLid.style.animation = 'blink 0.33s cubic-bezier(.71,1.55,.45,0.91)';
  setTimeout(() => {
    eyeLid.style.animation = '';
    eyeLid.style.display = 'none';
  }, 330);
}

// --- Original updateLyric ---

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
      // Wrap each letter in a span with class 'letter'
      lyricDiv.innerHTML = text.split('').map(letter =>
        `<span class="letter">${letter === ' ' ? '&nbsp;' : letter}</span>`
      ).join('');
      lyricDiv.style.opacity = 1;

      // Animate letters with blood splatter reveal using anime.js
      anime.timeline()
        .add({
          targets: '.letter',
          opacity: [0, 1],
          filter: [
            'drop-shadow(0 0 12px crimson) blur(4px)', // start blurry blood shadow
            'drop-shadow(0 0 0 crimson) blur(0)' // clear to crisp but red glow
          ],
          translateY: [30, 0], // fall upward effect
          easing: 'easeOutQuart',
          duration: 600,
          delay: anime.stagger(80),
        });

      // After animation starts, add the .red class to the currently "red" letters
      // This depends on your animation logic, but here's a sample to mark the first letter as red for demo:
      // (Modify this part according to your actual blood splatter timing)

      // Simple example: mark first letter red
      const letters = lyricDiv.querySelectorAll('.letter');
      letters.forEach(l => l.classList.remove('red'));
      if (letters.length > 0) {
        // For demo, mark first letter red, can be dynamic
        letters[0].classList.add('red');
      }

      // Update pupil after DOM changes
      setTimeout(updateGhoulEye, 80);
    }, 90);
    lastLyricIdx = idx;
  } else {
    // Update pupil periodically even if lyric not changed (in case .red changes dynamically)
    updateGhoulEye();
  }
}

// Animate spider lilies on the ground
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

// --- BUTTERFLY FOLLOW & LANDING FEATURE ---

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

// At halfway point, butterfly lands & both glow
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

    butterfly.style.transition = 'left 1s cubic-bezier(0.77,0,0.175,1), top 1s cubic-bezier(0.77,0,0.175,1)';
    butterfly.style.left = (pageX - butterflyOffsetX) + 'px';
    butterfly.style.top = (pageY - butterflyOffsetY) + 'px';

    // Add glowing classes after landing animation
    setTimeout(() => {
      butterfly.classList.add('glow');
      spiderlilyLarge.classList.add('glow');
    }, 800);
  }
});

// --- Ghoul Eye Auto Blink every 5 seconds ---
setInterval(() => {
  blink();
}, 5000);
