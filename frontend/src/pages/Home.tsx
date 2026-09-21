import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PageMeta } from "../components/PageMeta";
import { Reveal } from "../components/Reveal";
import { TrustMarquee } from "../components/TrustMarquee";
import { WhyChoose } from "../components/WhyChoose";
import { FeaturedServices } from "../components/FeaturedServices";
import { DoctorSection } from "../components/DoctorSection";
import { clinicInfo } from "../config/clinicInfo";
import {
  ArrowRightIcon,
  HeartIcon,
  MapPinIcon,
  PhoneIcon,
  ShieldCheckIcon,
  SparkleCleanIcon,
  ToothIcon,
  UsersIcon,
  WhatsAppIcon,
  XrayIcon,
} from "../components/icons/DentalIcons";
import styles from "./Home.module.css";

const HERO_FEATURES = [
  { key: "tech", icon: ToothIcon },
  { key: "diagnostics", icon: XrayIcon },
  { key: "painFree", icon: ShieldCheckIcon },
  { key: "cosmetic", icon: SparkleCleanIcon },
  { key: "team", icon: UsersIcon },
] as const;

const HERO_TRUST = [
  { key: "trusted", icon: ShieldCheckIcon },
  { key: "team", icon: UsersIcon },
  { key: "tech", icon: ToothIcon },
  { key: "smiles", icon: HeartIcon },
] as const;

export default function Home() {
  const { t } = useTranslation();

  return (
    <>
      <PageMeta title={t("home.meta.title")} description={t("home.meta.description")} path="/" />

      <section className={styles.hero}>
        <div className={styles.heroBackdrop} aria-hidden="true">
          <span className={styles.backdropPhoto} />
          <span className={styles.backdropArc} />
          <span className={styles.backdropBlobA} />
          <span className={styles.backdropBlobB} />
        </div>

        <div className={`${styles.heroInner} ${styles.heroGrid}`}>
          <div className={styles.heroContent}>
            <span className={`${styles.eyebrow} ${styles.rise}`} style={{ animationDelay: "0ms" }}>
              {t("home.hero.eyebrow")}
              <span className={styles.eyebrowLine} aria-hidden="true" />
            </span>
            <h1 className={`${styles.headline} ${styles.rise}`} style={{ animationDelay: "80ms" }}>
              <span className={styles.headlineLine}>{t("home.hero.headlineLine1")}</span>
              <span className={`${styles.headlineLine} ${styles.headlineAccent}`}>{t("home.hero.headlineLine2")}</span>
            </h1>
            <p className={`${styles.supportText} ${styles.rise}`} style={{ animationDelay: "160ms" }}>
              {t("home.hero.supportText")}
            </p>
            <div className={`${styles.heroActions} ${styles.rise}`} style={{ animationDelay: "240ms" }}>
              <Link to="/book-op" className={`btn btn-primary ${styles.heroBtn}`}>
                {t("common.bookOp")}
                <ArrowRightIcon width={20} height={20} strokeWidth={2} />
              </Link>
            </div>
            <ul className={`${styles.trustRow} ${styles.rise}`} style={{ animationDelay: "340ms" }}>
              {HERO_TRUST.map((item) => (
                <li key={item.key} className={styles.trustItem}>
                  <span className={styles.trustIcon}>
                    <item.icon width={24} height={24} />
                  </span>
                  <span className={styles.trustLabel}>{t(`home.hero.trust.${item.key}`)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.visualWrap}>
            <div className={styles.visual}>
              <span className={styles.visualGlow} aria-hidden="true" />
              <span className={`${styles.spark} ${styles.spark1}`} aria-hidden="true" />
              <span className={`${styles.spark} ${styles.spark2}`} aria-hidden="true" />
              <span className={`${styles.spark} ${styles.spark3}`} aria-hidden="true" />
              <span className={`${styles.spark} ${styles.spark4}`} aria-hidden="true" />
              <img
                className={styles.tooth}
                src="/assets/clinic/teeth-hero.webp"
                alt={t("home.hero.imageAlt")}
                width={1200}
                height={800}
                fetchPriority="high"
              />
              <span className={styles.pedestal} aria-hidden="true" />
            </div>
            <ul className={styles.chips}>
              {HERO_FEATURES.map((item, index) => (
                <li key={item.key} className={`${styles.chip} ${styles[`chip${index + 1}`]}`}>
                  <span className={styles.chipIcon}>
                    <item.icon width={26} height={26} />
                  </span>
                  <span className={styles.chipLabel}>{t(`home.hero.features.${item.key}`)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <TrustMarquee />

      <WhyChoose />

      <FeaturedServices />

      <DoctorSection />

      <section className={styles.ctaSection}>
        <Reveal className={`container ${styles.ctaContent}`}>
          <h2 className={styles.ctaHeading}>{t("home.cta.heading")}</h2>
          <p className={styles.ctaText}>{t("home.cta.text")}</p>
          <div className={styles.ctaActions}>
            <Link to="/book-op" className="btn btn-primary">
              {t("common.bookOp")}
            </Link>
          </div>
        </Reveal>
      </section>

      <section className={`section ${styles.contactPreviewSection}`}>
        <Reveal className={`container ${styles.contactPreview}`}>
          <div>
            <h2 className={styles.contactHeading}>{clinicInfo.name}</h2>
            <p className={styles.contactLocation}>{clinicInfo.location}</p>
          </div>
          <div className={styles.contactActions}>
            <a href={clinicInfo.phoneHref} className="btn btn-secondary">
              <PhoneIcon width={18} height={18} /> {t("common.callClinic")}
            </a>
            <a
              href={`https://wa.me/${clinicInfo.whatsappNumber}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary"
            >
              <WhatsAppIcon width={18} height={18} /> {t("common.whatsapp")}
            </a>
            <a href={clinicInfo.googleMapsUrl} target="_blank" rel="noreferrer" className="btn btn-secondary">
              <MapPinIcon width={18} height={18} /> {t("common.googleMaps")}
            </a>
          </div>
        </Reveal>
      </section>
    </>
  );
}
