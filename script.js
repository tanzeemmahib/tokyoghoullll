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
const inkWash = document.getElementById('ink-wash'); // ink wash overlay element
const seekBar = document.getElementById('seek-bar');
const volumeBar = document.getElementById('volume');
const playPauseBtn = document.getElementById('play-pause');
const skipBackBtn = document.getElementById('skip-back');
const skipForwardBtn = document.getElementById('skip-forward');

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

function updateLyric() {
  if (!lyrics.length) return;

  const t = audio.currentTime;
  let idx = lyrics.findIndex((l, i) =>
    i === lyrics.length - 1 || (t >= l.time && t < lyrics[i + 1].time)
  );

  if (idx !== lastLyricIdx) {
    // Start ink wash animation sequence
    lyricDiv.style.opacity = 0;

    // Reset ink wash to starting state (scale 0, width 0, visible)
    inkWash.style.transition = 'none';
    inkWash.style.width = '0';
    inkWash.style.opacity = '0.8';
    inkWash.style.transform = 'translate(-50%, -50%) scale(0)';

    // Slight delay to ensure transition reset takes effect
    setTimeout(() => {
      // Animate ink wash scaling up and expanding width to cover lyric area
      inkWash.style.transition = 'transform 0.5s cubic-bezier(.5,1.6,.29,.94), width 0.5s cubic-bezier(.5,1.6,.29,.94), opacity 0.5s ease';
      inkWash.style.width = '400px';  // you may adjust width as needed
      inkWash.style.transform = 'translate(-50%, -50%) scale(1.1)';

      // After ink wash expands fully, reveal lyrics and run blood splatter animation
      setTimeout(() => {
        const text = (lyrics[idx] && lyrics[idx].text) || '';
        lyricDiv.innerHTML = text.split('').map(letter =>
          `<span class="letter">${letter === ' ' ? '&nbsp;' : letter}</span>`
        ).join('');
        lyricDiv.style.opacity = 1;

        // Blood splatter letter reveal using Anime.js
        anime.timeline()
          .add({
            targets: '.letter',
            opacity: [0, 1],
            filter: [
              'drop-shadow(0 0 12px crimson) blur(4px)',  // start blurry blood shadow
              'drop-shadow(0 0 0 crimson) blur(0)'         // clear to crisp red glow
            ],
            translateY: [30, 0],
            easing: 'easeOutQuart',
            duration: 600,
            delay: anime.stagger(80),
          });

        // Fade and scale down ink wash overlay after lyric reveal
        inkWash.style.transition = 'opacity 0.4s cubic-bezier(.5,1.6,.29,.94), transform 0.4s cubic-bezier(.8,-0.2,.29,.94), width 0.4s ease';
        inkWash.style.opacity = '0';
        inkWash.style.transform = 'translate(-50%, -50%) scale(0)';
        inkWash.style.width = '0';

      }, 520);  // This delay matches ink wash expansion duration + a bit for smoothness
    }, 40);

    lastLyricIdx = idx;
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
