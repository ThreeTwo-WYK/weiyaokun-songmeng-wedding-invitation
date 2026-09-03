(() => {
  const invitation = document.querySelector(".invitation");
  const slides = Array.from(document.querySelectorAll(".background-photo"));
  const indicators = Array.from(document.querySelectorAll(".slide-indicator span"));
  const music = document.querySelector("#background-music");
  const musicToggle = document.querySelector("#music-toggle");
  const musicLabel = musicToggle.querySelector(".music-label");
  const lyricText = document.querySelector("#lyric-text");
  const openingScreen = document.querySelector("#opening-screen");
  const openingButton = document.querySelector("#opening-button");
  const lyricUrl = "./music/hold-my-hand.lrc?v=20260821g";
  let active = 0;
  let timer;
  let pointerStart = null;
  let trackAvailable = true;
  let hasEntered = false;
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
  let visualFrame;
  let transitionRequest = 0;

  const load = (image) => new Promise((resolve) => {
    const source = image.dataset.source;
    if (!source) {
      resolve(false);
      return;
    }

    if (image.getAttribute("src") === source && image.complete && image.naturalWidth > 0) {
      if (typeof image.decode === "function") {
        image.decode().then(() => resolve(true), () => resolve(true));
      } else {
        resolve(true);
      }
      return;
    }

    let settled = false;
    const timeout = window.setTimeout(() => finish(false), 20000);

    const cleanup = () => {
      window.clearTimeout(timeout);
      image.removeEventListener("load", onLoad);
      image.removeEventListener("error", onError);
    };

    const finish = (loaded) => {
      if (settled) return;
      settled = true;
      cleanup();

      if (!loaded) {
        resolve(false);
        return;
      }

      if (typeof image.decode === "function") {
        image.decode().then(() => resolve(true), () => resolve(true));
      } else {
        resolve(true);
      }
    };

    const onLoad = () => finish(image.naturalWidth > 0);
    const onError = () => finish(false);
    image.addEventListener("load", onLoad);
    image.addEventListener("error", onError);

    if (image.getAttribute("src") !== source) image.src = source;
  });

  const releaseDistantSlides = () => {
    const keep = new Set([
      active,
      (active + 1) % slides.length,
      (active - 1 + slides.length) % slides.length,
    ]);

    slides.forEach((slide, index) => {
      if (!keep.has(index)) slide.removeAttribute("src");
    });
  };

  const show = async (index) => {
    const next = (index + slides.length) % slides.length;
    if (next === active) return true;

    const request = ++transitionRequest;
    const ready = await load(slides[next]);
    if (!ready || request !== transitionRequest) return false;

    slides[active].classList.remove("is-active");
    indicators[active].classList.remove("is-active");
    slides[next].classList.add("is-active");
    indicators[next].classList.add("is-active");
    active = next;

    void load(slides[(active + 1) % slides.length]);
    window.setTimeout(releaseDistantSlides, 2200);
    return true;
  };

  const restartTimer = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(async () => {
      await show(active + 1);
      restartTimer();
    }, 5000);
  };

  const move = (offset) => {
    window.clearTimeout(timer);
    void show(active + offset).finally(restartTimer);
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

  const animateLyric = () => {
    if (music.paused) {
      lyricText.style.setProperty("--lyric-spacing", "0.08em");
      lyricText.style.setProperty("--lyric-opacity", "0.78");
      lyricText.style.setProperty("--lyric-scale", "1");
      lyricText.style.setProperty("--lyric-glow", "8px");
      visualFrame = null;
      return;
    }

    const energy = 0.24 + Math.sin(music.currentTime * 3.2) * 0.08;
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

  const playMusic = async () => {
    if (!trackAvailable) {
      musicToggle.classList.add("is-unavailable");
      musicToggle.title = "背景音乐暂不可用";
      return false;
    }
    try {
      await music.play();
      return true;
    } catch {
      return false;
    }
  };

  const enterInvitation = () => {
    if (hasEntered) return;
    hasEntered = true;

    // Calling play synchronously inside this click is required by iOS and
    // first-time WeChat visitors. Waiting or retrying later loses the gesture.
    void playMusic();
    restartTimer();
    openingScreen.classList.add("is-leaving");
    openingScreen.setAttribute("aria-hidden", "true");
    openingButton.disabled = true;

    window.setTimeout(() => {
      openingScreen.hidden = true;
      invitation.focus({ preventScroll: true });
    }, 900);
  };

  slides.forEach((slide) => {
    slide.draggable = false;
    slide.decoding = "async";
    slide.dataset.source = slide.dataset.src || slide.getAttribute("src") || "";
  });

  void load(slides[1]);

  invitation.addEventListener("pointerdown", (event) => {
    if (event.target.closest(".opening-screen")) return;
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
    if (music.paused) await playMusic();
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
  openingButton.addEventListener("click", enterInvitation);

  void loadLyrics();
})();
