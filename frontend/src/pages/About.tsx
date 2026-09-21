import type { CSSProperties, PointerEvent } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PageMeta } from "../components/PageMeta";
import { Reveal } from "../components/Reveal";
import { clinicInfo } from "../config/clinicInfo";
import {
  ArrowRightIcon,
  ChatHeartIcon,
  ClockIcon,
  ComfortIcon,
  CrownIcon,
  ImplantIcon,
  MapPinIcon,
  RootCanalIcon,
  ShieldCheckIcon,
  SparkleCleanIcon,
  StarIcon,
} from "../components/icons/DentalIcons";
import styles from "./About.module.css";

const APPROACH = [
  { key: "consultation", icon: ChatHeartIcon },
  { key: "communication", icon: ShieldCheckIcon },
  { key: "comfort", icon: ComfortIcon },
] as const;

const SPECIALIZATION_ICONS = [
  RootCanalIcon,
  ImplantIcon,
  SparkleCleanIcon,
  CrownIcon,
];

const MAX_TILT = 8;

/** Tilts the portrait toward the cursor (mouse only) without re-rendering. */
function tiltMove(event: PointerEvent<HTMLDivElement>) {
  if (event.pointerType !== "mouse") return;
  const el = event.currentTarget;
  const rect = el.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width;
  const y = (event.clientY - rect.top) / rect.height;
  el.style.setProperty("--ry", `${(x - 0.5) * 2 * MAX_TILT}deg`);
  el.style.setProperty("--rx", `${(0.5 - y) * 2 * MAX_TILT}deg`);
}

function tiltLeave(event: PointerEvent<HTMLDivElement>) {
  event.currentTarget.style.setProperty("--rx", "0deg");
  event.currentTarget.style.setProperty("--ry", "0deg");
}

