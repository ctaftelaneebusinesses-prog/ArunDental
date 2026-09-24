import { useCallback, useEffect, useState } from "react";
import { deletePatient, exportPatients, fetchPatient, searchPatients } from "../../api/patients";
import { ApiError } from "../../api/client";
import { downloadCsv } from "../../utils/exportCsv";
import type { PatientDetail, PatientSummary } from "../../types";
import { Modal } from "../Modal";
import { AppointmentStatusBadge } from "./StatusBadge";
import { PatientAvatar } from "./PatientAvatar";
import { ActionMenu, type ActionMenuItem } from "./ActionMenu";
import { CancelXIcon, EyeIcon } from "./AdminIcons";
import { UploadIcon } from "../icons/DentalIcons";
import { FeesManager } from "./FeesManager";
import tableStyles from "./AdminTable.module.css";
import styles from "./PatientsPanel.module.css";

type SheetCell = string | number | null | undefined;

interface SheetData {
  header: string[];
  rows: SheetCell[][];
}

export function PatientsPanel() {
  const [query, setQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<PatientDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<"preview" | "download" | null>(null);
  const [preview, setPreview] = useState<SheetData | null>(null);

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

  // After a fee or payment changes in the profile, refresh it quietly.
  function refreshSelectedPatient() {
    if (!selectedId) return;
    fetchPatient(selectedId)
      .then((res) => setSelectedPatient(res.patient))
      .catch(() => undefined);
  }

  async function handleDelete(patient: PatientSummary) {
    if (
      !window.confirm(
        `Permanently delete ${patient.name} (${patient.opNumber}) and all of their appointment history? This cannot be undone.`
      )
    ) {
      return;
    }
    setDeletingId(patient.id);
    setActionError(null);
    try {
      await deletePatient(patient.id);
      setPatients((current) => current.filter((p) => p.id !== patient.id));
      if (selectedId === patient.id) setSelectedId(null);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Failed to delete patient.");
    } finally {
      setDeletingId(null);
    }
  }

  // Fetches every patient and lays them out as sheet rows — shared by the
  // Preview (shown in a dialog) and Download (saved as .csv for Excel).
  async function buildSheet(): Promise<SheetData> {
    const res = await exportPatients();
    const header = [
        "OP Number",
        "Name",
        "Mobile",
        "Status",
        "Age",
        "Gender",
        "Blood Group",
        "Occupation",
        "Address",
        "Dental Problem",
        "Previous Treatment",
        "Appointment Date",
        "Sittings",
        "Payment Status",
        "Total Fee (Rs)",
        "Paid (Rs)",
        "Due (Rs)",
        "Registered On",
      ];
      const rows = res.patients.map((p) => [
        p.opNumber,
        p.name,
        p.mobile,
        p.status ?? "—",
        p.age,
        p.gender,
        p.bloodGroup,
        p.occupation,
        p.address,
        p.dentalProblem,
        p.previousTreatment,
        p.appointmentDate,
        p.sittingCount,
        p.paymentStatus,
        p.feeAmount,
        p.paidAmount,
        p.dueAmount,
        new Date(p.createdAt).toLocaleDateString("en-IN"),
      ]);
    return { header, rows };
  }

  function downloadSheet(sheet: SheetData) {
    downloadCsv(`patients-${new Date().toISOString().slice(0, 10)}.csv`, [sheet.header, ...sheet.rows]);
  }

  async function handleExport(mode: "preview" | "download") {
    setIsExporting(mode);
    setActionError(null);
    try {
      const sheet = await buildSheet();
      if (mode === "preview") setPreview(sheet);
      else downloadSheet(sheet);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Failed to export patients.");
    } finally {
      setIsExporting(null);
    }
  }

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
        <div className={`${styles.exportActions} ${tableStyles.toolbarAction}`}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            disabled={isExporting !== null}
            onClick={() => handleExport("preview")}
          >
            <EyeIcon width={16} height={16} />
            {isExporting === "preview" ? "Loading…" : "Preview Excel Sheet"}
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={isExporting !== null}
            onClick={() => handleExport("download")}
          >
            <UploadIcon width={16} height={16} style={{ transform: "rotate(180deg)" }} />
            {isExporting === "download" ? "Preparing…" : "Download Excel Sheet"}
          </button>
        </div>
      </div>

      {preview && (
        <Modal title="Excel Sheet Preview" onClose={() => setPreview(null)} extraWide>
          <div className={styles.previewBar}>
            <span>
              {preview.rows.length} patient{preview.rows.length === 1 ? "" : "s"} · {preview.header.length} columns
            </span>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => downloadSheet(preview)}>
              <UploadIcon width={16} height={16} style={{ transform: "rotate(180deg)" }} />
              Download Excel Sheet
            </button>
          </div>
          {preview.rows.length === 0 ? (
            <p className={tableStyles.emptyState}>No patients to export yet.</p>
          ) : (
            <div className={styles.previewScroll}>
              <table className={styles.previewTable}>
                <thead>
                  <tr>
                    <th className={styles.previewRowNum}>#</th>
                    {preview.header.map((col) => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map((row, i) => (
                    <tr key={i}>
                      <td className={styles.previewRowNum}>{i + 1}</td>
                      {row.map((cell, j) => (
                        <td key={j}>{cell == null || cell === "" ? "" : String(cell)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Modal>
      )}

      {actionError && (
        <div className="alert alert-error" role="alert">
          {actionError}
        </div>
      )}

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
                    <div className={tableStyles.actionsRow}>
                      <button
                        type="button"
                        className={tableStyles.iconBtn}
                        title="View profile"
                        aria-label={`View profile for ${patient.name}`}
                        onClick={() => setSelectedId(patient.id)}
                      >
                        <EyeIcon width={17} height={17} />
                      </button>
                      <ActionMenu
                        label={`More actions for ${patient.name}`}
                        items={
                          [
                            {
                              key: "delete",
                              label: "Delete Patient",
                              icon: <CancelXIcon width={16} height={16} />,
                              danger: true,
                              disabled: deletingId === patient.id,
                              onClick: () => handleDelete(patient),
                            },
                          ] as ActionMenuItem[]
                        }
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedId && (
        <Modal title="Patient Profile" onClose={() => setSelectedId(null)} wide>
          {detailLoading && <p>Loading patient details...</p>}
          {!detailLoading && selectedPatient && (
            <div className={styles.profile}>
              <div className={styles.profileHeader}>
                <PatientAvatar
                  patientId={selectedPatient.id}
                  name={selectedPatient.name}
                  hasPhoto={Boolean(selectedPatient.photoPath)}
                  size={72}
                  square
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
                <div>
                  <dt>Occupation</dt>
                  <dd>{selectedPatient.occupation || "Not specified"}</dd>
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

              <h4 className={styles.historyHeading}>Appointments, Fees &amp; Payments</h4>
              {selectedPatient.appointments.length === 0 ? (
                <p className={styles.noHistory}>No appointment history.</p>
              ) : (
                selectedPatient.appointments.map((appointment) => (
                  <section key={appointment.id} className={styles.visitBlock}>
                    <div className={styles.visitHead}>
                      <strong>{appointment.opNumber}</strong>
                      <span>{appointment.appointmentDate}</span>
                      <span>{appointment.appointmentTime || "Time not set"}</span>
                      <span>Sitting {appointment.sittingCount}</span>
                      <AppointmentStatusBadge status={appointment.status} />
                    </div>
                    <FeesManager
                      appointmentId={appointment.id}
                      opNumber={appointment.opNumber}
                      fees={appointment}
                      onChanged={refreshSelectedPatient}
                    />
                  </section>
                ))
              )}
            </div>
          )}
          {!detailLoading && !selectedPatient && <p>Unable to load patient details.</p>}
        </Modal>
      )}
    </div>
  );
}
