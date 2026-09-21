import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { PageMeta } from "../components/PageMeta";
import { Reveal } from "../components/Reveal";
import { CtaBanner } from "../components/CtaBanner";
import { CloseIcon, ArrowRightIcon } from "../components/icons/DentalIcons";
import beforeAfter from "../befaf.jpg";
import xrayBeforeAfter from "../befandafter.webp";
import smileWoman from "../womensmile.jpg";
import smileYoungWoman from "../smile image.jpg";
import smileChild from "../childteeth.jpg";
import smileMan from "../mensmile.jpg";
import smileBoy from "../boysmile.webp";
import styles from "./Gallery.module.css";

type Category = "clinic" | "doctor" | "camps" | "smiles";

interface Photo {
  id: string;
  src: string;
  alt: string;
  category: Category;
}

const PHOTOS: Photo[] = [
  { id: "reception", src: "/assets/clinic/clinic-reception-branding.webp", alt: "Reception area at Dr. Arun Dental Care", category: "clinic" },
  { id: "treating-1", src: "/assets/photos/treating-1.webp", alt: "Dr. Arun treating a patient", category: "doctor" },
  { id: "camp-1", src: "/assets/photos/camp-1.webp", alt: "Free dental health camp in the community", category: "camps" },
  { id: "storefront", src: "/assets/clinic/clinic-storefront.webp", alt: "Dr. Arun Dental Care clinic entrance", category: "clinic" },
  { id: "woman", src: smileWoman, alt: "Smiling patient", category: "smiles" },
  { id: "treating-2", src: "/assets/photos/treating-2.webp", alt: "Dr. Arun examining a young patient", category: "doctor" },
  { id: "camp-2", src: "/assets/photos/camp-2.webp", alt: "Dr. Arun attending patients at a dental camp", category: "camps" },
  { id: "chair-1", src: "/assets/clinic/treatment-chair-1.webp", alt: "Dental treatment chair", category: "clinic" },
  { id: "man", src: smileMan, alt: "Smiling patient during a dental visit", category: "smiles" },
  { id: "treating-3", src: "/assets/photos/treating-3.webp", alt: "Dr. Arun treating a child", category: "doctor" },
  { id: "camp-3", src: "/assets/photos/camp-3.webp", alt: "Team photo at a free medical and dental camp", category: "camps" },
  { id: "chair-2", src: "/assets/clinic/treatment-chair-2.webp", alt: "Dental treatment chair, second operatory", category: "clinic" },
  { id: "with-child", src: "/assets/photos/doctor-with-child.webp", alt: "Dr. Arun with a happy young patient", category: "smiles" },
  { id: "treating", src: "/assets/clinic/doctor-treating-patient.webp", alt: "Dr. Arun treating a patient", category: "doctor" },
  { id: "young-woman", src: smileYoungWoman, alt: "Smiling patient with a bright, confident smile", category: "smiles" },
  { id: "camp-4", src: "/assets/photos/camp-4.webp", alt: "Dental screening at a school camp", category: "camps" },
  { id: "room", src: "/assets/clinic/treatment-room-wide.webp", alt: "Treatment room at Dr. Arun Dental Care", category: "clinic" },
  { id: "treating-4", src: "/assets/photos/treating-4.webp", alt: "Dr. Arun with a patient in the chair", category: "doctor" },
  { id: "child", src: smileChild, alt: "Smiling child after a dental check-up", category: "smiles" },
  { id: "doctor-smile", src: "/assets/photos/doctor-smile.webp", alt: "Dr. Arun", category: "doctor" },
  { id: "camp-5", src: "/assets/photos/camp-5.webp", alt: "Dr. Arun with the team at a health camp", category: "camps" },
  { id: "waiting-1", src: "/assets/clinic/waiting-area-1.webp", alt: "Patient waiting area", category: "clinic" },
  { id: "treating-5", src: "/assets/photos/treating-5.webp", alt: "Dr. Arun during a treatment", category: "doctor" },
  { id: "boy", src: smileBoy, alt: "Smiling boy after a dental check-up", category: "smiles" },
  { id: "treating-6", src: "/assets/photos/treating-6.webp", alt: "Dentists at work in the clinic", category: "doctor" },
  { id: "waiting-2", src: "/assets/clinic/waiting-area-2.webp", alt: "Patient waiting area, alternate view", category: "clinic" },
  { id: "child-visit", src: "/assets/photos/child-visit.webp", alt: "Young patient learning about dental care", category: "smiles" },
  { id: "consulting", src: "/assets/clinic/consultation-candid.webp", alt: "Dr. Arun consulting with a patient", category: "doctor" },
  { id: "patient-wisdom", src: "/assets/photos/patient-wisdom.webp", alt: "Happy patient after wisdom tooth treatment", category: "smiles" },
  { id: "result-smile", src: "/assets/photos/result-smile.webp", alt: "Restored smile after treatment", category: "smiles" },
  { id: "desk", src: "/assets/clinic/consultation-desk.webp", alt: "Consultation desk at Dr. Arun Dental Care", category: "clinic" },
  { id: "walk", src: "/assets/photos/doctor-clinic-walk.webp", alt: "Dr. Arun in the clinic", category: "doctor" },
];

