import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  deleteAppointment,
  fetchAppointments,
  rescheduleAppointment,
  updateAppointmentSitting,
  updateAppointmentStatus,
} from "../../api/appointments";
import { ApiError } from "../../api/client";
import type { AppointmentStatus, AppointmentSummary } from "../../types";
import { AppointmentCard } from "./AppointmentCard";
import { FeesManager } from "./FeesManager";
import { Modal } from "../Modal";
import { AppointmentDetailsModal } from "./AppointmentDetailsModal";
import { ToothIcon } from "../icons/DentalIcons";
import styles from "./AppointmentsPanel.module.css";

const STATUS_FILTERS: { value: "" | AppointmentStatus; label: string }[] = [
  { value: "", label: "All" },
  { value: "Pending", label: "Pending" },
  { value: "Confirmed", label: "Confirmed" },
  { value: "Arrived", label: "Arrived" },
  { value: "Completed", label: "Completed" },
  { value: "Cancelled", label: "Cancelled" },
];

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
  const [statusFilter, setStatusFilter] = useState<"" | AppointmentStatus>("");
  const [viewing, setViewing] = useState<AppointmentSummary | null>(null);
  const [rescheduling, setRescheduling] = useState<AppointmentSummary | null>(null);
  // Appointment whose Fees & Payments dialog is open (id, so it follows reloads).
  const [managingFeesId, setManagingFeesId] = useState<string | null>(null);
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

  async function handleDelete(appointment: AppointmentSummary) {
    if (
      !window.confirm(
        `Permanently delete appointment ${appointment.opNumber} for ${appointment.patientName}? This cannot be undone.`
      )
    ) {
      return;
    }
    setBusyId(appointment.id);
    setActionError(null);
    try {
      await deleteAppointment(appointment.id);
      setAppointments((current) => current.filter((a) => a.id !== appointment.id));
      if (viewing?.id === appointment.id) setViewing(null);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Failed to delete appointment.");
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

  const managingFees = managingFeesId ? appointments.find((a) => a.id === managingFeesId) ?? null : null;
  const hasFilters = Boolean(dateFilter || statusFilter);
  const pendingCount = appointments.filter((a) => a.status === "Pending").length;

  function clearFilters() {
    setDateFilter("");
    setStatusFilter("");
  }

  return (
    <div>
      <div className={styles.bar}>
        <div className={styles.pills} role="group" aria-label="Filter by status">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.label}
              type="button"
              className={`${styles.pill} ${statusFilter === filter.value ? styles.pillActive : ""}`}
              aria-pressed={statusFilter === filter.value}
              onClick={() => setStatusFilter(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className={styles.dateWrap}>
          <div className={styles.dateField}>
            <label htmlFor="filter-date">Date</label>
            <input id="filter-date" type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
          </div>
          {hasFilters && (
            <button type="button" className={`btn btn-secondary btn-sm ${styles.clear}`} onClick={clearFilters}>
              Clear
            </button>
          )}
        </div>
      </div>

      {!isLoading && !error && appointments.length > 0 && (
        <p className={styles.summary} aria-live="polite">
          Showing <strong>{appointments.length}</strong> appointment{appointments.length === 1 ? "" : "s"}
          {pendingCount > 0 && <span className={styles.summaryPending}>{pendingCount} awaiting confirmation</span>}
        </p>
      )}

      {actionError && (
        <div className="alert alert-error" role="alert">
          {actionError}
        </div>
      )}

      {isLoading ? (
        <ul className={styles.list} aria-busy="true" aria-label="Loading appointments">
          {[0, 1, 2].map((n) => (
            <li key={n} className={styles.skeleton} />
          ))}
        </ul>
      ) : error ? (
        <p className={styles.errorState}>{error}</p>
      ) : appointments.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>
            <ToothIcon width={30} height={30} />
          </span>
          <h3>No appointments found</h3>
          <p>{hasFilters ? "Nothing matches these filters. Try a different status or date." : "New OP bookings will appear here."}</p>
          {hasFilters && (
            <button type="button" className="btn btn-primary btn-sm" onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <ul className={styles.list}>
          {appointments.map((appointment, index) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              index={index}
              busy={busyId === appointment.id}
              onStatusChange={handleStatusChange}
              onSittingChange={handleSittingChange}
              onView={() => setViewing(appointment)}
              onManageFees={() => setManagingFeesId(appointment.id)}
              onReschedule={() => setRescheduling(appointment)}
              onDelete={() => handleDelete(appointment)}
              onExamine={onExamine ? () => onExamine(appointment.patientId) : undefined}
            />
          ))}
        </ul>
      )}

      {viewing && (
        <AppointmentDetailsModal
          appointment={appointments.find((a) => a.id === viewing.id) ?? viewing}
          busy={busyId === viewing.id}
          onClose={() => setViewing(null)}
          onStatusChange={handleStatusChange}
          onFeesChanged={() => load(true)}
        />
      )}

      {managingFees && (
        <Modal
          title={`Fees & Payments · ${managingFees.opNumber}`}
          onClose={() => setManagingFeesId(null)}
          wide
        >
          <p style={{ marginTop: 0 }}>
            <strong>{managingFees.patientName}</strong> · {managingFees.mobile}
          </p>
          <FeesManager
            appointmentId={managingFees.id}
            opNumber={managingFees.opNumber}
            fees={managingFees}
            onChanged={() => load(true)}
          />
        </Modal>
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
