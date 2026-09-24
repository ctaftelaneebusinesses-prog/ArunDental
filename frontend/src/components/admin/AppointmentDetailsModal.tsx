import { patientPhotoUrl } from "../../api/patients";
import { PatientAvatar } from "./PatientAvatar";
import type { AppointmentStatus, AppointmentSummary } from "../../types";
import { formatDateTime, opConfirmationText, telHref, whatsappHref } from "../../utils/contactLinks";
import { Modal } from "../Modal";
import { PhoneIcon, WhatsAppIcon } from "../icons/DentalIcons";
import { AppointmentStatusBadge } from "./StatusBadge";
import { StatusSelect } from "./StatusSelect";
import { FeesManager } from "./FeesManager";
import styles from "./PatientsPanel.module.css";

interface Props {
  appointment: AppointmentSummary;
  busy: boolean;
  onClose: () => void;
  onStatusChange: (id: string, status: AppointmentStatus) => void;
  onFeesChanged?: () => void;
}

export function AppointmentDetailsModal({ appointment, busy, onClose, onStatusChange, onFeesChanged }: Props) {
  const photoUrl = patientPhotoUrl(appointment.patientId);
  const whatsappText = opConfirmationText(appointment);

  return (
    <Modal title={`Appointment ${appointment.opNumber}`} onClose={onClose} wide>
      <div className={styles.profileHeader}>
        {appointment.hasPhoto ? (
          <a href={photoUrl} target="_blank" rel="noreferrer" title="Open full-size photo">
            <img src={photoUrl} alt={`Photo of ${appointment.patientName}`} className={styles.photoLarge} />
          </a>
        ) : (
          <PatientAvatar patientId={appointment.patientId} name={appointment.patientName} hasPhoto={false} size={104} square />
        )}
        <div>
          <h3 className={styles.name}>{appointment.patientName}</h3>
          <p className={styles.opNumber}>{appointment.opNumber}</p>
          <AppointmentStatusBadge status={appointment.status} />
        </div>
      </div>

      <div className={styles.quickActions}>
        <a href={telHref(appointment.mobile)} className="btn btn-secondary btn-sm">
          <PhoneIcon width={16} height={16} /> Call {appointment.mobile}
        </a>
        <a
          href={whatsappHref(appointment.mobile, whatsappText)}
          target="_blank"
          rel="noreferrer"
          className="btn btn-secondary btn-sm"
        >
          <WhatsAppIcon width={16} height={16} /> WhatsApp
        </a>
        <StatusSelect
          value={appointment.status}
          opNumber={appointment.opNumber}
          disabled={busy}
          onChange={(status) => onStatusChange(appointment.id, status)}
        />
      </div>

      <dl className={styles.detailGrid}>
        <div>
          <dt>Appointment Date</dt>
          <dd>{appointment.appointmentDate}</dd>
        </div>
        <div>
          <dt>Preferred Time</dt>
          <dd>{appointment.appointmentTime || "Not specified"}</dd>
        </div>
        <div>
          <dt>Mobile</dt>
          <dd>{appointment.mobile}</dd>
        </div>
        <div>
          <dt>Booked On</dt>
          <dd>{formatDateTime(appointment.createdAt)}</dd>
        </div>
        <div>
          <dt>Age</dt>
          <dd>{appointment.age ?? "Not specified"}</dd>
        </div>
        <div>
          <dt>Gender</dt>
          <dd>{appointment.gender ?? "Not specified"}</dd>
        </div>
        <div>
          <dt>Blood Group</dt>
          <dd>{appointment.bloodGroup ?? "Not specified"}</dd>
        </div>
        <div>
          <dt>Occupation</dt>
          <dd>{appointment.occupation || "Not specified"}</dd>
        </div>
        <div>
          <dt>Sitting</dt>
          <dd>{appointment.sittingCount}</dd>
        </div>
        <div className={styles.fullWidth}>
          <dt>Address</dt>
          <dd>{appointment.address}</dd>
        </div>
        <div className={styles.fullWidth}>
          <dt>Dental Problem</dt>
          <dd>{appointment.dentalProblem || "Not provided"}</dd>
        </div>
        <div className={styles.fullWidth}>
          <dt>Previous Treatment</dt>
          <dd>{appointment.previousTreatment || "Not provided"}</dd>
        </div>
      </dl>

      <h4 className={styles.historyHeading}>Fees &amp; Payments</h4>
      <FeesManager
        appointmentId={appointment.id}
        opNumber={appointment.opNumber}
        fees={appointment}
        onChanged={onFeesChanged}
      />
    </Modal>
  );
}
