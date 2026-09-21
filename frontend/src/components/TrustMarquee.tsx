import { useTranslation } from "react-i18next";
import styles from "./TrustMarquee.module.css";

/**
 * Auto-scrolling strip of honest, sourced facts about the clinic (rating,
 * hours, services, location) — not fabricated patient testimonials. Once
 * the clinic shares real Google/Justdial review quotes, this is the natural
 * place to upgrade to a proper review-quote carousel.
 */
export function TrustMarquee() {
  const { t } = useTranslation();

  const items = [
    t("home.trustStrip.rating"),
    t("home.trustStrip.doctor"),
    t("home.trustStrip.location"),
    t("home.trustStrip.hours"),
    t("home.trustStrip.services"),
    t("home.trustStrip.book"),
  ];

  const track = [...items, ...items];

  return (
    <div className={styles.marquee} role="list" aria-label={t("home.trustStrip.rating")}>
      <div className={styles.track}>
        {track.map((item, index) => (
          <span className={styles.item} key={index} role="listitem">
            {item}
            <span className={styles.dot} aria-hidden="true" />
          </span>
        ))}
      </div>
    </div>
  );
}
