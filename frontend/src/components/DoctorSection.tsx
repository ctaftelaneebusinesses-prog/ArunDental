import { Fragment, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Reveal } from "./Reveal";
import { clinicInfo } from "../config/clinicInfo";
import { ArrowRightIcon, ClockIcon, MapPinIcon, StarIcon, ToothIcon } from "./icons/DentalIcons";
import styles from "./DoctorSection.module.css";

const BADGE_TEXT = `${clinicInfo.name} • ${clinicInfo.qualification} • ${clinicInfo.location.split(",")[0]} • `.toUpperCase();

export function DoctorSection() {
  const { t } = useTranslation();
  const words = t("home.doctor.bio").split(" ");

  return (
    <section className={styles.section} aria-labelledby="doctor-name">
      <div className={styles.blob} aria-hidden="true" />
      <div className={styles.watermark} aria-hidden="true">
        <ToothIcon width={520} height={520} />
      </div>

      <div className={`container ${styles.grid}`}>
        <Reveal className={styles.visualCol}>
          <div className={styles.visual}>
            <div className={styles.dots} aria-hidden="true" />
            <div className={styles.offsetFrame} aria-hidden="true" />
            <div className={styles.photoFrame}>
              <img
                src="/assets/photos/treating-2.webp"
                alt={`${clinicInfo.doctorName}, ${clinicInfo.qualification}`}
                loading="lazy"
                width={1280}
                height={905}
              />
            </div>

            <div className={styles.seal} aria-hidden="true">
              <svg viewBox="0 0 100 100" className={styles.sealText}>
                <defs>
                  <path id="doctor-seal-path" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
                </defs>
                <text>
                  <textPath href="#doctor-seal-path" textLength="236" lengthAdjust="spacing">
                    {BADGE_TEXT}
                  </textPath>
                </text>
              </svg>
              <span className={styles.sealIcon}>
                <ToothIcon width={30} height={30} />
              </span>
            </div>
          </div>
        </Reveal>

        <Reveal className={styles.textCol} delay={120}>
          <span className={`eyebrow ${styles.eyebrow}`}>{t("home.doctor.eyebrow")}</span>

          <div className={styles.quoteWrap}>
            <span className={styles.quoteMark} aria-hidden="true">
              &ldquo;
            </span>
            <blockquote className={styles.quote}>
              {words.map((word, index) => (
                <Fragment key={`${word}-${index}`}>
                  <span className={styles.word} style={{ "--i": index } as CSSProperties}>
                    {word}
                  </span>{" "}
                </Fragment>
              ))}
            </blockquote>
          </div>

          <div className={styles.byline}>
            <span className={styles.avatar}>
              <img src="/assets/photos/doctor-face.webp" alt="" loading="lazy" />
            </span>
            <span className={styles.bylineText}>
              <strong id="doctor-name" className={styles.name}>
                {clinicInfo.doctorName}
              </strong>
              <span className={styles.qualification}>{clinicInfo.qualification}</span>
            </span>
            <svg className={styles.signature} viewBox="0 0 180 24" aria-hidden="true">
              <path d="M2 16 C 26 2, 44 24, 70 10 S 118 4, 132 14 S 164 18, 178 6" pathLength={1} />
            </svg>
          </div>

          <ul className={styles.chips}>
            <li>
              <MapPinIcon width={16} height={16} />
              {t("home.trustStrip.location")}
            </li>
            <li>
              <ClockIcon width={16} height={16} />
              {t("home.trustStrip.hours")}
            </li>
            <li>
              <StarIcon width={16} height={16} />
              {t("location.ratingText", {
                rating: clinicInfo.ratingValue.toFixed(1),
                source: clinicInfo.ratingSource,
              })}
            </li>
          </ul>

          <div className={styles.actions}>
            <Link to="/about" className={`btn btn-primary ${styles.primaryAction}`}>
              {t("common.aboutDoctor")}
              <ArrowRightIcon width={18} height={18} />
            </Link>
            <Link to="/book-op" className="btn btn-secondary">
              {t("common.bookOp")}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
