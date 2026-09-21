import { ChangeEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { UploadIcon } from "./icons/DentalIcons";
import { CameraCapture } from "./CameraCapture";

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface PhotoUploadProps {
  value: File | null;
  onChange: (file: File | null) => void;
  error?: string;
}

export function PhotoUpload({ value, onChange, error }: PhotoUploadProps) {
  const { t } = useTranslation();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      onChange(null);
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      onChange(null);
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      onChange(null);
      return;
    }
    onChange(file);
  }

  return (
    <div className="field">
      <label htmlFor="patient-photo">
        {t("bookOp.photo.label")} <span className="required">*</span>
      </label>
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        {previewUrl && (
          <img
            src={previewUrl}
            alt="Selected patient photo preview"
            width={72}
            height={72}
            style={{ borderRadius: 12, objectFit: "cover", border: "1px solid var(--color-border)" }}
          />
        )}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <label htmlFor="patient-photo" className="btn btn-secondary btn-sm" style={{ cursor: "pointer" }}>
            <UploadIcon width={16} height={16} />
            {value ? t("bookOp.photo.changeButton") : t("bookOp.photo.uploadButton")}
          </label>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowCamera(true)}>
            {t("bookOp.photo.captureButton")}
          </button>
        </div>
      </div>
      <input
        id="patient-photo"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="visually-hidden"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? "patient-photo-error" : "patient-photo-hint"}
      />
      <p id="patient-photo-hint" className="field-hint">
        {t("bookOp.photo.hint")}
      </p>
      {error && (
        <p id="patient-photo-error" className="field-error">
          {error}
        </p>
      )}
      {showCamera && (
        <CameraCapture
          onCapture={(file) => onChange(file)}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}
