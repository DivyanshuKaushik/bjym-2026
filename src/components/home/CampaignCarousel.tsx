"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

const SLIDES = [
  { src: "/slides/slide-1.jpg", alt: "श्री तेजस्वी सूर्या जी — भाजयुमो राष्ट्रीय अध्यक्ष" },
  { src: "/slides/slide-2.jpg", alt: "डॉ. श्यामा प्रसाद मुखर्जी जी" },
  { src: "/slides/slide-3.jpg", alt: "श्री नितिन नवीन जी" },
  { src: "/slides/slide-4.jpg", alt: "श्री अटल बिहारी वाजपेयी जी" },
  { src: "/slides/slide-5.jpg", alt: "श्री नरेंद्र मोदी जी" },
  { src: "/slides/slide-6.jpg", alt: "पंडित दीनदयाल उपाध्याय जी" },
];

const AUTOPLAY_MS = 2000;
const RESUME_AFTER_MS = 5000;

export function CampaignCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const next = useCallback(() => setIndex((i) => (i + 1) % SLIDES.length), []);
  const prev = useCallback(() => setIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length), []);
  const goTo = (i: number) => setIndex(i);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [paused, next]);

  const pauseThenResume = () => {
    setPaused(true);
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => setPaused(false), RESUME_AFTER_MS);
  };

  useEffect(() => () => { if (resumeTimer.current) clearTimeout(resumeTimer.current); }, []);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setPaused(true);
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta > 40) prev();
    else if (delta < -40) next();
    touchStartX.current = null;
    pauseThenResume();
  };

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl border border-border bg-white shadow-sm"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      role="region"
      aria-label="अभियान स्लाइड्स"
    >
      <div className="relative aspect-[21/9] w-full sm:aspect-[21/8]">
        <div
          className="flex h-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {SLIDES.map((s, i) => (
            <div key={s.src} className="relative h-full w-full shrink-0">
              <Image
                src={s.src}
                alt={s.alt}
                fill
                sizes="(max-width: 768px) 100vw, 1200px"
                className="object-cover"
                priority={i === 0}
                loading={i === 0 ? "eager" : "lazy"}
              />
            </div>
          ))}
        </div>

        {/* prev/next controls */}
        <button
          onClick={() => { prev(); pauseThenResume(); }}
          aria-label="पिछली स्लाइड"
          className="absolute left-2 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur transition hover:bg-black/55 sm:left-3"
        >
          ‹
        </button>
        <button
          onClick={() => { next(); pauseThenResume(); }}
          aria-label="अगली स्लाइड"
          className="absolute right-2 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur transition hover:bg-black/55 sm:right-3"
        >
          ›
        </button>

        {/* dots */}
        {/* <div className="absolute bottom-2.5 left-1/2 flex -translate-x-1/2 gap-1.5 sm:bottom-3.5">
          {SLIDES.map((s, i) => (
            <button
              key={s.src}
              onClick={() => { goTo(i); pauseThenResume(); }}
              aria-label={`स्लाइड ${i + 1}`}
              className="h-0.5 rounded-full transition-all"
              style={{ width: i === index ? 20 : 8, background: i === index ? "#fff" : "rgba(255,255,255,.55)" }}
            />
          ))}
        </div> */}
      </div>
    </div>
  );
}
