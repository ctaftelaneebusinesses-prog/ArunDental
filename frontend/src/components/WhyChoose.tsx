import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Reveal } from "./Reveal";
import { clinicInfo } from "../config/clinicInfo";
import {
  ArrowRightIcon,
  ChatHeartIcon,
  ComfortIcon,
  ExperienceIcon,
  ShieldCheckIcon,
  StarIcon,
  ToothIcon,
} from "./icons/DentalIcons";
import styles from "./WhyChoose.module.css";

const REASONS = [
  { key: "experience", icon: ExperienceIcon, image: "/assets/photos/doctor-suit.webp", focus: "50% 25%" },
  { key: "patient", icon: ChatHeartIcon, image: "/assets/clinic/doctor-treating-patient.webp", focus: "50% 35%" },
  { key: "modern", icon: ShieldCheckIcon, image: "/assets/clinic/treatment-room-wide.webp", focus: "50% 50%" },
  { key: "comfort", icon: ComfortIcon, image: "/assets/clinic/waiting-area-2.webp", focus: "50% 55%" },
] as const;

const AUTOPLAY_MS = 6500;

let audioCtx: AudioContext | null = null;

/** Soft two-note chime synthesised in the browser — no audio files to ship. */
function playChime() {
  try {
    const Ctor =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    audioCtx ??= new Ctor();
    const ctx = audioCtx;
    if (ctx.state === "suspended") void ctx.resume();
    const now = ctx.currentTime;
    [
      { freq: 659.25, offset: 0 },
      { freq: 987.77, offset: 0.11 },
    ].forEach(({ freq, offset }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.07, now + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.7);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.75);
    });
  } catch {
    // Sound is a nicety; never let it break the page.
  }
}

function SoundIcon({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4Z" />
      {on ? <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" /> : <path d="m16 9.5 4 5m0-5-4 5" />}
    </svg>
  );
}

export function WhyChoose() {
  const { t } = useTranslation();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.35 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const select = useCallback(
    (index: number, focus = false) => {
      if (index === active) return;
      setActive(index);
      if (soundOn) playChime();
      if (focus) tabRefs.current[index]?.focus();
    },
    [active, soundOn]
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    const last = REASONS.length - 1;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      select(active === last ? 0 : active + 1, true);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      select(active === 0 ? last : active - 1, true);
    }
  };

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    if (next) playChime();
  };

  const running = !reducedMotion && inView && !paused;

  return (
    <section ref={sectionRef} className={`${styles.section} ${running ? "" : styles.paused}`} aria-labelledby="why-heading">
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.dots} aria-hidden="true" />

      <div className={`container ${styles.grid}`}>
        <Reveal className={styles.header}>
          <span className={`eyebrow ${styles.eyebrow}`}>{t("home.why.eyebrow")}</span>
          <h2 id="why-heading" className={styles.title}>
            {t("home.why.title")}
          </h2>
          <p className={styles.subtitle}>{t("home.why.subtitle")}</p>
        </Reveal>

        <Reveal className={styles.visualWrap} delay={120}>
          <div className={styles.visual}>
            <div className={styles.archOutline} aria-hidden="true" />
            <div className={`${styles.archOutline} ${styles.archOutlineOuter}`} aria-hidden="true" />
            <div className={styles.arch}>
              {REASONS.map((reason, index) => (
                <img
                  key={reason.key}
                  className={`${styles.photo} ${index === active ? styles.photoActive : ""}`}
                  src={reason.image}
                  alt=""
                  style={{ objectPosition: reason.focus }}
                  loading={index === 0 ? "eager" : "lazy"}
                  draggable={false}
                />
              ))}
              <div className={styles.shade} aria-hidden="true" />
              <div key={active} className={styles.caption} aria-hidden="true">
                <span className={styles.captionIcon}>
                  {(() => {
                    const Icon = REASONS[active].icon;
                    return <Icon width={20} height={20} />;
                  })()}
                </span>
                <span>
                  <span className={styles.captionTag}>{t(`home.why.items.${REASONS[active].key}.tag`)}</span>
                  <span className={styles.captionTitle}>{t(`home.why.items.${REASONS[active].key}.title`)}</span>
                </span>
              </div>
            </div>

            <div className={styles.doctorBadge}>
              <span className={styles.doctorBadgeIcon}>
                <ToothIcon width={18} height={18} />
              </span>
              <span>
                <strong>{clinicInfo.doctorName}</strong>
                <small>{clinicInfo.qualification}</small>
              </span>
            </div>

            <div className={styles.ratingBadge}>
              <span className={styles.stars} aria-hidden="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon key={i} width={13} height={13} />
                ))}
              </span>
              <span>
                {t("location.ratingText", {
                  rating: clinicInfo.ratingValue.toFixed(1),
                  source: clinicInfo.ratingSource,
                })}
              </span>
            </div>
          </div>
        </Reveal>

        <ul
          className={styles.list}
          onKeyDown={handleKeyDown}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          {REASONS.map((reason, index) => {
            const isActive = index === active;
            const Icon = reason.icon;
            return (
              <li key={reason.key} className={`${styles.item} ${isActive ? styles.itemActive : ""}`}>
                <Reveal delay={index * 90}>
                  <button
                    ref={(el) => {
                      tabRefs.current[index] = el;
                    }}
                    type="button"
                    id={`why-tab-${reason.key}`}
                    className={styles.trigger}
                    aria-expanded={isActive}
                    aria-controls={`why-panel-${reason.key}`}
                    onClick={() => select(index)}
                  >
                    <span className={styles.number}>{String(index + 1).padStart(2, "0")}</span>
                    <span className={styles.itemTitle}>{t(`home.why.items.${reason.key}.title`)}</span>
                    <span className={styles.itemIcon}>
                      <Icon width={20} height={20} />
                    </span>
                  </button>
                  <div
                    id={`why-panel-${reason.key}`}
                    role="region"
                    aria-labelledby={`why-tab-${reason.key}`}
                    className={styles.panel}
                  >
                    <div className={styles.panelInner}>
                      <p>{t(`home.why.items.${reason.key}.description`)}</p>
                      {isActive && !reducedMotion && (
                        <span className={styles.progress} aria-hidden="true">
                          <span
                            className={styles.progressFill}
                            style={{ animationDuration: `${AUTOPLAY_MS}ms` }}
                            onAnimationEnd={() => setActive((i) => (i + 1) % REASONS.length)}
                          />
                        </span>
                      )}
                    </div>
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ul>

        <Reveal className={styles.actions} delay={200}>
          <Link to="/book-op" className={`btn btn-primary ${styles.cta}`}>
            {t("common.bookOp")}
            <ArrowRightIcon width={18} height={18} />
          </Link>
          <button
            type="button"
            className={styles.soundToggle}
            aria-pressed={soundOn}
            onClick={toggleSound}
          >
            <SoundIcon on={soundOn} />
            {soundOn ? t("home.why.sound.on") : t("home.why.sound.off")}
          </button>
        </Reveal>
      </div>
    </section>
  );
}
