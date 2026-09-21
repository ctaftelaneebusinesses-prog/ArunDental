import type { CSSProperties, PointerEvent } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Reveal } from "./Reveal";
import { ServiceIcon } from "./ServiceIcon";
import { ArrowRightIcon, ToothIcon } from "./icons/DentalIcons";
import { getFeaturedServices } from "../data/services.data";
import styles from "./FeaturedServices.module.css";

const BUBBLES = [
  { left: "6%", size: 14, duration: 16, delay: 0 },
  { left: "17%", size: 24, duration: 22, delay: 4 },
  { left: "31%", size: 10, duration: 14, delay: 8 },
  { left: "48%", size: 18, duration: 19, delay: 2 },
  { left: "63%", size: 28, duration: 24, delay: 6 },
  { left: "78%", size: 12, duration: 15, delay: 10 },
  { left: "91%", size: 20, duration: 20, delay: 3 },
] as const;

const MAX_TILT = 9;

/** Tilts the card toward the cursor and feeds the spotlight position — mouse only, no re-renders. */
function handlePointerMove(event: PointerEvent<HTMLAnchorElement>) {
  if (event.pointerType !== "mouse") return;
  const el = event.currentTarget;
  const rect = el.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width;
  const y = (event.clientY - rect.top) / rect.height;
  el.style.setProperty("--mx", `${x * 100}%`);
  el.style.setProperty("--my", `${y * 100}%`);
  el.style.setProperty("--ry", `${(x - 0.5) * 2 * MAX_TILT}deg`);
  el.style.setProperty("--rx", `${(0.5 - y) * 2 * MAX_TILT}deg`);
}

function handlePointerLeave(event: PointerEvent<HTMLAnchorElement>) {
  const el = event.currentTarget;
  el.style.setProperty("--rx", "0deg");
  el.style.setProperty("--ry", "0deg");
}

export function FeaturedServices() {
  const { t } = useTranslation();
  const featured = getFeaturedServices();

  return (
    <section className={styles.section} aria-labelledby="services-heading">
      <div className={styles.aurora} aria-hidden="true" />
      <div className={styles.ringBackdrop} aria-hidden="true">
        <ToothIcon width={320} height={320} />
      </div>
      <div className={styles.bubbles} aria-hidden="true">
        {BUBBLES.map((bubble) => (
          <span
            key={bubble.left}
            className={styles.bubble}
            style={{
              left: bubble.left,
              width: bubble.size,
              height: bubble.size,
              animationDuration: `${bubble.duration}s`,
              animationDelay: `${bubble.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="container">
        <Reveal className={`section-heading ${styles.heading}`}>
          <span className="eyebrow">{t("home.services.eyebrow")}</span>
          <h2 id="services-heading">{t("home.services.title")}</h2>
          <div className={styles.divider} aria-hidden="true">
            <span className={styles.dividerLine} />
            <span className={styles.dividerIcon}>
              <ToothIcon width={20} height={20} />
            </span>
            <span className={styles.dividerLine} />
          </div>
          <p>{t("home.services.subtitle")}</p>
        </Reveal>

        <div className={styles.grid}>
          {featured.map((service, index) => {
            const base = `services.categories.${service.categorySlug}.items.${service.slug}`;
            const name = t(`${base}.name`, service.name);
            return (
              <Reveal key={service.slug} delay={index * 90} className={styles.cell}>
                <Link
                  to={`/services#${service.slug}`}
                  className={styles.card}
                  style={{ "--float-delay": `${index * 0.7}s` } as CSSProperties}
                  onPointerMove={handlePointerMove}
                  onPointerLeave={handlePointerLeave}
                >
                  <span className={styles.fx} aria-hidden="true">
                    <span className={styles.spotlight} />
                    <span className={styles.shine} />
                  </span>
                  <span className={styles.border} aria-hidden="true" />

                  <span className={styles.index} aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span className={styles.iconWrap} aria-hidden="true">
                    <span className={styles.pulse} />
                    <span className={`${styles.pulse} ${styles.pulseLate}`} />
                    <span className={styles.icon}>
                      <ServiceIcon icon={service.icon} width={28} height={28} />
                    </span>
                  </span>

                  <span className={styles.body}>
                    <span className={styles.name}>{name}</span>
                    <span className={styles.description}>{t(`${base}.description`, service.description)}</span>
                  </span>

                  <span className={styles.more}>
                    {t("common.learnMore")}
                    <ArrowRightIcon width={16} height={16} />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>

        <Reveal className={styles.viewAllWrap} delay={200}>
          <Link to="/services" className={`btn btn-primary ${styles.viewAll}`}>
            {t("common.viewAllServices")}
            <ArrowRightIcon width={18} height={18} />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
