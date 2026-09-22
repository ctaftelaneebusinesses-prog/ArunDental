import type { AppointmentStatus } from "../../types";
import styles from "./StatusSelect.module.css";

const STATUS_OPTIONS: AppointmentStatus[] = ["Pending", "Confirmed", "Arrived", "Completed", "Cancelled"];

interface StatusSelectProps {
  value: AppointmentStatus;
  opNumber: string;
  disabled?: boolean;
  onChange: (status: AppointmentStatus) => void;
}

/**
 * Lets the admin set an appointment's status directly, instead of only being
 * able to step forward one stage at a time — so it's clear up front what the
 * later stages are, and any stage can be picked (e.g. to correct a mistake).
 */
export function StatusSelect({ value, opNumber, disabled, onChange }: StatusSelectProps) {
  return (
    <select
      className={styles.select}
      value={value}
      disabled={disabled}
      aria-label={`Change status for ${opNumber}`}
      onChange={(event) => {
        const next = event.target.value as AppointmentStatus;
        if (next === value) return;
        if (next === "Cancelled" && !window.confirm(`Cancel appointment ${opNumber}?`)) {
          event.target.value = value; // snap back until the parent state actually changes
          return;
        }
        onChange(next);
      }}
    >
      {STATUS_OPTIONS.map((status) => (
        <option key={status} value={status}>
          {status}
        </option>
      ))}
    </select>
  );
}
