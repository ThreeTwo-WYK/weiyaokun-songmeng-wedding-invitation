(() => {
  const invitation = document.querySelector(".invitation");
  const slides = Array.from(document.querySelectorAll(".background-photo"));
  const indicators = Array.from(document.querySelectorAll(".slide-indicator span"));
  const music = document.querySelector("#background-music");
  const musicToggle = document.querySelector("#music-toggle");
  const musicLabel = musicToggle.querySelector(".music-label");
  const lyricText = document.querySelector("#lyric-text");
  const lyricUrl = "./music/hold-my-hand.lrc?v=20260820f";
  let active = 0;
  let timer;
  let pointerStart = null;
  let trackAvailable = true;
  let lyricLines = [
    { time: 0, text: "Hold My Hand" },
    { time: 8, text: "牵起你的手，走向我们的以后" },
    { time: 20, text: "从心动开始，到白首为期" },
    { time: 32, text: "良辰已定，佳期如约" },
    { time: 44, text: "山水一程，三生有幸" },
    { time: 56, text: "往后余生，与你共度" },
    { time: 68, text: "今日许诺，岁岁相守" },
    { time: 80, text: "一屋两人，三餐四季" },
    { time: 92, text: "与你并肩，看朝暮更迭" },
    { time: 104, text: "此生所愿，唯有你" },
    { time: 116, text: "爱有归期，幸福有声" },
    { time: 128, text: "执子之手，与子偕老" },
    { time: 140, text: "我们结婚啦" },
    { time: 152, text: "2026 · 10 · 03" },
    { time: 164, text: "诚邀您见证幸福时刻" },
    { time: 176, text: "卫垚坤 ＆ 宋萌" },
    { time: 188, text: "敬备喜宴 · 恭候光临" },
  ];
  let currentLyric = "Hold My Hand";
  let audioContext;
  let analyser;
  let mediaSource;
  let frequencyData;
  let visualFrame;

  const load = (image) => {
    if (image.dataset.src) {
      image.src = image.dataset.src;
      delete image.dataset.src;
    }
  };

  const show = (index) => {
    const next = (index + slides.length) % slides.length;
    if (next === active) return;

    load(slides[next]);
    load(slides[(next + 1) % slides.length]);
    slides[active].classList.remove("is-active");
    indicators[active].classList.remove("is-active");
    slides[next].classList.add("is-active");
    indicators[next].classList.add("is-active");
    active = next;
  };

  const restartTimer = () => {
    window.clearInterval(timer);
    timer = window.setInterval(() => show(active + 1), 5000);
  };

  const move = (offset) => {
    show(active + offset);
    restartTimer();
  };

  const finishPointer = (event) => {
    if (!pointerStart || pointerStart.id !== event.pointerId) return;

    const deltaX = event.clientX - pointerStart.x;
    const deltaY = event.clientY - pointerStart.y;
    pointerStart = null;
    invitation.classList.remove("is-dragging");

    if (Math.abs(deltaX) >= 42 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      move(deltaX < 0 ? 1 : -1);
    }
  };

  const parseLrc = (source) => source
    .split(/\r?\n/)
    .flatMap((line) => {
      const text = line.replace(/\[[0-9]{1,2}:[0-9]{2}(?:\.[0-9]{1,3})?\]/g, "").trim();
      if (!text) return [];
      return Array.from(line.matchAll(/\[([0-9]{1,2}):([0-9]{2})(?:\.([0-9]{1,3}))?\]/g), (match) => {
        const fraction = Number(`0.${match[3] || 0}`);
        return { time: Number(match[1]) * 60 + Number(match[2]) + fraction, text };
      });
    })
    .sort((a, b) => a.time - b.time);

  const setLyric = (text) => {
    if (!text || text === currentLyric) return;
    currentLyric = text;
    lyricText.textContent = text;
    lyricText.classList.remove("is-changing");
    void lyricText.offsetWidth;
    lyricText.classList.add("is-changing");
  };

  const syncLyric = () => {
    let line = lyricLines[0];
    for (const candidate of lyricLines) {
      if (candidate.time > music.currentTime) break;
      line = candidate;
    }
    setLyric(line?.text || "Hold My Hand");
  };

  const loadLyrics = async () => {
    try {
      const response = await fetch(lyricUrl, { cache: "no-store" });
      if (!response.ok) return;
      const parsed = parseLrc(await response.text());
      if (parsed.length) lyricLines = parsed;
    } catch {
      // The built-in wedding captions remain active when no LRC is supplied.
    }
  };

  const connectVisualizer = async () => {
    if (!window.AudioContext && !window.webkitAudioContext) return;
    if (!audioContext) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioContext = new AudioContextClass();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.76;
      mediaSource = audioContext.createMediaElementSource(music);
      mediaSource.connect(analyser);
      analyser.connect(audioContext.destination);
      frequencyData = new Uint8Array(analyser.frequencyBinCount);
    }
    if (audioContext.state === "suspended") await audioContext.resume();
  };

  const animateLyric = () => {
    if (music.paused) {
      lyricText.style.setProperty("--lyric-spacing", "0.08em");
      lyricText.style.setProperty("--lyric-opacity", "0.78");
      lyricText.style.setProperty("--lyric-scale", "1");
      lyricText.style.setProperty("--lyric-glow", "8px");
      visualFrame = null;
      return;
    }

    let energy = 0.24 + Math.sin(music.currentTime * 3.2) * 0.08;
    if (analyser && frequencyData) {
      analyser.getByteFrequencyData(frequencyData);
      const bass = frequencyData.slice(0, 14).reduce((sum, value) => sum + value, 0) / (14 * 255);
      energy = Math.min(1, bass * 1.65);
    }
    lyricText.style.setProperty("--lyric-spacing", `${(0.08 + energy * 0.04).toFixed(3)}em`);
    lyricText.style.setProperty("--lyric-opacity", (0.78 + energy * 0.22).toFixed(3));
    lyricText.style.setProperty("--lyric-scale", (1 + energy * 0.06).toFixed(3));
    lyricText.style.setProperty("--lyric-glow", `${(8 + energy * 14).toFixed(1)}px`);
    visualFrame = window.requestAnimationFrame(animateLyric);
  };

  const updateMusicState = (isPlaying) => {
    musicToggle.classList.toggle("is-playing", isPlaying);
    musicToggle.setAttribute("aria-label", isPlaying ? "暂停背景音乐" : "播放背景音乐");
    musicLabel.textContent = isPlaying ? "暂停" : "音乐";
    if (isPlaying && !visualFrame) visualFrame = window.requestAnimationFrame(animateLyric);
  };

  const playMusic = async (enableVisualizer = false) => {
    if (!trackAvailable) {
      musicToggle.classList.add("is-unavailable");
      musicToggle.title = "背景音乐暂不可用";
      return false;
    }
    try {
      await music.play();
      if (enableVisualizer) {
        try {
          await connectVisualizer();
        } catch {
          // Audio playback should continue even when Web Audio is restricted.
        }
      }
      return true;
    } catch {
      return false;
    }
  };

  const tryAutoplay = () => {
    if (music.paused) void playMusic();
  };

  const prepareMusic = () => {
    tryAutoplay();
    void loadLyrics();
  };

  slides.forEach((slide) => {
    slide.draggable = false;
  });

  load(slides[1]);
  restartTimer();

  invitation.addEventListener("pointerdown", (event) => {
    if (event.target.closest(".music-toggle")) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    pointerStart = { id: event.pointerId, x: event.clientX, y: event.clientY };
    invitation.classList.add("is-dragging");
    try {
      invitation.setPointerCapture(event.pointerId);
    } catch {
      // Some embedded browsers do not support pointer capture.
    }
  });

  invitation.addEventListener("pointerup", finishPointer);
  invitation.addEventListener("pointercancel", () => {
    pointerStart = null;
    invitation.classList.remove("is-dragging");
  });
  invitation.addEventListener("dragstart", (event) => event.preventDefault());
  invitation.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") move(-1);
    if (event.key === "ArrowRight") move(1);
  });

  musicToggle.addEventListener("click", async (event) => {
    event.stopPropagation();
    if (music.paused) await playMusic(true);
    else music.pause();
  });
  music.addEventListener("play", () => updateMusicState(true));
  music.addEventListener("pause", () => updateMusicState(false));
  music.addEventListener("timeupdate", syncLyric);
  music.addEventListener("error", () => {
    trackAvailable = false;
    musicToggle.classList.add("is-unavailable");
    musicToggle.title = "背景音乐暂不可用";
  });
  document.addEventListener("pointerdown", (event) => {
    if (!event.target.closest(".music-toggle")) playMusic(true);
  }, { once: true, capture: true });
  document.addEventListener("WeixinJSBridgeReady", tryAutoplay, { once: true });
  window.addEventListener("load", tryAutoplay, { once: true });
  window.addEventListener("pageshow", tryAutoplay);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) tryAutoplay();
  });

  [300, 1000, 2500].forEach((delay) => window.setTimeout(tryAutoplay, delay));

  if (window.WeixinJSBridge) tryAutoplay();

  prepareMusic();
})();
