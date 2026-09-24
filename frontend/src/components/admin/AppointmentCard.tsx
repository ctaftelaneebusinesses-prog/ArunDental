import type { CSSProperties } from "react";
import type { AppointmentStatus, AppointmentSummary } from "../../types";
import { formatTime } from "../../utils/clinicHours";
import { opConfirmationText, telHref, whatsappHref } from "../../utils/contactLinks";
import { CalendarCheckIcon, ClockIcon, PhoneIcon, ToothIcon, WhatsAppIcon } from "../icons/DentalIcons";
import { EyeIcon, TrashIcon } from "./AdminIcons";
import { FeeSummaryCell } from "./FeeSummaryCell";
import { PatientAvatar } from "./PatientAvatar";
import { SittingStepper } from "./SittingStepper";
import { StatusSelect } from "./StatusSelect";
import styles from "./AppointmentCard.module.css";

// The happy path an appointment moves along. "Cancelled" sits outside it.
const TRACK: AppointmentStatus[] = ["Pending", "Confirmed", "Arrived", "Completed"];
const MAX_SITTING_DOTS = 8;

function StatusTrack({ status }: { status: AppointmentStatus }) {
  if (status === "Cancelled") {
    return <span className={styles.cancelled}>Cancelled</span>;
  }
  const current = TRACK.indexOf(status);
  return (
    <ol className={styles.track} aria-label={`Progress: ${status}, step ${current + 1} of ${TRACK.length}`}>
      {TRACK.map((step, index) => (
        <li
          key={step}
          className={`${styles.step} ${index < current ? styles.stepDone : ""} ${index === current ? styles.stepNow : ""}`}
        >
          <span className={styles.dot} aria-hidden="true" />
          <span className={styles.stepLabel}>{step}</span>
        </li>
      ))}
    </ol>
  );
}

// "2026-09-23" → "Wed, 23 Sept 2026" (parsed as a local date; new Date(iso) would be UTC).
function formatVisitDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return iso;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface AppointmentCardProps {
  appointment: AppointmentSummary;
  index: number;
  busy: boolean;
  onStatusChange: (id: string, status: AppointmentStatus) => void;
  onSittingChange: (id: string, count: number) => void;
  onView: () => void;
  onManageFees: () => void;
  onReschedule: () => void;
  onDelete: () => void;
  // Jumps to the Examination Form pre-filled for this patient.
  onExamine?: () => void;
}

