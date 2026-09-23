import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  fetchAppointments,
  rescheduleAppointment,
  updateAppointmentPaymentStatus,
  updateAppointmentSitting,
  updateAppointmentStatus,
} from "../../api/appointments";
import { ApiError } from "../../api/client";
import { PatientAvatar } from "./PatientAvatar";
import type { AppointmentStatus, AppointmentSummary, PaymentStatus } from "../../types";
import { AppointmentStatusBadge } from "./StatusBadge";
import { StatusSelect } from "./StatusSelect";
import { SittingStepper } from "./SittingStepper";
import { PaymentStatusSelect } from "./PaymentStatusSelect";
import { Modal } from "../Modal";
import { AppointmentDetailsModal } from "./AppointmentDetailsModal";
import { EyeIcon } from "./AdminIcons";
import { ClockIcon, ToothIcon } from "../icons/DentalIcons";
import tableStyles from "./AdminTable.module.css";

const STATUS_OPTIONS: AppointmentStatus[] = ["Pending", "Confirmed", "Arrived", "Completed", "Cancelled"];

interface AppointmentsPanelProps {
  refreshKey?: number;
  // Jumps to the Examination Form tab pre-filled for this patient — wired up
  // by the dashboard, which owns the tab state.
  onExamine?: (patientId: string) => void;
}

