'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Companion3D from '../components/Companion3D';
import IntroDraw from '../components/IntroDraw';

function CornerMarks() {
  return (
    <>
      <span className="corner-mark tl" aria-hidden="true" />
      <span className="corner-mark tr" aria-hidden="true" />
      <span className="corner-mark bl" aria-hidden="true" />
      <span className="corner-mark br" aria-hidden="true" />
    </>
  );
}

function useRevealed(threshold = 0.18) {
  const ref = useRef(null);
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setRevealed(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setRevealed(true);
            obs.unobserve(el);
          }
        });
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, revealed];
}

function SocialBadgeImage({ src }) {
  const [errored, setErrored] = useState(false);
  if (!src || errored) {
    return (
      <span className="social-badge-placeholder" aria-hidden="true">
        +
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className="social-badge-img" onError={() => setErrored(true)} />
  );
}

function HeroTagline() {
  const [ref, revealed] = useRevealed(0.5);
  return (
    <p ref={ref} className={`hero-tagline ${revealed ? 'is-revealed' : ''}`}>
      your egd guide
    </p>
  );
}

function WeekCard({ week, side, forceRevealed }) {
  const [autoRef, autoRevealed] = useRevealed();
  const revealed = forceRevealed !== undefined ? forceRevealed : autoRevealed;
  const inactiveInDeck = forceRevealed === false;
  const disabled = !week.hasContent;

  const className = `week-card ${side} ${revealed ? 'is-revealed' : ''} ${disabled ? 'is-disabled' : ''}`;
  const indexLabel = String(week.id).padStart(2, '0');

  const inner = (
    <>
      <CornerMarks />
      <div className={`week-card-inner ${side === 'right' ? 'is-reverse' : ''}`}>
        <div className="week-media">
          {week.cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={week.cover} alt="" />
          ) : (
            <span className="week-index">
              <span className="index-label">WK</span>
              {indexLabel}
            </span>
          )}
        </div>
        <div className="week-copy">
          <h3 className="week-title">{disabled ? `Week ${indexLabel}` : week.title}</h3>
          <p className={`week-desc ${disabled ? 'is-muted' : ''}`}>{disabled ? 'Coming soon' : week.desc}</p>
        </div>
      </div>
    </>
  );

  if (disabled) {
    return (
      <div ref={autoRef} data-week-card tabIndex={-1} className={className} aria-label={`Week ${week.id} — coming soon`}>
        {inner}
      </div>
    );
  }

  return (
    <Link
      ref={autoRef}
      href={`/week/${week.id}`}
      data-week-card
      tabIndex={inactiveInDeck ? -1 : 0}
      className={className}
      aria-label={`Week ${week.id} — ${week.title}`}
    >
      {inner}
    </Link>
  );
}

function WeekScreen({ week, side, index }) {
  return (
    <div className="week-screen" data-week-index={index}>
      <div className="week-screen-band">
        <WeekCard week={week} side={side} />
      </div>
    </div>
  );
}

function WeekNav({ weeks, currentWeek, onJump }) {
  return (
    <nav className="week-nav" aria-label="Jump to week">
      {weeks.map((week, i) => (
        <button
          key={week.id}
          type="button"
          className={`week-nav-dot ${i === currentWeek ? 'is-active' : ''} ${!week.hasContent ? 'is-empty' : ''}`}
          onClick={() => onJump(i)}
          aria-current={i === currentWeek ? 'true' : undefined}
          aria-label={`Jump to Week ${week.id}${week.hasContent ? '' : ' — coming soon'}`}
        >
          {week.id}
        </button>
      ))}
    </nav>
  );
}

function WeekNavMobile({ weeks, currentWeek, onJump }) {
  return (
    <div className="week-nav-mobile">
      <select className="week-nav-select" value={currentWeek} onChange={(e) => onJump(Number(e.target.value))} aria-label="Jump to week">
        {weeks.map((week, i) => (
          <option key={week.id} value={i}>
            {`Week ${String(week.id).padStart(2, '0')} — ${week.hasContent ? week.title : 'coming soon'}`}
          </option>
        ))}
      </select>
    </div>
  );
}