// Before / after results, cropped from clinic posts
interface Result {
  id: string;
  src: string;
  alt: string;
  xray?: boolean;
}

const RESULTS: Result[] = [
  { id: "portrait", src: beforeAfter, alt: "Patient before and after dental treatment" },
  { id: "teeth-poster", src: "/assets/photos/ba-teeth-poster.webp", alt: "Teeth before and after treatment" },
  { id: "crown", src: "/assets/photos/ba-crown.webp", alt: "Tooth before and after a crown / cap and root canal treatment" },
  { id: "prosthesis", src: "/assets/photos/patient-prosthesis.webp", alt: "Patient after prosthesis treatment" },
  { id: "teeth-stack", src: "/assets/photos/ba-teeth-stack.webp", alt: "Front teeth before and after treatment" },
  { id: "xray-poster", src: "/assets/photos/ba-xray-poster.webp", alt: "Dental X-ray before and after root canal treatment", xray: true },
  { id: "xray", src: xrayBeforeAfter, alt: "Dental X-ray before and after treatment", xray: true },
  { id: "xray-pair", src: "/assets/photos/xray-pair.webp", alt: "Dental X-rays showing treatment results", xray: true },
];

const FILTERS = ["all", "clinic", "doctor", "camps", "smiles"] as const;
type Filter = (typeof FILTERS)[number];

const RIBBON_ROWS = [PHOTOS.filter((_, i) => i % 2 === 0), PHOTOS.filter((_, i) => i % 2 === 1)];

