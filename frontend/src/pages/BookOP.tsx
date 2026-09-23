import { FormEvent, useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PageMeta } from "../components/PageMeta";
import { CalendarCheckIcon, MapPinIcon, PhoneIcon, ShieldCheckIcon, WhatsAppIcon } from "../components/icons/DentalIcons";
import { clinicInfo, clinicHoursSchedule } from "../config/clinicInfo";
import { formatHoursRange, getTodaysHours, isClinicOpenNow } from "../utils/clinicHours";
import { submitBookOp } from "../api/appointments";
import { OCCUPATIONS, OTHER_OCCUPATION } from "../data/occupations";
import { ApiError } from "../api/client";
import type { BloodGroup, Gender } from "../types";
import styles from "./BookOP.module.css";

const MOBILE_REGEX = /^[6-9]\d{9}$/;

const GENDERS: Gender[] = ["Male", "Female", "Other", "Prefer not to say"];
const BLOOD_GROUPS: BloodGroup[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"];

interface FormValues {
  name: string;
  mobile: string;
  address: string;
  age: string;
  gender: string;
  bloodGroup: string;
  occupation: string;
  preferredDate: string;
  dentalProblem: string;
  previousTreatment: string;
  consent: boolean;
}

const INITIAL_VALUES: FormValues = {
  name: "",
  mobile: "",
  address: "",
  age: "",
  gender: "",
  bloodGroup: "",
  occupation: "",
  preferredDate: "",
  dentalProblem: "",
  previousTreatment: "",
  consent: false,
};

type FieldErrors = Partial<Record<keyof FormValues, string>>;

function FormSection({ number, title, children }: { number: number; title: string; children: ReactNode }) {
  return (
    <fieldset className={styles.formSection}>
      <legend className={styles.sectionHead}>
        <span className={styles.sectionNumber}>{number}</span>
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

export default function BookOP() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  // Details typed into the short form on the Contact page (step 1) arrive via router state.
  const prefill = (location.state as { prefill?: Partial<Pick<FormValues, "name" | "mobile" | "preferredDate">> } | null)?.prefill;
  const [values, setValues] = useState<FormValues>({ ...INITIAL_VALUES, ...prefill });
  // Only used when "Other" is chosen from the occupation dropdown.
  const [otherOccupation, setOtherOccupation] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState<boolean | null>(null);

  useEffect(() => {
    setIsOpen(isClinicOpenNow(clinicHoursSchedule));
  }, []);

  const today = getTodaysHours(clinicHoursSchedule);

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function validate(): boolean {
    const next: FieldErrors = {};
    if (values.name.trim().length < 2) next.name = t("bookOp.errors.name");
    if (!MOBILE_REGEX.test(values.mobile.trim())) next.mobile = t("bookOp.errors.mobile");
    if (values.address.trim().length < 5) next.address = t("bookOp.errors.address");
    if (values.age && (Number(values.age) < 0 || Number(values.age) > 120)) next.age = t("bookOp.errors.age");
    if (!values.occupation) {
      next.occupation = t("bookOp.errors.occupation");
    } else if (values.occupation === OTHER_OCCUPATION && !otherOccupation.trim()) {
      next.occupation = t("bookOp.errors.occupation");
    }
    if (!values.consent) next.consent = t("bookOp.errors.consent");
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const result = await submitBookOp({
        name: values.name.trim(),
        mobile: values.mobile.trim(),
        address: values.address.trim(),
        age: values.age || undefined,
        gender: values.gender || undefined,
        bloodGroup: values.bloodGroup || undefined,
        occupation: values.occupation === OTHER_OCCUPATION ? otherOccupation.trim() : values.occupation,
        preferredDate: values.preferredDate || undefined,
        dentalProblem: values.dentalProblem.trim() || undefined,
        previousTreatment: values.previousTreatment.trim() || undefined,
        consent: values.consent,
      });
      navigate("/op-confirmation", { state: { result } });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.details?.length) {
          const fieldErrors: FieldErrors = {};
          for (const detail of err.details) {
            fieldErrors[detail.path as keyof FormValues] = detail.message;
          }
          setErrors((prev) => ({ ...prev, ...fieldErrors }));
        }
        setSubmitError(err.message);
      } else {
        setSubmitError(t("bookOp.errors.generic"));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <PageMeta title={t("bookOp.meta.title")} description={t("bookOp.meta.description")} path="/book-op" />

      {/* ---------- Header ---------- */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroDots} aria-hidden="true" />
        <div className={`container ${styles.heroText}`}>
          {prefill && (
            <span className={`${styles.stepChip} ${styles.rise}`} style={{ "--d": "0ms" } as CSSProperties}>
              {t("bookOp.stepLabel")}
            </span>
          )}
          <span className={`eyebrow ${styles.heroEyebrow} ${styles.rise}`} style={{ "--d": "80ms" } as CSSProperties}>
            {t("bookOp.eyebrow")}
          </span>
          <h1 className={`${styles.heroTitle} ${styles.rise}`} style={{ "--d": "180ms" } as CSSProperties}>
            {t("bookOp.title")}
          </h1>
          <p className={`${styles.heroSubtitle} ${styles.rise}`} style={{ "--d": "300ms" } as CSSProperties}>
            {t("bookOp.subtitle")}
          </p>
        </div>
      </section>

      {/* ---------- Form + info panel ---------- */}
      <section className={styles.main}>
        <div className={`container ${styles.grid}`}>
          <aside className={`${styles.aside} ${styles.rise}`} style={{ "--d": "400ms" } as CSSProperties}>
            <div className={styles.asideGlow} aria-hidden="true" />
            <span className={styles.asideBadge}>
              <CalendarCheckIcon width={16} height={16} />
              {t("common.bookOp")}
            </span>
            <h2 className={styles.asideTitle}>{clinicInfo.name}</h2>
            <p className={styles.asideLocation}>
              <MapPinIcon width={18} height={18} />
              {clinicInfo.location}
            </p>
            <p className={styles.asideExplain}>{t("contact.book.explain")}</p>

            {isOpen !== null && (
              <div className={styles.status}>
                <span className={`${styles.statusDot} ${isOpen ? "" : styles.statusClosed}`} aria-hidden="true" />
                <strong>{isOpen ? t("location.openNow") : t("location.closedNow")}</strong>
                {today && <span className={styles.statusHours}>{formatHoursRange(today)}</span>}
              </div>
            )}

            <a href={clinicInfo.phoneHref} className={styles.asideLink}>
              <span className={styles.asideLinkIcon}>
                <PhoneIcon width={18} height={18} />
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
              className={styles.asideLink}
            >
              <span className={styles.asideLinkIcon}>
                <WhatsAppIcon width={18} height={18} />
              </span>
              <span>
                <small>{t("contact.reachWhatsappSub")}</small>
                <strong>{t("common.whatsapp")}</strong>
              </span>
            </a>
          </aside>

          <form
            onSubmit={handleSubmit}
            noValidate
            className={`${styles.form} ${styles.rise}`}
            style={{ "--d": "300ms" } as CSSProperties}
          >
            {submitError && (
              <div className="alert alert-error" role="alert">
                {submitError}
              </div>
            )}

            <FormSection number={1} title={t("bookOp.sections.personal")}>
              <div className="field">
                <label htmlFor="name">
                  {t("bookOp.fields.name")} <span className="required">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  value={values.name}
                  onChange={(e) => update("name", e.target.value)}
                  className={errors.name ? "has-error" : ""}
                  aria-invalid={Boolean(errors.name)}
                />
                {errors.name && <p className="field-error">{errors.name}</p>}
              </div>

              <div className="form-row">
                <div className="field">
                  <label htmlFor="mobile">
                    {t("bookOp.fields.mobile")} <span className="required">*</span>
                  </label>
                  <input
                    id="mobile"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    maxLength={10}
                    value={values.mobile}
                    onChange={(e) => update("mobile", e.target.value.replace(/[^0-9]/g, ""))}
                    className={errors.mobile ? "has-error" : ""}
                    aria-invalid={Boolean(errors.mobile)}
                  />
                  {errors.mobile && <p className="field-error">{errors.mobile}</p>}
                </div>

                <div className="field">
                  <label htmlFor="age">{t("bookOp.fields.age")}</label>
                  <input
                    id="age"
                    type="number"
                    min={0}
                    max={120}
                    value={values.age}
                    onChange={(e) => update("age", e.target.value)}
                    className={errors.age ? "has-error" : ""}
                  />
                  {errors.age && <p className="field-error">{errors.age}</p>}
                </div>
              </div>

              <div className="form-row">
                <div className="field">
                  <label htmlFor="gender">{t("bookOp.fields.gender")}</label>
                  <select id="gender" value={values.gender} onChange={(e) => update("gender", e.target.value)}>
                    <option value="">{t("bookOp.fields.selectGender")}</option>
                    {GENDERS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="bloodGroup">{t("bookOp.fields.bloodGroup")}</label>
                  <select
                    id="bloodGroup"
                    value={values.bloodGroup}
                    onChange={(e) => update("bloodGroup", e.target.value)}
                  >
                    <option value="">{t("bookOp.fields.selectBloodGroup")}</option>
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="field">
                <label htmlFor="occupation">
                  {t("bookOp.fields.occupation")} <span className="required">*</span>
                </label>
                <select
                  id="occupation"
                  value={values.occupation}
                  onChange={(e) => {
                    update("occupation", e.target.value);
                    if (e.target.value !== OTHER_OCCUPATION) setOtherOccupation("");
                  }}
                  className={errors.occupation ? "has-error" : ""}
                  aria-invalid={Boolean(errors.occupation)}
                >
                  <option value="">{t("bookOp.fields.selectOccupation")}</option>
                  {OCCUPATIONS.map((item) => (
                    <option key={item.key} value={item.value}>
                      {t(`bookOp.occupations.${item.key}`, item.value)}
                    </option>
                  ))}
                </select>
                {values.occupation === OTHER_OCCUPATION && (
                  <input
                    id="occupation-other"
                    type="text"
                    maxLength={100}
                    style={{ marginTop: 10 }}
                    placeholder={t("bookOp.fields.occupationOther")}
                    aria-label={t("bookOp.fields.occupationOther")}
                    value={otherOccupation}
                    onChange={(e) => setOtherOccupation(e.target.value)}
                    className={errors.occupation ? "has-error" : ""}
                    aria-invalid={Boolean(errors.occupation)}
                  />
                )}
                {errors.occupation && <p className="field-error">{errors.occupation}</p>}
              </div>

              <div className="field">
                <label htmlFor="address">
                  {t("bookOp.fields.address")} <span className="required">*</span>
                </label>
                <textarea
                  id="address"
                  autoComplete="street-address"
                  value={values.address}
                  onChange={(e) => update("address", e.target.value)}
                  className={errors.address ? "has-error" : ""}
                  aria-invalid={Boolean(errors.address)}
                />
                {errors.address && <p className="field-error">{errors.address}</p>}
              </div>
            </FormSection>

            <FormSection number={2} title={t("bookOp.sections.visit")}>
              <div className="field">
                <label htmlFor="preferredDate">{t("bookOp.fields.preferredDate")}</label>
                <input
                  id="preferredDate"
                  type="date"
                  value={values.preferredDate}
                  onChange={(e) => update("preferredDate", e.target.value)}
                  min={new Date().toISOString().slice(0, 10)}
                />
              </div>

              <div className="field">
                <label htmlFor="dentalProblem">{t("bookOp.fields.dentalProblem")}</label>
                <textarea
                  id="dentalProblem"
                  value={values.dentalProblem}
                  onChange={(e) => update("dentalProblem", e.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="previousTreatment">{t("bookOp.fields.previousTreatment")}</label>
                <textarea
                  id="previousTreatment"
                  value={values.previousTreatment}
                  onChange={(e) => update("previousTreatment", e.target.value)}
                />
              </div>
            </FormSection>

            <div className={styles.consentBox}>
              <label className={styles.consentLabel}>
                <input
                  type="checkbox"
                  checked={values.consent}
                  onChange={(e) => update("consent", e.target.checked)}
                  aria-invalid={Boolean(errors.consent)}
                />
                <span>
                  <ShieldCheckIcon width={18} height={18} className={styles.consentIcon} />
                  {t("bookOp.consent")}
                </span>
              </label>
              {errors.consent && <p className="field-error">{errors.consent}</p>}
            </div>

            <button type="submit" className={styles.submit} disabled={isSubmitting}>
              <span className={styles.submitRing} aria-hidden="true" />
              {isSubmitting ? t("common.submitting") : t("bookOp.submit")}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
