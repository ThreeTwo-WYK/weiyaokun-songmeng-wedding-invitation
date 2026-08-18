"use client";

import { useEffect, useState } from "react";

const slides = [
  { src: "/photos/slide-01.webp", position: "50% 45%" },
  { src: "/photos/slide-02.webp", position: "50% 43%" },
  { src: "/photos/slide-03.webp", position: "50% 38%" },
  { src: "/photos/slide-04.webp", position: "50% 45%" },
  { src: "/photos/slide-05.webp", position: "50% 42%" },
  { src: "/photos/slide-06.webp", position: "50% 38%" },
  { src: "/photos/slide-07.webp", position: "50% 45%" },
  { src: "/photos/slide-08.webp", position: "50% 43%" },
  { src: "/photos/slide-09.webp", position: "50% 43%" },
  { src: "/photos/slide-10.webp", position: "50% 42%" },
  { src: "/photos/slide-11.webp", position: "50% 45%" },
  { src: "/photos/slide-12.webp", position: "50% 40%" },
];

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <main className="wedding-page">
      <section className="invitation" aria-label="卫垚坤与宋萌的婚礼请柬">
        <div className="photo-stage" aria-hidden="true">
          {slides.map((slide, index) => (
            <img
              key={slide.src}
              className={`background-photo ${index === activeSlide ? "is-active" : ""}`}
              src={slide.src}
              alt=""
              style={{ objectPosition: slide.position }}
              loading={index < 2 ? "eager" : "lazy"}
            />
          ))}
          <div className="photo-veil" />
          <div className="paper-grain" />
        </div>

        <div className="ornamental-frame" aria-hidden="true">
          <span className="corner corner-tl" />
          <span className="corner corner-tr" />
          <span className="corner corner-bl" />
          <span className="corner corner-br" />
        </div>

        <div className="invitation-content">
          <header className="invitation-header">
            <p className="eyebrow">WEDDING INVITATION</p>
            <div className="seal" aria-hidden="true">囍</div>
            <p className="welcome">良辰已定 · 佳期如约</p>
          </header>

          <div className="couple-block">
            <h1>
              <span>卫垚坤</span>
              <b aria-label="与">＆</b>
              <span>宋萌</span>
            </h1>
            <p>谨以白首之约 · 书向鸿笺</p>
          </div>

          <div className="date-block" aria-label="婚礼日期 2026年10月3日 星期六">
            <span>2026</span>
            <strong>10 · 03</strong>
            <span>星期六</span>
          </div>

          <div className="divider" aria-hidden="true">
            <i />
            <span>喜</span>
            <i />
          </div>

          <div className="venue-block">
            <p className="invitation-copy">诚挚邀请您见证我们的幸福时刻</p>
            <p className="venue-label">婚礼地点</p>
            <address>
              山西省临汾市襄汾县<br />
              赵康镇绍平村
            </address>
          </div>

          <footer className="invitation-footer">
            <p>敬备喜宴 · 恭候光临</p>
            <div className="slide-indicator" aria-hidden="true">
              {slides.map((slide, index) => (
                <span key={slide.src} className={index === activeSlide ? "is-active" : ""} />
              ))}
            </div>
          </footer>
        </div>
      </section>
    </main>
  );
}