export default function Gallery() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<Filter>("all");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const visible = useMemo(() => PHOTOS.filter((p) => filter === "all" || p.category === filter), [filter]);

  const categoryLabel = (category: Category | "all") => {
    switch (category) {
      case "clinic":
        return t("gallery.clinicEyebrow");
      case "doctor":
        return t("gallery.doctorEyebrow");
      case "camps":
        return t("gallery.camps");
      case "smiles":
        return t("gallery.smileEyebrow");
      default:
        return t("gallery.all");
    }
  };

  // Lightbox: keyboard control, scroll lock and initial focus.
  useEffect(() => {
    if (openIndex === null) return;
    const count = visible.length;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenIndex(null);
      else if (event.key === "ArrowRight") setOpenIndex((i) => (i === null ? i : (i + 1) % count));
      else if (event.key === "ArrowLeft") setOpenIndex((i) => (i === null ? i : (i - 1 + count) % count));
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [openIndex === null, visible.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const current = openIndex === null ? null : visible[openIndex];
  const step = (delta: number) => setOpenIndex((i) => (i === null ? i : (i + delta + visible.length) % visible.length));

  return (
    <>
      <PageMeta title={t("gallery.meta.title")} description={t("gallery.meta.description")} path="/gallery" />

      {/* ---------- Hero with scrolling photo ribbon ---------- */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroDots} aria-hidden="true" />

        <div className={`container ${styles.heroText}`}>
          <span className={`eyebrow ${styles.heroEyebrow} ${styles.rise}`} style={{ "--d": "0ms" } as CSSProperties}>
            {t("gallery.eyebrow")}
          </span>
          <h1 className={`${styles.heroTitle} ${styles.rise}`} style={{ "--d": "120ms" } as CSSProperties}>
            {t("gallery.title")}
          </h1>
          <p className={`${styles.heroIntro} ${styles.rise}`} style={{ "--d": "260ms" } as CSSProperties}>
            {t("gallery.intro")}
          </p>
        </div>

        <div className={`${styles.ribbon} ${styles.rise}`} style={{ "--d": "420ms" } as CSSProperties} aria-hidden="true">
          {RIBBON_ROWS.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className={`${styles.ribbonTrack} ${rowIndex === 1 ? styles.ribbonReverse : ""}`}
              style={{ "--dur": `${rowIndex === 0 ? 46 : 58}s` } as CSSProperties}
            >
              {[...row, ...row].map((photo, index) => (
                <span key={`${photo.id}-${index}`} className={styles.ribbonCard}>
                  <img src={photo.src} alt="" loading="eager" draggable={false} />
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Filterable gallery ---------- */}
      <section className={styles.gallery}>
        <div className={styles.aurora} aria-hidden="true" />
        <div className={`container ${styles.galleryInner}`}>
          <Reveal className={styles.filters}>
            <div className={styles.filterBar} role="tablist" aria-label={t("gallery.eyebrow")}>
              {FILTERS.map((item) => (
                <button
                  key={item}
                  type="button"
                  role="tab"
                  aria-selected={filter === item}
                  className={`${styles.filter} ${filter === item ? styles.filterActive : ""}`}
                  onClick={() => setFilter(item)}
                >
                  {categoryLabel(item)}
                  <span className={styles.filterCount}>
                    {item === "all" ? PHOTOS.length : PHOTOS.filter((p) => p.category === item).length}
                  </span>
                </button>
              ))}
            </div>
          </Reveal>

          <div className={styles.masonry} key={filter}>
            {visible.map((photo, index) => (
              <button
                key={photo.id}
                type="button"
                className={styles.tile}
                style={{ "--i": index } as CSSProperties}
                onClick={() => setOpenIndex(index)}
                aria-label={photo.alt}
              >
                <img src={photo.src} alt={photo.alt} />
                <span className={styles.tileOverlay} aria-hidden="true">
                  <span className={styles.tileLabel}>{categoryLabel(photo.category)}</span>
                  <span className={styles.tileZoom}>
                    <ArrowRightIcon width={16} height={16} />
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Before & after ---------- */}
      <section className={styles.results}>
        <div className={styles.resultsBlob} aria-hidden="true" />
        <div className="container">
          <Reveal className="section-heading">
            <span className="eyebrow">{t("gallery.beforeAfterEyebrow")}</span>
            <h2>{t("gallery.beforeAfterTitle")}</h2>
          </Reveal>

          <div className={styles.resultGrid}>
            {RESULTS.map((result, index) => (
              <Reveal key={result.id} delay={(index % 3) * 100} className={styles.resultCard}>
                <div className={`${styles.resultFrame} ${result.xray ? styles.xrayFrame : ""}`}>
                  <img src={result.src} alt={result.alt} loading="lazy" />
                  {result.xray ? <span className={styles.scan} aria-hidden="true" /> : <span className={styles.sheen} aria-hidden="true" />}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner />

      {/* ---------- Lightbox ---------- */}
      {current && (
        <div className={styles.lightbox} role="dialog" aria-modal="true" aria-label={current.alt} onClick={() => setOpenIndex(null)}>
          <button
            ref={closeRef}
            type="button"
            className={`${styles.lbButton} ${styles.lbClose}`}
            aria-label={t("gallery.close")}
            onClick={() => setOpenIndex(null)}
          >
            <CloseIcon width={22} height={22} />
          </button>
          <button
            type="button"
            className={`${styles.lbButton} ${styles.lbPrev}`}
            aria-label={t("gallery.prev")}
            onClick={(event) => {
              event.stopPropagation();
              step(-1);
            }}
          >
            <ArrowRightIcon width={22} height={22} />
          </button>
          <figure className={styles.lbFigure} onClick={(event) => event.stopPropagation()}>
            <img key={current.id} src={current.src} alt={current.alt} />
            <figcaption>
              <span>{categoryLabel(current.category)}</span>
              <span className={styles.lbCount}>
                {openIndex! + 1} / {visible.length}
              </span>
            </figcaption>
          </figure>
          <button
            type="button"
            className={`${styles.lbButton} ${styles.lbNext}`}
            aria-label={t("gallery.next")}
            onClick={(event) => {
              event.stopPropagation();
              step(1);
            }}
          >
            <ArrowRightIcon width={22} height={22} />
          </button>
        </div>
      )}
    </>
  );
}