export default function About() {
  const { t } = useTranslation();

  const facts = [
    { icon: MapPinIcon, text: t("home.trustStrip.location") },
    { icon: ClockIcon, text: t("home.trustStrip.hours") },
    {
      icon: StarIcon,
      text: t("location.ratingText", {
        rating: clinicInfo.ratingValue.toFixed(1),
        source: clinicInfo.ratingSource,
      }),
    },
    {
      icon: ShieldCheckIcon,
      text: `${clinicInfo.doctorName}, ${clinicInfo.qualification}`,
    },
  ];

  const specializations = t("about.specializationsHighlight")
    .split("·")
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <>
      <PageMeta
        title={t("about.meta.title")}
        description={t("about.meta.description")}
        path="/about"
      />

      {/* ---------- Hero ---------- */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroDots} aria-hidden="true" />

        <div className={`container ${styles.heroGrid}`}>
          <div className={styles.heroText}>
            <span
              className={`eyebrow ${styles.heroEyebrow} ${styles.rise}`}
              style={{ "--d": "0ms" } as CSSProperties}
            >
              {t("about.eyebrow")}
            </span>
            <h1
              className={`${styles.heroTitle} ${styles.rise}`}
              style={{ "--d": "120ms" } as CSSProperties}
            >
              {t("about.title")}
            </h1>
            <p
              className={`${styles.heroIntro} ${styles.rise}`}
              style={{ "--d": "260ms" } as CSSProperties}
            >
              {t("about.intro")}
            </p>
          </div>

          <div
            className={`${styles.collage} ${styles.rise}`}
            style={{ "--d": "380ms" } as CSSProperties}
          >
            <span className={styles.collageGlow} aria-hidden="true" />
            <span className={styles.collageRing} aria-hidden="true" />
            <span className={`${styles.spark} ${styles.spark1}`} aria-hidden="true" />
            <span className={`${styles.spark} ${styles.spark2}`} aria-hidden="true" />
            <figure className={`${styles.shot} ${styles.shotMain}`} style={{ "--delay": "0s" } as CSSProperties}>
              <img
                src="/assets/clinic/clinic-storefront.webp"
                alt="Dr. Arun Dental Care clinic entrance"
                loading="eager"
              />
            </figure>
            <figure className={`${styles.shot} ${styles.shotSmall}`} style={{ "--delay": "1.4s" } as CSSProperties}>
              <img
                src="/assets/clinic/treatment-room-wide.webp"
                alt="Treatment room at Dr. Arun Dental Care"
                loading="eager"
              />
            </figure>
            <figure className={`${styles.shot} ${styles.shotWide}`} style={{ "--delay": "2.6s" } as CSSProperties}>
              <img
                src="/assets/clinic/clinic-reception-branding.webp"
                alt="Reception at Dr. Arun Dental Care"
                loading="eager"
              />
            </figure>
          </div>
        </div>

        <div className="container">
          <ul className={styles.facts}>
            {facts.map((fact, index) => (
              <li
                key={index}
                className={`${styles.fact} ${styles.rise}`}
                style={{ "--d": `${520 + index * 90}ms` } as CSSProperties}
              >
                <span className={styles.factIcon}>
                  <fact.icon width={18} height={18} />
                </span>
                {fact.text}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- Doctor profile ---------- */}
      <section className={styles.doctor}>
        <div className={styles.doctorBlob} aria-hidden="true" />
        <div className={`container ${styles.doctorGrid}`}>
          <Reveal className={styles.stageCol}>
            <div className={styles.stage}>
              <span className={styles.sideLabel} aria-hidden="true">
                {clinicInfo.name}
              </span>
              <div className={styles.cardBack} aria-hidden="true" />
              <div className={styles.cardOutline} aria-hidden="true" />
              <div
                className={styles.tilt}
                onPointerMove={tiltMove}
                onPointerLeave={tiltLeave}
              >
                <div className={styles.photoFrame}>
                  <img
                    src="/assets/photos/doctor-outdoor.webp"
                    alt={`${clinicInfo.doctorName}, ${clinicInfo.qualification}`}
                    width={480}
                    height={640}
                    loading="lazy"
                  />
                  <div className={styles.photoTint} aria-hidden="true" />
                </div>
                <div className={styles.nameCard}>
                  <span className={styles.nameCardIcon}>
                    <ShieldCheckIcon width={20} height={20} />
                  </span>
                  <span>
                    <strong>{clinicInfo.doctorName}</strong>
                    <small>{clinicInfo.qualification}</small>
                  </span>
                </div>
                <div className={styles.ratingChip}>
                  <StarIcon width={14} height={14} />
                  {clinicInfo.ratingValue.toFixed(1)}
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120} className={styles.profile}>
            <span className={`eyebrow ${styles.profileEyebrow}`}>
              {t("about.doctorProfileEyebrow")}
            </span>
            <h2 className={styles.name}>{clinicInfo.doctorName}</h2>
            <span className={styles.qualification}>
              {clinicInfo.qualification}
            </span>
            <p className={styles.bio}>{t("about.doctorBio")}</p>

            <div className={styles.specs}>
              <span className={styles.specsLabel}>
                {t("about.specializationsLabel")}
              </span>
              <ul className={styles.specList}>
                {specializations.map((spec, index) => {
                  const Icon =
                    SPECIALIZATION_ICONS[index % SPECIALIZATION_ICONS.length];
                  return (
                    <li
                      key={spec}
                      className={styles.spec}
                      style={{ "--i": index } as CSSProperties}
                    >
                      <span className={styles.specIcon}>
                        <Icon width={20} height={20} />
                      </span>
                      <span className={styles.specName}>{spec}</span>
                      <span className={styles.specIndex}>
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className={styles.actions}>
              <Link
                to="/book-op"
                className={`btn btn-primary ${styles.primaryAction}`}
              >
                {t("common.bookOp")}
                <ArrowRightIcon width={18} height={18} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- Approach timeline ---------- */}
      <section className={styles.approach}>
        <div className="container">
          <Reveal className={`section-heading ${styles.approachHeading}`}>
            <span className="eyebrow">{t("about.approachEyebrow")}</span>
            <h2>{t("about.approachTitle")}</h2>
          </Reveal>

          <Reveal className={styles.timeline}>
            <div className={styles.track} aria-hidden="true">
              <span className={styles.trackFill} />
            </div>
            <ol className={styles.steps}>
              {APPROACH.map((item, index) => (
                <li
                  key={item.key}
                  className={styles.step}
                  style={{ "--i": index } as CSSProperties}
                >
                  <span className={styles.node}>
                    <span className={styles.nodePulse} aria-hidden="true" />
                    <item.icon width={28} height={28} />
                    <span className={styles.nodeNumber}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </span>
                  <div className={styles.stepCard}>
                    <h3>{t(`about.approach.${item.key}.title`)}</h3>
                    <p>{t(`about.approach.${item.key}.description`)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      {/* ---------- Closing CTA ---------- */}
      <section className={styles.ctaSection}>
        <Reveal className="container">
          <div className={styles.cta}>
            <div className={styles.ctaGlow} aria-hidden="true" />
            <div className={styles.ctaText}>
              <h2>{t("home.cta.heading")}</h2>
              <p>{t("home.cta.text")}</p>
            </div>
            <div className={styles.ctaActions}>
              <Link
                to="/book-op"
                className={`btn btn-primary ${styles.primaryAction}`}
              >
                {t("common.bookOp")}
                <ArrowRightIcon width={18} height={18} />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
