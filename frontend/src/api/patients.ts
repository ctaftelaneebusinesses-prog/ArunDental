import { apiDelete, apiGet, API_BASE } from "./client";
import type { PatientDetail, PatientSummary } from "../types";

export function searchPatients(query: { q?: string; date?: string }): Promise<{ patients: PatientSummary[] }> {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.date) params.set("date", query.date);
  const qs = params.toString();
  return apiGet(`/patients${qs ? `?${qs}` : ""}`);
}

export function fetchPatient(id: string): Promise<{ patient: PatientDetail }> {
  return apiGet(`/patients/${id}`);
}

export function patientPhotoUrl(id: string): string {
  return `${API_BASE}/patients/${id}/photo`;
}

// Permanently deletes the patient and every appointment booked under them.
export function deletePatient(id: string): Promise<{ success: boolean }> {
  return apiDelete(`/patients/${id}`);
}

export interface PatientExportRow {
  opNumber: string;
  name: string;
  mobile: string;
  age: number | null;
  gender: string | null;
  bloodGroup: string | null;
  occupation: string | null;
  address: string;
  dentalProblem: string | null;
  previousTreatment: string | null;
  // Status of the patient's most recent appointment (Pending, Confirmed, etc.) — null if they have none.
  status: string | null;
  createdAt: string;
}

// Every patient on record, for the "Download Excel Sheet" export — unlike the
// search list above, this is never trimmed to 100 rows.
export function exportPatients(): Promise<{ patients: PatientExportRow[] }> {
  return apiGet("/patients/export");
}
