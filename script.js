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
const ghoulEye = document.getElementById('ghoul-eye');
const pupil = document.getElementById('eye-pupil');
const eyeLid = document.getElementById('eye-lid');

let isPlaying = false;

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

// Animate pupil according to reveal progress (0 to 1)
function updatePupilPosition(progress) {
  // Bound progress 0..1
  const clamped = Math.min(Math.max(progress, 0), 1);

  // Move pupil left/right within eye container
  // We'll map horizontal movement from 35% (left) to 65% (right)
  const leftMin = 35;
  const leftMax = 65;
  const posLeft = leftMin + (leftMax - leftMin) * clamped;

  // Keep vertical center at 50%
  pupil.style.left = `${posLeft}%`;
  pupil.style.top = `50%`;
}

// Animate lyrics with blood splatter reveal and pupil tracking progress left to right
function animateLyricsWithPupilTracking(text) {
  lyricDiv.innerHTML = text.split('').map(letter =>
    `<span class="letter">${letter === ' ' ? '&nbsp;' : letter}</span>`
  ).join('');

  const letters = lyricDiv.querySelectorAll('.letter');
  const totalLetters = letters.length;

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
        // Calculate how many letters are currently visible based on anim progress and delays
        // Approximate progress as a fraction of animation completion
        // anim.progress ranges from 0 to 100%
        const progress = anim.progress / 100;

        // Move pupil horizontally based on progress (left to right)
        // For smoothness, limit to total letter animation time fraction (if any)
        updatePupilPosition(progress);
      }
    });
}

// Update lyric depending on current audio time
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

// Ghoul Eye blink animation
function blink() {
  eyeLid.style.display = 'block';
  eyeLid.style.animation = 'blink 0.33s cubic-bezier(.71,1.55,.45,0.91)';
  setTimeout(() => {
    eyeLid.style.animation = '';
    eyeLid.style.display = 'none';
  }, 330);
}

// Auto blink every 5 seconds
setInterval(() => {
  blink();
}, 5000);

// Animate spider lilies on the ground (unchanged)
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

// Butterfly follow & landing feature (unchanged)
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