// `refreshKey` is bumped by the dashboard when it notices a new booking, so the
// list updates itself without the admin having to reload the page.
export function AppointmentsPanel({ refreshKey = 0, onExamine }: AppointmentsPanelProps) {
  const [appointments, setAppointments] = useState<AppointmentSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [viewing, setViewing] = useState<AppointmentSummary | null>(null);
  const [rescheduling, setRescheduling] = useState<AppointmentSummary | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    setError(null);
    try {
      const res = await fetchAppointments({ date: dateFilter || undefined, status: statusFilter || undefined });
      setAppointments(res.appointments);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load appointments.");
    } finally {
      setIsLoading(false);
    }
  }, [dateFilter, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (refreshKey > 0) load(true);
  }, [refreshKey, load]);

  async function handleStatusChange(id: string, status: AppointmentStatus) {
    setBusyId(id);
    setActionError(null);
    try {
      await updateAppointmentStatus(id, status);
      await load();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Failed to update appointment.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleSittingChange(id: string, sittingCount: number) {
    setBusyId(id);
    setActionError(null);
    try {
      await updateAppointmentSitting(id, sittingCount);
      await load(true);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Failed to update sitting count.");
    } finally {
      setBusyId(null);
    }
  }

  async function handlePaymentStatusChange(id: string, paymentStatus: PaymentStatus) {
    setBusyId(id);
    setActionError(null);
    try {
      await updateAppointmentPaymentStatus(id, paymentStatus);
      await load(true);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Failed to update payment status.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleReschedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!rescheduling) return;
    const formData = new FormData(event.currentTarget);
    const date = String(formData.get("date") || "");
    const time = String(formData.get("time") || "");
    if (!date) return;

    setBusyId(rescheduling.id);
    setActionError(null);
    try {
      await rescheduleAppointment(rescheduling.id, date, time || undefined);
      setRescheduling(null);
      await load();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Failed to reschedule appointment.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className={tableStyles.toolbar}>
        <div className={tableStyles.toolbarField}>
          <label htmlFor="filter-date">Date</label>
          <input id="filter-date" type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
        </div>
        <div className={tableStyles.toolbarField}>
          <label htmlFor="filter-status">Status</label>
          <select id="filter-status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        {(dateFilter || statusFilter) && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setDateFilter("");
              setStatusFilter("");
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {actionError && (
        <div className="alert alert-error" role="alert">
          {actionError}
        </div>
      )}

      <div className={tableStyles.tableWrap}>
        {isLoading ? (
          <p className={tableStyles.loadingState}>Loading appointments...</p>
        ) : error ? (
          <p className={tableStyles.emptyState}>{error}</p>
        ) : appointments.length === 0 ? (
          <p className={tableStyles.emptyState}>No appointments found for the selected filters.</p>
        ) : (
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>OP Number</th>
                <th>Patient</th>
                <th>Mobile</th>
                <th>Dental Problem</th>
                <th>Date &amp; Time</th>
                <th>Status</th>
                <th>Sitting</th>
                <th>Fees</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id} className={appointment.status === "Pending" ? tableStyles.rowNew : undefined}>
                  <td data-label="OP Number" className={tableStyles.nowrap}>
                    {appointment.opNumber}
                    {appointment.status === "Pending" && <span className={tableStyles.newPill}>New</span>}
                  </td>
                  <td data-label="Patient">
                    <div className={tableStyles.personCell}>
                      <PatientAvatar
                        patientId={appointment.patientId}
                        name={appointment.patientName}
                        hasPhoto={appointment.hasPhoto}
                        size={42}
                      />
                      <div>
                        <div className={tableStyles.personName}>{appointment.patientName}</div>
                        <div className={tableStyles.personMeta}>
                          {[appointment.age ? `${appointment.age} yrs` : null, appointment.gender]
                            .filter(Boolean)
                            .join(" · ") || "—"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td data-label="Mobile" className={tableStyles.nowrap}>
                    {appointment.mobile}
                  </td>
                  <td data-label="Dental Problem">
                    <div className={tableStyles.clamp}>{appointment.dentalProblem || "—"}</div>
                  </td>
                  <td data-label="Date & Time" className={tableStyles.nowrap}>
                    <div>{appointment.appointmentDate}</div>
                    <div className={tableStyles.personMeta}>{appointment.appointmentTime || "Time not set"}</div>
                  </td>
                  <td data-label="Status">
                    <AppointmentStatusBadge status={appointment.status} />
                  </td>
                  <td data-label="Sitting">
                    <SittingStepper
                      value={appointment.sittingCount}
                      opNumber={appointment.opNumber}
                      disabled={busyId === appointment.id}
                      onChange={(count) => handleSittingChange(appointment.id, count)}
                    />
                  </td>
                  <td data-label="Fees">
                    <PaymentStatusSelect
                      value={appointment.paymentStatus}
                      opNumber={appointment.opNumber}
                      disabled={busyId === appointment.id}
                      onChange={(status) => handlePaymentStatusChange(appointment.id, status)}
                    />
                  </td>
                  <td data-label="Actions">
                    <div className={tableStyles.actionsRow}>
                      <StatusSelect
                        value={appointment.status}
                        opNumber={appointment.opNumber}
                        disabled={busyId === appointment.id}
                        onChange={(status) => handleStatusChange(appointment.id, status)}
                      />

                      <button
                        type="button"
                        className={tableStyles.iconBtn}
                        title="View details"
                        aria-label={`View details for ${appointment.opNumber}`}
                        onClick={() => setViewing(appointment)}
                      >
                        <EyeIcon width={17} height={17} />
                      </button>

                      {onExamine && (
                        <button
                          type="button"
                          className={tableStyles.iconBtn}
                          title="Open Examination Form for this patient"
                          aria-label={`Open Examination Form for ${appointment.patientName}`}
                          onClick={() => onExamine(appointment.patientId)}
                        >
                          <ToothIcon width={17} height={17} />
                        </button>
                      )}

                      {(appointment.status === "Pending" || appointment.status === "Confirmed") && (
                        <button
                          type="button"
                          className={tableStyles.iconBtn}
                          title="Reschedule"
                          aria-label={`Reschedule ${appointment.opNumber}`}
                          onClick={() => setRescheduling(appointment)}
                        >
                          <ClockIcon width={17} height={17} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {viewing && (
        <AppointmentDetailsModal
          appointment={appointments.find((a) => a.id === viewing.id) ?? viewing}
          busy={busyId === viewing.id}
          onClose={() => setViewing(null)}
          onStatusChange={handleStatusChange}
        />
      )}

      {rescheduling && (
        <Modal title={`Reschedule ${rescheduling.opNumber}`} onClose={() => setRescheduling(null)}>
          <form onSubmit={handleReschedule}>
            <div className="field">
              <label htmlFor="reschedule-date">New Date</label>
              <input id="reschedule-date" name="date" type="date" defaultValue={rescheduling.appointmentDate} required />
            </div>
            <div className="field">
              <label htmlFor="reschedule-time">New Time</label>
              <input
                id="reschedule-time"
                name="time"
                type="time"
                defaultValue={rescheduling.appointmentTime || ""}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={busyId === rescheduling.id}>
              Save Changes
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
