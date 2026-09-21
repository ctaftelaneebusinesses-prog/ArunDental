import { CloseIcon } from "../icons/DentalIcons";
import { ExamLetterhead } from "./ExamSheet";
import { formatDisplayDate, type ExamValues } from "./examForm";
import type { ExamPhoto } from "./examPhotos";
import sheetStyles from "./ExamSheet.module.css";
import styles from "./ExamPhotosPage.module.css";

interface ExamPhotosPageProps {
  values: ExamValues;
  photos: ExamPhoto[];
  // Present = editable preview on screen. Absent = read-only version used for printing.
  onCaptionChange?: (id: string, caption: string) => void;
  onRemove?: (id: string) => void;
}

// Page 2 of the examination form: the photographs the doctor chose to attach.
export function ExamPhotosPage({ values, photos, onCaptionChange, onRemove }: ExamPhotosPageProps) {
  const editable = Boolean(onCaptionChange);

  return (
    <div className={`${sheetStyles.sheet} ${styles.page}`}>
      <ExamLetterhead />

      <h2 className={sheetStyles.title}>PATIENT PHOTOGRAPHS</h2>

      <p className={styles.patientLine}>
        <span>
          <strong>Name:</strong> {values.name || "—"}
        </span>
        <span>
          <strong>OP No.:</strong> {values.opNumber || "—"}
        </span>
        <span>
          <strong>Date:</strong> {formatDisplayDate(values.date)}
        </span>
      </p>

      <div className={styles.grid}>
        {photos.map((photo, index) => (
          <figure key={photo.id} className={styles.figure}>
            <div className={styles.frame}>
              <img src={photo.src} alt={photo.caption || `Photograph ${index + 1}`} className={styles.image} />
              {editable && onRemove && (
                <button type="button" className={styles.remove} onClick={() => onRemove(photo.id)} aria-label={`Remove photograph ${index + 1}`}>
                  <CloseIcon width={16} height={16} />
                </button>
              )}
            </div>
            {editable && onCaptionChange ? (
              <input
                className={styles.captionInput}
                value={photo.caption}
                placeholder={`Caption for photo ${index + 1} (optional)`}
                maxLength={120}
                aria-label={`Caption for photograph ${index + 1}`}
                onChange={(e) => onCaptionChange(photo.id, e.target.value)}
              />
            ) : (
              <figcaption className={styles.caption}>{photo.caption}</figcaption>
            )}
          </figure>
        ))}
      </div>
    </div>
  );
}
