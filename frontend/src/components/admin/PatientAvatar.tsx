import { patientPhotoUrl } from "../../api/patients";
import styles from "./PatientAvatar.module.css";

interface PatientAvatarProps {
  patientId: string;
  name: string;
  hasPhoto: boolean;
  size: number;
  // Rounded square (profile views) instead of a circle (table rows).
  square?: boolean;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0].charAt(0);
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : "";
  return (first + last).toUpperCase();
}

// Photos are optional now, so patients booked online usually have none.
export function PatientAvatar({ patientId, name, hasPhoto, size, square = false }: PatientAvatarProps) {
  const radius = square ? Math.round(size * 0.16) : "50%";

  if (hasPhoto) {
    return (
      <img
        src={patientPhotoUrl(patientId)}
        alt={`Photo of ${name}`}
        loading="lazy"
        className={styles.photo}
        style={{ width: size, height: size, borderRadius: radius }}
      />
    );
  }

  return (
    <span
      className={styles.initials}
      style={{ width: size, height: size, borderRadius: radius, fontSize: Math.round(size * 0.36) }}
      role="img"
      aria-label={`${name} (no photo)`}
    >
      {initials(name)}
    </span>
  );
}
