(() => {
  const slides = Array.from(document.querySelectorAll(".background-photo"));
  const indicators = Array.from(document.querySelectorAll(".slide-indicator span"));
  let active = 0;

  const load = (image) => {
    if (image.dataset.src) {
      image.src = image.dataset.src;
      delete image.dataset.src;
    }
  };

  load(slides[1]);

  window.setInterval(() => {
    const next = (active + 1) % slides.length;
    load(slides[next]);
    load(slides[(next + 1) % slides.length]);
    slides[active].classList.remove("is-active");
    indicators[active].classList.remove("is-active");
    slides[next].classList.add("is-active");
    indicators[next].classList.add("is-active");
    active = next;
  }, 5000);
})();
