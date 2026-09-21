import { FormEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PageMeta } from "../components/PageMeta";
import { PhotoUpload } from "../components/PhotoUpload";
import { submitBookOp } from "../api/appointments";
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
  preferredDate: string;
  preferredTime: string;
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
  preferredDate: "",
  preferredTime: "",
  dentalProblem: "",
  previousTreatment: "",
  consent: false,
};

type FieldErrors = Partial<Record<keyof FormValues | "photo", string>>;

export default function BookOP() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  // Details typed into the short form on the Contact page (step 1) arrive via router state.
  const prefill = (location.state as { prefill?: Partial<Pick<FormValues, "name" | "mobile" | "preferredDate">> } | null)?.prefill;
  const [values, setValues] = useState<FormValues>({ ...INITIAL_VALUES, ...prefill });
  const [photo, setPhoto] = useState<File | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function validate(): boolean {
    const next: FieldErrors = {};
    if (values.name.trim().length < 2) next.name = t("bookOp.errors.name");
    if (!MOBILE_REGEX.test(values.mobile.trim())) next.mobile = t("bookOp.errors.mobile");
    if (values.address.trim().length < 5) next.address = t("bookOp.errors.address");
    if (!photo) next.photo = t("bookOp.errors.photo");
    if (values.age && (Number(values.age) < 0 || Number(values.age) > 120)) next.age = t("bookOp.errors.age");
    if (!values.consent) next.consent = t("bookOp.errors.consent");
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitError(null);
    if (!validate() || !photo) return;

    setIsSubmitting(true);
    try {
      const result = await submitBookOp({
        photo,
        name: values.name.trim(),
        mobile: values.mobile.trim(),
        address: values.address.trim(),
        age: values.age || undefined,
        gender: values.gender || undefined,
        bloodGroup: values.bloodGroup || undefined,
        preferredDate: values.preferredDate || undefined,
        preferredTime: values.preferredTime || undefined,
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

      <section className={styles.section}>
        <div className={`container ${styles.wrap}`}>
          <div className="section-heading">
            {prefill && <span className={styles.stepChip}>{t("bookOp.stepLabel")}</span>}
            <span className="eyebrow">{t("bookOp.eyebrow")}</span>
            <h1>{t("bookOp.title")}</h1>
            <p>{t("bookOp.subtitle")}</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className={`card ${styles.form}`}>
            {submitError && (
              <div className="alert alert-error" role="alert">
                {submitError}
              </div>
            )}

            <PhotoUpload value={photo} onChange={setPhoto} error={errors.photo} />

            <div className="field">
              <label htmlFor="name">
                {t("bookOp.fields.name")} <span className="required">*</span>
              </label>
              <input
                id="name"
                type="text"
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

            <div className="field">
              <label htmlFor="address">
                {t("bookOp.fields.address")} <span className="required">*</span>
              </label>
              <textarea
                id="address"
                value={values.address}
                onChange={(e) => update("address", e.target.value)}
                className={errors.address ? "has-error" : ""}
                aria-invalid={Boolean(errors.address)}
              />
              {errors.address && <p className="field-error">{errors.address}</p>}
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

            <div className="form-row">
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
                <label htmlFor="preferredTime">{t("bookOp.fields.preferredTime")}</label>
                <input
                  id="preferredTime"
                  type="time"
                  value={values.preferredTime}
                  onChange={(e) => update("preferredTime", e.target.value)}
                />
              </div>
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

            <div className={styles.consentBox}>
              <label className={styles.consentLabel}>
                <input
                  type="checkbox"
                  checked={values.consent}
                  onChange={(e) => update("consent", e.target.checked)}
                  aria-invalid={Boolean(errors.consent)}
                />
                <span>{t("bookOp.consent")}</span>
              </label>
              {errors.consent && <p className="field-error">{errors.consent}</p>}
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
              {isSubmitting ? t("common.submitting") : t("bookOp.submit")}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
