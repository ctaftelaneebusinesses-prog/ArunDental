import type { AppointmentStatus } from "../../types";

const APPOINTMENT_CLASS: Record<AppointmentStatus, string> = {
  Pending: "badge-pending",
  Confirmed: "badge-confirmed",
  Arrived: "badge-arrived",
  Completed: "badge-completed",
  Cancelled: "badge-cancelled",
};

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  return <span className={`badge ${APPOINTMENT_CLASS[status]}`}>{status}</span>;
}