export function AppointmentCard({
  appointment,
  index,
  busy,
  onStatusChange,
  onSittingChange,
  onView,
  onManageFees,
  onReschedule,
  onDelete,
  onExamine,
}: AppointmentCardProps) {
  const { status } = appointment;
  const isToday = appointment.appointmentDate === new Date().toLocaleDateString("en-CA");
  const ageGender = [appointment.age ? `${appointment.age} yrs` : null, appointment.gender].filter(Boolean).join(" · ");
  const canReschedule = status === "Pending" || status === "Confirmed";

  return (
    <li
      className={`${styles.card} ${styles[`s_${status}`]}`}
      style={{ "--i": Math.min(index, 8) } as CSSProperties}
    >
      {/* ---------- Patient ---------- */}
      <div className={`${styles.zone} ${styles.identity}`}>
        <span className={styles.label}>Patient</span>
        <div className={styles.person}>
          <PatientAvatar
            patientId={appointment.patientId}
            name={appointment.patientName}
            hasPhoto={appointment.hasPhoto}
            size={52}
          />
          <div className={styles.who}>
            <div className={styles.nameRow}>
              <h3 className={styles.name}>{appointment.patientName}</h3>
              {status === "Pending" && <span className={styles.newPill}>New</span>}
            </div>
            <div className={styles.meta}>
              <span className={styles.opChip}>{appointment.opNumber}</span>
              {ageGender && <span>{ageGender}</span>}
            </div>
            <a className={styles.phone} href={telHref(appointment.mobile)}>
              <PhoneIcon width={14} height={14} />
              {appointment.mobile}
            </a>
          </div>
        </div>
      </div>

      {/* ---------- Visit ---------- */}
      <div className={`${styles.zone} ${styles.visit}`}>
        <span className={styles.label}>Visit</span>
        <div className={styles.when}>
          <CalendarCheckIcon width={16} height={16} />
          <span>{formatVisitDate(appointment.appointmentDate)}</span>
          {isToday && <span className={styles.todayChip}>Today</span>}
        </div>
        <div className={styles.time}>
          <ClockIcon width={15} height={15} />
          {appointment.appointmentTime ? formatTime(appointment.appointmentTime) : "Time not set"}
        </div>
        <p className={styles.problem}>
          <span>{appointment.dentalProblem || "No complaint noted"}</span>
        </p>
      </div>

      {/* ---------- Sitting ---------- */}
      <div className={`${styles.zone} ${styles.sitting}`}>
        <span className={styles.label}>Sitting</span>
        <div className={styles.sittingBody}>
          <SittingStepper
            value={appointment.sittingCount}
            opNumber={appointment.opNumber}
            disabled={busy}
            onChange={(count) => onSittingChange(appointment.id, count)}
          />
          <span className={styles.sittingDots} aria-hidden="true">
            {Array.from({ length: Math.min(appointment.sittingCount, MAX_SITTING_DOTS) }).map((_, i) => (
              <i key={i} />
            ))}
            {appointment.sittingCount > MAX_SITTING_DOTS && <b>+{appointment.sittingCount - MAX_SITTING_DOTS}</b>}
          </span>
        </div>
      </div>

      {/* ---------- Fees ---------- */}
      <div className={`${styles.zone} ${styles.fees}`}>
        <span className={styles.label}>Fees</span>
        <FeeSummaryCell fees={appointment} opNumber={appointment.opNumber} onManage={onManageFees} />
      </div>

      {/* ---------- Status + actions ---------- */}
      <div className={`${styles.zone} ${styles.status}`}>
        <span className={styles.label}>Status</span>
        <StatusTrack status={status} />
        <div className={styles.statusSelect}>
          <StatusSelect
            value={status}
            opNumber={appointment.opNumber}
            disabled={busy}
            onChange={(next) => onStatusChange(appointment.id, next)}
          />
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.act}
            title="View details"
            aria-label={`View details for ${appointment.opNumber}`}
            onClick={onView}
          >
            <EyeIcon width={17} height={17} />
            <span className={styles.actLabel}>View</span>
          </button>

          <a
            href={whatsappHref(appointment.mobile, opConfirmationText(appointment))}
            target="_blank"
            rel="noreferrer"
            className={`${styles.act} ${styles.actWhatsapp}`}
            title="Send OP confirmation on WhatsApp"
            aria-label={`Send OP confirmation to ${appointment.patientName} on WhatsApp`}
          >
            <WhatsAppIcon width={17} height={17} />
            <span className={styles.actLabel}>WhatsApp</span>
          </a>

          {onExamine && (
            <button
              type="button"
              className={styles.act}
              title="Open Examination Form for this patient"
              aria-label={`Open Examination Form for ${appointment.patientName}`}
              onClick={onExamine}
            >
              <ToothIcon width={17} height={17} />
              <span className={styles.actLabel}>Exam</span>
            </button>
          )}

          {canReschedule && (
            <button
              type="button"
              className={styles.act}
              title="Reschedule"
              aria-label={`Reschedule ${appointment.opNumber}`}
              onClick={onReschedule}
            >
              <ClockIcon width={17} height={17} />
              <span className={styles.actLabel}>Reschedule</span>
            </button>
          )}

          <button
            type="button"
            className={`${styles.act} ${styles.actDanger}`}
            title="Delete appointment"
            aria-label={`Delete appointment ${appointment.opNumber}`}
            disabled={busy}
            onClick={onDelete}
          >
            <TrashIcon width={17} height={17} />
            <span className={styles.actLabel}>Delete</span>
          </button>
        </div>
      </div>
    </li>
  );
}
