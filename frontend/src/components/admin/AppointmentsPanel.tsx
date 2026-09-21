import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  fetchAppointments,
  rescheduleAppointment,
  updateAppointmentStatus,
} from "../../api/appointments";
import { ApiError } from "../../api/client";
import { PatientAvatar } from "./PatientAvatar";
import type { AppointmentStatus, AppointmentSummary } from "../../types";
import { AppointmentStatusBadge } from "./StatusBadge";
import { Modal } from "../Modal";
import { AppointmentDetailsModal } from "./AppointmentDetailsModal";
import tableStyles from "./AdminTable.module.css";

const STATUS_OPTIONS: AppointmentStatus[] = ["Pending", "Confirmed", "Arrived", "Completed", "Cancelled"];

// `refreshKey` is bumped by the dashboard when it notices a new booking, so the
// list updates itself without the admin having to reload the page.
export function AppointmentsPanel({ refreshKey = 0 }: { refreshKey?: number }) {
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
                  <td data-label="Actions">
                    <div className={tableStyles.actionsCell}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setViewing(appointment)}
                      >
                        View Details
                      </button>
                      {appointment.status === "Pending" && (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          disabled={busyId === appointment.id}
                          onClick={() => handleStatusChange(appointment.id, "Confirmed")}
                        >
                          Confirm
                        </button>
                      )}
                      {appointment.status === "Confirmed" && (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          disabled={busyId === appointment.id}
                          onClick={() => handleStatusChange(appointment.id, "Arrived")}
                        >
                          Mark Arrived
                        </button>
                      )}
                      {appointment.status === "Arrived" && (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          disabled={busyId === appointment.id}
                          onClick={() => handleStatusChange(appointment.id, "Completed")}
                        >
                          Mark Completed
                        </button>
                      )}
                      {(appointment.status === "Pending" || appointment.status === "Confirmed") && (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setRescheduling(appointment)}
                        >
                          Reschedule
                        </button>
                      )}
                      {appointment.status !== "Cancelled" && appointment.status !== "Completed" && (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          disabled={busyId === appointment.id}
                          onClick={() => {
                            if (window.confirm(`Cancel appointment ${appointment.opNumber}?`)) {
                              handleStatusChange(appointment.id, "Cancelled");
                            }
                          }}
                        >
                          Cancel
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