function ClosingDrawer() {
  const [ref, revealed] = useRevealed(0.4);
  return (
    <section ref={ref} className={`closing-drawer ${revealed ? 'is-revealed' : ''}`}>
      <div className="closing-drawer-word">DRAWER</div>
      <p className="closing-note">Your Egd Guide is being made</p>
    </section>
  );
}

function SocialCard({ platform, label, imageSrc, href }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`social-card ${platform}`}
      aria-label={label}
    >
      <CornerMarks />

      <span className={`social-badge ${platform}`}>
        <SocialBadgeImage src={imageSrc} />
      </span>

      <span className="social-copy">
        <span className="social-label">{label.toUpperCase()}</span>
        <span className="social-handle">Creator - T</span>
      </span>
    </a>
  );
}

function ClosingSocial() {
  const [ref, revealed] = useRevealed(0.3);

  return (
    <section
      ref={ref}
      className={`closing-social ${revealed ? 'is-revealed' : ''}`}
    >
      <div className="social-stack">
        <SocialCard
          platform="instagram"
          label="Instagram"
          imageSrc="/images/instagram-logo.png"
          href="https://www.instagram.com/the__craftsman__/"
        />

        <SocialCard
          platform="linkedin"
          label="LinkedIn"
          imageSrc="/images/linkedin-logo.png"
          href="https://www.linkedin.com/in/tejas-v-09bb4a423/"
        />
      </div>
    </section>
  );
}

function renderSlideContent(slide, isActive) {
  if (slide.type === 'intro') {
    return (
      <div className="slide-inner">
        <p className="hero-tagline-static">your egd guide</p>
      </div>
    );
  }
  if (slide.type === 'week') {
    return (
      <div className="slide-inner">
        <WeekCard week={slide.week} side={slide.side} forceRevealed={isActive} />
      </div>
    );
  }
  if (slide.type === 'closing-drawer') {
    return (
      <div className="slide-inner closing-drawer-inner">
        <div className="closing-drawer-word">DRAWER</div>
        <p className="closing-note">add a closing note here</p>
      </div>
    );
  }
  if (slide.type === 'closing-social') {
    return (
      <div className="slide-inner">
        <div className="social-stack">
          <SocialCard platform="instagram" label="Instagram" imageSrc="/images/instagram-logo.png" />
          <SocialCard platform="linkedin" label="LinkedIn" imageSrc="/images/linkedin-logo.png" />
        </div>
      </div>
    );
  }
  return null;
}

