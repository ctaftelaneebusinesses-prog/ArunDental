import type { AppointmentStatus, EnquiryStatus } from "../../types";

const APPOINTMENT_CLASS: Record<AppointmentStatus, string> = {
  Pending: "badge-pending",
  Confirmed: "badge-confirmed",
  Arrived: "badge-arrived",
  Completed: "badge-completed",
  Cancelled: "badge-cancelled",
};

const ENQUIRY_CLASS: Record<EnquiryStatus, string> = {
  New: "badge-new",
  Contacted: "badge-contacted",
  FollowUp: "badge-followup",
  Completed: "badge-completed",
};

const ENQUIRY_LABEL: Record<EnquiryStatus, string> = {
  New: "New",
  Contacted: "Contacted",
  FollowUp: "Follow-up",
  Completed: "Completed",
};

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  return <span className={`badge ${APPOINTMENT_CLASS[status]}`}>{status}</span>;
}

export function EnquiryStatusBadge({ status }: { status: EnquiryStatus }) {
  return <span className={`badge ${ENQUIRY_CLASS[status]}`}>{ENQUIRY_LABEL[status]}</span>;
}
