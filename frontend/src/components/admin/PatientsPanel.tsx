import { useCallback, useEffect, useState } from "react";
import { fetchPatient, patientPhotoUrl, searchPatients } from "../../api/patients";
import { ApiError } from "../../api/client";
import type { PatientDetail, PatientSummary } from "../../types";
import { Modal } from "../Modal";
import { AppointmentStatusBadge } from "./StatusBadge";
import tableStyles from "./AdminTable.module.css";
import styles from "./PatientsPanel.module.css";

export function PatientsPanel() {
  const [query, setQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<PatientDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await searchPatients({ q: query || undefined, date: dateFilter || undefined });
      setPatients(res.patients);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load patients.");
    } finally {
      setIsLoading(false);
    }
  }, [query, dateFilter]);

  useEffect(() => {
    const timeout = setTimeout(load, 300);
    return () => clearTimeout(timeout);
  }, [load]);

  useEffect(() => {
    if (!selectedId) {
      setSelectedPatient(null);
      return;
    }
    setDetailLoading(true);
    fetchPatient(selectedId)
      .then((res) => setSelectedPatient(res.patient))
      .catch(() => setSelectedPatient(null))
      .finally(() => setDetailLoading(false));
  }, [selectedId]);

  return (
    <div>
      <div className={tableStyles.toolbar}>
        <div className={tableStyles.toolbarField}>
          <label htmlFor="patient-search">Search (OP Number / Name / Mobile)</label>
          <input
            id="patient-search"
            type="text"
            placeholder="e.g. ADC-2026-000125"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className={tableStyles.toolbarField}>
          <label htmlFor="patient-date">Appointment Date</label>
          <input id="patient-date" type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
        </div>
        {(query || dateFilter) && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setQuery("");
              setDateFilter("");
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      <div className={tableStyles.tableWrap}>
        {isLoading ? (
          <p className={tableStyles.loadingState}>Loading patients...</p>
        ) : error ? (
          <p className={tableStyles.emptyState}>{error}</p>
        ) : patients.length === 0 ? (
          <p className={tableStyles.emptyState}>No patients found.</p>
        ) : (
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>OP Number</th>
                <th>Name</th>
                <th>Mobile</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id}>
                  <td data-label="OP Number">{patient.opNumber}</td>
                  <td data-label="Name">{patient.name}</td>
                  <td data-label="Mobile">{patient.mobile}</td>
                  <td data-label="Age">{patient.age ?? "—"}</td>
                  <td data-label="Gender">{patient.gender ?? "—"}</td>
                  <td data-label="Registered">{new Date(patient.createdAt).toLocaleDateString("en-IN")}</td>
                  <td data-label="Actions">
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedId(patient.id)}>
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedId && (
        <Modal title="Patient Profile" onClose={() => setSelectedId(null)}>
          {detailLoading && <p>Loading patient details...</p>}
          {!detailLoading && selectedPatient && (
            <div className={styles.profile}>
              <div className={styles.profileHeader}>
                <img
                  src={patientPhotoUrl(selectedPatient.id)}
                  alt={`Photo of ${selectedPatient.name}`}
                  className={styles.photo}
                />
                <div>
                  <h3 className={styles.name}>{selectedPatient.name}</h3>
                  <p className={styles.opNumber}>{selectedPatient.opNumber}</p>
                </div>
              </div>

              <dl className={styles.detailGrid}>
                <div>
                  <dt>Mobile</dt>
                  <dd>{selectedPatient.mobile}</dd>
                </div>
                <div>
                  <dt>Age</dt>
                  <dd>{selectedPatient.age ?? "Not specified"}</dd>
                </div>
                <div>
                  <dt>Gender</dt>
                  <dd>{selectedPatient.gender ?? "Not specified"}</dd>
                </div>
                <div>
                  <dt>Blood Group</dt>
                  <dd>{selectedPatient.bloodGroup ?? "Not specified"}</dd>
                </div>
                <div className={styles.fullWidth}>
                  <dt>Address</dt>
                  <dd>{selectedPatient.address}</dd>
                </div>
                {selectedPatient.dentalProblem && (
                  <div className={styles.fullWidth}>
                    <dt>Dental Problem</dt>
                    <dd>{selectedPatient.dentalProblem}</dd>
                  </div>
                )}
                {selectedPatient.previousTreatment && (
                  <div className={styles.fullWidth}>
                    <dt>Previous Treatment</dt>
                    <dd>{selectedPatient.previousTreatment}</dd>
                  </div>
                )}
              </dl>

              <h4 className={styles.historyHeading}>Appointment History</h4>
              {selectedPatient.appointments.length === 0 ? (
                <p className={styles.noHistory}>No appointment history.</p>
              ) : (
                <ul className={styles.historyList}>
                  {selectedPatient.appointments.map((appointment) => (
                    <li key={appointment.id}>
                      <span>{appointment.appointmentDate}</span>
                      <span>{appointment.appointmentTime || "—"}</span>
                      <AppointmentStatusBadge status={appointment.status} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {!detailLoading && !selectedPatient && <p>Unable to load patient details.</p>}
        </Modal>
      )}
    </div>
  );
}
