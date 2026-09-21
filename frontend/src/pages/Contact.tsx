import { useEffect, useState, type CSSProperties, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PageMeta } from "../components/PageMeta";
import { Reveal } from "../components/Reveal";
import { clinicInfo, clinicHoursSchedule } from "../config/clinicInfo";
import { formatHoursRange, getTodaysHours, isClinicOpenNow } from "../utils/clinicHours";
import {
  ArrowRightIcon,
  CalendarCheckIcon,
  ClockIcon,
  DirectionsIcon,
  MapPinIcon,
  PhoneIcon,
  StarIcon,
  WhatsAppIcon,
} from "../components/icons/DentalIcons";
import styles from "./Contact.module.css";

const DAY_KEYS: Record<string, string> = {
  Monday: "monday",
  Tuesday: "tuesday",
  Wednesday: "wednesday",
  Thursday: "thursday",
  Friday: "friday",
  Saturday: "saturday",
  Sunday: "sunday",
};

const MOBILE_REGEX = /^[6-9]\d{9}$/;

export default function Contact() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState<boolean | null>(null);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [errors, setErrors] = useState<{ name?: string; mobile?: string }>({});

  useEffect(() => {
    setIsOpen(isClinicOpenNow(clinicHoursSchedule));
  }, []);

  // Step 1 of the booking: validate the short form, then continue on the full Book OP page with these details.
  function handleNext(event: FormEvent) {
    event.preventDefault();
    const next: { name?: string; mobile?: string } = {};
    if (name.trim().length < 2) next.name = t("bookOp.errors.name");
    if (!MOBILE_REGEX.test(mobile.trim())) next.mobile = t("bookOp.errors.mobile");
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    navigate("/book-op", { state: { prefill: { name: name.trim(), mobile: mobile.trim(), preferredDate } } });
  }

  const today = getTodaysHours(clinicHoursSchedule);

  return (
    <>
      <PageMeta title={t("contact.meta.title")} description={t("contact.meta.description")} path="/contact" />

      {/* ---------- Hero: clinic identity + the Book OP card ---------- */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroDots} aria-hidden="true" />

        <div className={`container ${styles.heroGrid}`}>
          <div className={styles.heroText}>
            <span className={`eyebrow ${styles.heroEyebrow} ${styles.rise}`} style={{ "--d": "0ms" } as CSSProperties}>
              {t("contact.eyebrow")}
            </span>
            <h1 className={`${styles.heroTitle} ${styles.rise}`} style={{ "--d": "120ms" } as CSSProperties}>
              {clinicInfo.name}
            </h1>
            <p className={`${styles.heroLocation} ${styles.rise}`} style={{ "--d": "220ms" } as CSSProperties}>
              <MapPinIcon width={20} height={20} />
              {clinicInfo.location}
            </p>

            {isOpen !== null && (
              <div
                className={`${styles.status} ${isOpen ? styles.statusOpen : styles.statusClosed} ${styles.rise}`}
                style={{ "--d": "320ms" } as CSSProperties}
              >
                <span className={styles.statusDot} aria-hidden="true" />
                <strong>{isOpen ? t("location.openNow") : t("location.closedNow")}</strong>
                {today && <span className={styles.statusHours}>{formatHoursRange(today)}</span>}
              </div>
            )}

            <div className={`${styles.quick} ${styles.rise}`} style={{ "--d": "420ms" } as CSSProperties}>
              <a href={clinicInfo.phoneHref} className={styles.quickItem}>
                <span className={styles.quickIcon}>
                  <PhoneIcon width={20} height={20} />
                </span>
                <span>
                  <small>{t("common.callClinic")}</small>
                  <strong>{clinicInfo.phoneDisplay}</strong>
                </span>
              </a>
              <a
                href={`https://wa.me/${clinicInfo.whatsappNumber}`}
                target="_blank"
                rel="noreferrer"
                className={styles.quickItem}
              >
                <span className={styles.quickIcon}>
                  <WhatsAppIcon width={20} height={20} />
                </span>
                <span>
                  <small>{t("contact.reachWhatsappSub")}</small>
                  <strong>{t("common.whatsapp")}</strong>
                </span>
              </a>
            </div>
          </div>

          <div className={`${styles.bookWrap} ${styles.rise}`} style={{ "--d": "300ms" } as CSSProperties}>
            <div className={styles.bookCard}>
              <span className={styles.bookBadge}>
                <CalendarCheckIcon width={16} height={16} />
                {t("contact.book.step")}
              </span>
              <h2 className={styles.bookTitle}>{t("contact.book.title")}</h2>
              <p className={styles.bookExplain}>{t("contact.book.explain")}</p>

              <form onSubmit={handleNext} noValidate className={styles.miniForm}>
                <div className={`field ${styles.miniField}`}>
                  <label htmlFor="quick-name">
                    {t("bookOp.fields.name")} <span className="required">*</span>
                  </label>
                  <input
                    id="quick-name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={errors.name ? "has-error" : ""}
                    aria-invalid={Boolean(errors.name)}
                  />
                  {errors.name && <p className="field-error">{errors.name}</p>}
                </div>

                <div className={`form-row ${styles.miniRow}`}>
                  <div className={`field ${styles.miniField}`}>
                    <label htmlFor="quick-mobile">
                      {t("bookOp.fields.mobile")} <span className="required">*</span>
                    </label>
                    <input
                      id="quick-mobile"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      maxLength={10}
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/[^0-9]/g, ""))}
                      className={errors.mobile ? "has-error" : ""}
                      aria-invalid={Boolean(errors.mobile)}
                    />
                    {errors.mobile && <p className="field-error">{errors.mobile}</p>}
                  </div>
                  <div className={`field ${styles.miniField}`}>
                    <label htmlFor="quick-date">{t("bookOp.fields.preferredDate")}</label>
                    <input
                      id="quick-date"
                      type="date"
                      value={preferredDate}
                      min={new Date().toISOString().slice(0, 10)}
                      onChange={(e) => setPreferredDate(e.target.value)}
                    />
                  </div>
                </div>

                <button type="submit" className={styles.bookButton}>
                  <span className={styles.bookButtonRing} aria-hidden="true" />
                  {t("contact.book.next")}
                  <ArrowRightIcon width={20} height={20} />
                </button>
                <p className={styles.nextHint}>{t("contact.book.nextHint")}</p>
              </form>

              <p className={styles.bookAlt}>{t("contact.book.alt")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Details ---------- */}
      <section className={styles.details}>
        <div className={styles.detailsBlob} aria-hidden="true" />
        <div className="container">
          <Reveal className="section-heading">
            <span className="eyebrow">{t("contact.reachEyebrow")}</span>
            <h2>{t("contact.reachTitle")}</h2>
          </Reveal>

          <div className={styles.cards}>
            <Reveal className={styles.cardCell}>
              <div className={styles.card}>
                <span className={styles.cardIcon}>
                  <MapPinIcon width={26} height={26} />
                </span>
                <h3>{t("location.addressLabel")}</h3>
                <p className={styles.address}>
                  {clinicInfo.addressLine1}
                  <br />
                  {clinicInfo.addressLine2}
                </p>
                <a href={clinicInfo.googleMapsUrl} target="_blank" rel="noreferrer" className={`btn btn-secondary ${styles.cardButton}`}>
                  <DirectionsIcon width={18} height={18} /> {t("location.getDirections")}
                </a>
              </div>
            </Reveal>

            <Reveal delay={100} className={styles.cardCell}>
              <div className={styles.card}>
                <span className={styles.cardIcon}>
                  <PhoneIcon width={26} height={26} />
                </span>
                <h3>{t("common.callClinic")}</h3>
                <a href={clinicInfo.phoneHref} className={styles.phone}>
                  {clinicInfo.phoneDisplay}
                </a>
                <div className={styles.cardActions}>
                  <a href={clinicInfo.phoneHref} className={`btn btn-secondary ${styles.cardButton}`}>
                    <PhoneIcon width={18} height={18} /> {t("common.callClinic")}
                  </a>
                  <a
                    href={`https://wa.me/${clinicInfo.whatsappNumber}`}
                    target="_blank"
                    rel="noreferrer"
                    className={`btn btn-secondary ${styles.cardButton}`}
                  >
                    <WhatsAppIcon width={18} height={18} /> {t("common.whatsapp")}
                  </a>
                </div>
              </div>
            </Reveal>

            <Reveal delay={200} className={styles.cardCell}>
              <div className={styles.card}>
                <span className={styles.cardIcon}>
                  <ClockIcon width={26} height={26} />
                </span>
                <div className={styles.hoursHeader}>
                  <h3>{t("location.hoursLabel")}</h3>
                  {isOpen !== null && (
                    <span className={`badge ${isOpen ? "badge-completed" : "badge-cancelled"}`}>
                      {isOpen ? t("location.openNow") : t("location.closedNow")}
                    </span>
                  )}
                </div>
                <ul className={styles.hoursList}>
                  {clinicHoursSchedule.map((entry) => (
                    <li key={entry.day} className={entry.day === today?.day ? styles.today : ""}>
                      <span>{t(`location.days.${DAY_KEYS[entry.day]}`)}</span>
                      <span>{formatHoursRange(entry)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>

          <Reveal className={styles.rating}>
            <span className={styles.stars} aria-hidden="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon key={i} width={16} height={16} />
              ))}
            </span>
            {t("location.ratingText", { rating: clinicInfo.ratingValue.toFixed(1), source: clinicInfo.ratingSource })}
          </Reveal>
        </div>
      </section>

      {/* ---------- Map ---------- */}
      <section className={styles.mapSection}>
        <div className="container">
          <Reveal className={styles.mapWrap}>
            <iframe
              title={t("contact.mapTitle")}
              src={clinicInfo.googleMapsEmbedUrl}
              width="100%"
              height="440"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className={styles.mapCard}>
              <span className={styles.mapCardIcon}>
                <MapPinIcon width={22} height={22} />
              </span>
              <div>
                <strong>{clinicInfo.name}</strong>
                <span>{clinicInfo.location}</span>
              </div>
              <a href={clinicInfo.googleMapsUrl} target="_blank" rel="noreferrer" className={styles.mapLink} aria-label={t("location.getDirections")}>
                <DirectionsIcon width={20} height={20} />
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
