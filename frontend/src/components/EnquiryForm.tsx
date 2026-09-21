import { FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { submitEnquiry } from "../api/enquiries";
import { ApiError } from "../api/client";

const MOBILE_REGEX = /^[6-9]\d{9}$/;

interface FormState {
  name: string;
  mobile: string;
  message: string;
  callbackTime: string;
}

const INITIAL_STATE: FormState = { name: "", mobile: "", message: "", callbackTime: "" };

export function EnquiryForm({ prefillService }: { prefillService?: string }) {
  const { t } = useTranslation();
  const [values, setValues] = useState<FormState>({
    ...INITIAL_STATE,
    message: prefillService ? `${t("services.enquireAbout")}: ${prefillService}` : "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  function validate(): boolean {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    if (values.name.trim().length < 2) nextErrors.name = t("enquiryForm.errors.name");
    if (!MOBILE_REGEX.test(values.mobile.trim())) nextErrors.mobile = t("enquiryForm.errors.mobile");
    if (values.message.trim().length < 5) nextErrors.message = t("enquiryForm.errors.message");
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await submitEnquiry({
        name: values.name.trim(),
        mobile: values.mobile.trim(),
        message: values.message.trim(),
        callbackTime: values.callbackTime.trim() || undefined,
      });
      setIsSubmitted(true);
      setValues(INITIAL_STATE);
      setErrors({});
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : t("enquiryForm.errors.generic"));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="alert alert-success" role="status">
        {t("enquiryForm.successMessage")}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {submitError && (
        <div className="alert alert-error" role="alert">
          {submitError}
        </div>
      )}

      <div className="field">
        <label htmlFor="enquiry-name">
          {t("enquiryForm.fields.name")} <span className="required">*</span>
        </label>
        <input
          id="enquiry-name"
          type="text"
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          className={errors.name ? "has-error" : ""}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "enquiry-name-error" : undefined}
        />
        {errors.name && (
          <p id="enquiry-name-error" className="field-error">
            {errors.name}
          </p>
        )}
      </div>

      <div className="field">
        <label htmlFor="enquiry-mobile">
          {t("enquiryForm.fields.mobile")} <span className="required">*</span>
        </label>
        <input
          id="enquiry-mobile"
          type="tel"
          inputMode="numeric"
          value={values.mobile}
          onChange={(e) => setValues((v) => ({ ...v, mobile: e.target.value.replace(/[^0-9]/g, "") }))}
          className={errors.mobile ? "has-error" : ""}
          aria-invalid={Boolean(errors.mobile)}
          aria-describedby={errors.mobile ? "enquiry-mobile-error" : undefined}
          maxLength={10}
        />
        {errors.mobile && (
          <p id="enquiry-mobile-error" className="field-error">
            {errors.mobile}
          </p>
        )}
      </div>

      <div className="field">
        <label htmlFor="enquiry-message">
          {t("enquiryForm.fields.message")} <span className="required">*</span>
        </label>
        <textarea
          id="enquiry-message"
          value={values.message}
          onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
          className={errors.message ? "has-error" : ""}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "enquiry-message-error" : undefined}
        />
        {errors.message && (
          <p id="enquiry-message-error" className="field-error">
            {errors.message}
          </p>
        )}
      </div>

      <div className="field">
        <label htmlFor="enquiry-callback">{t("enquiryForm.fields.callbackTime")}</label>
        <input
          id="enquiry-callback"
          type="text"
          placeholder={t("enquiryForm.fields.callbackPlaceholder")}
          value={values.callbackTime}
          onChange={(e) => setValues((v) => ({ ...v, callbackTime: e.target.value }))}
        />
      </div>

      <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
        {isSubmitting ? t("common.submitting") : t("enquiryForm.submit")}
      </button>
    </form>
  );
}