export default function HomeClient({ weeks }) {
  const SLIDES = [
    { type: 'intro' },
    ...weeks.map((week, i) => ({ type: 'week', week, side: i % 2 === 0 ? 'left' : 'right' })),
    { type: 'closing-drawer' },
    { type: 'closing-social' },
  ];

  const wordmarkRef = useRef(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isDesktopWidth, setIsDesktopWidth] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [activeSlide, setActiveSlide] = useState(0);
  const activeSlideRef = useRef(0);
  const isTransitioningRef = useRef(false);

  useEffect(() => {
    const mqDesktop = window.matchMedia('(min-width: 901px)');
    const mqMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setIsDesktopWidth(mqDesktop.matches);
    update();
    setReducedMotion(mqMotion.matches);
    mqDesktop.addEventListener('change', update);
    const motionListener = () => setReducedMotion(mqMotion.matches);
    mqMotion.addEventListener('change', motionListener);
    return () => {
      mqDesktop.removeEventListener('change', update);
      mqMotion.removeEventListener('change', motionListener);
    };
  }, []);

  useEffect(() => {
    activeSlideRef.current = activeSlide;
  }, [activeSlide]);

  const goTo = (nextIndex) => {
    if (isTransitioningRef.current) return;
    const clamped = Math.max(0, Math.min(SLIDES.length - 1, nextIndex));
    if (clamped === activeSlideRef.current) return;
    isTransitioningRef.current = true;
    setActiveSlide(clamped);
    const lockMs = reducedMotion ? 50 : 750;
    window.setTimeout(() => {
      isTransitioningRef.current = false;
    }, lockMs);
  };

  useEffect(() => {
    if (!isDesktopWidth) return;
    const onWheel = (e) => {
      e.preventDefault();
      if (Math.abs(e.deltaY) < 6) return;
      goTo(activeSlideRef.current + (e.deltaY > 0 ? 1 : -1));
    };
    const onKeyDown = (e) => {
      const active = document.activeElement;
      const isButtonLike = active && (active.tagName === 'BUTTON' || active.tagName === 'A' || active.tagName === 'SELECT');
      if (e.key === ' ' && isButtonLike) return;
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        goTo(activeSlideRef.current + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        goTo(activeSlideRef.current - 1);
      }
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isDesktopWidth, reducedMotion]);

  useEffect(() => {
    if (isDesktopWidth) return;
    if (typeof IntersectionObserver === 'undefined') return;
    const sections = Array.from(document.querySelectorAll('[data-week-index]'));
    if (!sections.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setCurrentWeek(Number(entry.target.getAttribute('data-week-index')));
          }
        });
      },
      { threshold: 0.6 }
    );
    sections.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [isDesktopWidth]);

  const handleJumpMobile = (index) => {
    const target = document.querySelector(`[data-week-index="${index}"]`);
    if (!target) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
  };

  const desktopCurrentWeek = activeSlide >= 1 && activeSlide <= weeks.length ? activeSlide - 1 : -1;

  useEffect(() => {
    if (isDesktopWidth) {
      if (wordmarkRef.current) wordmarkRef.current.style.transform = '';
      return;
    }
    let raf = null;
    let current = reducedMotion ? 1 : 0;
    const step = () => {
      const holdDistance = window.innerHeight * 0.15;
      const transitionDistance = window.innerHeight * 0.55;
      const scrollY = window.scrollY;
      const target = scrollY <= holdDistance ? 0 : Math.min(1, (scrollY - holdDistance) / transitionDistance);
      current += (target - current) * (reducedMotion ? 1 : 0.15);
      if (wordmarkRef.current) {
        const maxScale = window.innerWidth < 480 ? 3.2 : 6;
        const maxLift = window.innerWidth < 480 ? 30 : 42;
        const lift = (1 - current) * maxLift;
        const scale = 1 + (1 - current) * (maxScale - 1);
        wordmarkRef.current.style.transform = `translate(-50%, ${lift}vh) scale(${scale})`;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => raf && cancelAnimationFrame(raf);
  }, [reducedMotion, isDesktopWidth]);

  return (
    <div className={reducedMotion ? 'reduced-motion' : ''}>
      <header className="site-header">
        <div ref={wordmarkRef} className={`wordmark ${isDesktopWidth && activeSlide > 0 ? 'is-small' : ''}`}>
          DRAWER
        </div>
      </header>

      <IntroDraw />
      <Companion3D activeSlideRef={activeSlideRef} totalSlides={SLIDES.length} reducedMotion={reducedMotion} />

      {isDesktopWidth ? (
        <>
          <WeekNav weeks={weeks} currentWeek={desktopCurrentWeek} onJump={(i) => goTo(i + 1)} />
          <div className="slide-deck">
            {SLIDES.map((slide, i) => (
              <div
                key={i}
                className={`slide ${i === activeSlide ? 'is-active' : i > activeSlide ? 'is-below' : 'is-above'} ${
                  slide.type === 'intro' ? 'intro-slide' : ''
                } ${slide.type === 'intro' || slide.type === 'closing-drawer' ? 'starfield-bg' : ''}`}
                aria-hidden={i !== activeSlide}
              >
                {renderSlideContent(slide, i === activeSlide)}
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <WeekNavMobile weeks={weeks} currentWeek={currentWeek} onJump={handleJumpMobile} />
          <main className="home-main">
            <div className="intro-spacer" aria-hidden="true" />
            <HeroTagline />
            {weeks.map((week, i) => (
              <WeekScreen key={week.id} week={week} side={i % 2 === 0 ? 'left' : 'right'} index={i} />
            ))}
            <ClosingDrawer />
            <ClosingSocial />
          </main>
        </>
      )}
    </div>
  );
}
