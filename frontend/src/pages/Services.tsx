import { useEffect, useState, type CSSProperties } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PageMeta } from "../components/PageMeta";
import { ServiceTile } from "../components/ServiceTile";
import { ServiceIcon } from "../components/ServiceIcon";
import { CtaBanner } from "../components/CtaBanner";
import { Reveal } from "../components/Reveal";
import { serviceCategories } from "../data/services.data";
import styles from "./Services.module.css";

// Splits the treatments into two lanes for the scrolling hero ticker.
function toLanes<T>(items: T[]): [T[], T[]] {
  return [items.filter((_, i) => i % 2 === 0), items.filter((_, i) => i % 2 === 1)];
}

/** Counts up from 0 once mounted; jumps straight to the value for reduced motion. */
function useCountUp(target: number, duration = 1600) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }
    let frame = 0;
    const start = performance.now() + 500;
    const tick = (now: number) => {
      const progress = Math.min(Math.max((now - start) / duration, 0), 1);
      setValue(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}

export default function Services() {
  const { t } = useTranslation();
  const category = serviceCategories[0];
  const { hash } = useLocation();
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const count = useCountUp(category.items.length);
  const lanes = toLanes(category.items);

  // Arriving from a Home card (/services#slug): bring that treatment into view and flash it.
  useEffect(() => {
    const slug = decodeURIComponent(hash.slice(1));
    const el = slug ? document.getElementById(slug) : null;
    if (!el) return;
    const frame = requestAnimationFrame(() => el.scrollIntoView({ behavior: "smooth", block: "center" }));
    setHighlighted(slug);
    const timer = window.setTimeout(() => setHighlighted(null), 3200);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [hash]);

  return (
    <>
      <PageMeta title={t("services.meta.title")} description={t("services.meta.description")} path="/services" />

      {/* ---------- Hero ---------- */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroDots} aria-hidden="true" />

        <div className={`container ${styles.heroGrid}`}>
          <div className={styles.heroText}>
            <span className={`eyebrow ${styles.heroEyebrow} ${styles.rise}`} style={{ "--d": "0ms" } as CSSProperties}>
              {t("services.eyebrow")}
            </span>
            <h1 className={`${styles.heroTitle} ${styles.rise}`} style={{ "--d": "120ms" } as CSSProperties}>
              {t("services.title")}
            </h1>
            <p className={`${styles.heroIntro} ${styles.rise}`} style={{ "--d": "260ms" } as CSSProperties}>
              {t("services.intro")}
            </p>
            <div className={`${styles.stat} ${styles.rise}`} style={{ "--d": "400ms" } as CSSProperties}>
              <span className={styles.statNumber} aria-label={String(category.items.length)}>
                {count}
              </span>
              <span className={styles.statLabel}>{t(`services.categories.${category.slug}.title`)}</span>
            </div>
          </div>

          <div className={`${styles.ticker} ${styles.rise}`} style={{ "--d": "300ms" } as CSSProperties} aria-hidden="true">
            <span className={styles.tickerGlow} />
            <div className={styles.tickerPanel}>
              {lanes.map((lane, laneIndex) => (
                <div
                  key={laneIndex}
                  className={`${styles.lane} ${laneIndex === 1 ? styles.laneDown : ""}`}
                  style={{ "--dur": `${laneIndex === 0 ? 34 : 42}s` } as CSSProperties}
                >
                  {[...lane, ...lane].map((service, index) => (
                    <div key={`${service.slug}-${index}`} className={styles.chip}>
                      <span className={styles.chipIcon}>
                        <ServiceIcon icon={service.icon} width={20} height={20} />
                      </span>
                      <span className={styles.chipName}>
                        {t(`services.categories.${category.slug}.items.${service.slug}.name`, service.name)}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Treatments ---------- */}
      <section className={styles.treatments}>
        <div className={styles.aurora} aria-hidden="true" />
        <div className={`container ${styles.gridWrap}`}>
          <div className={styles.grid}>
            {category.items.map((service, itemIndex) => (
              <div
                key={service.slug}
                id={service.slug}
                className={`${styles.anchor} ${highlighted === service.slug ? styles.highlight : ""}`}
              >
                <Reveal delay={(itemIndex % 3) * 90} className={styles.cell}>
                  <ServiceTile service={service} categorySlug={category.slug} index={itemIndex} />
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
