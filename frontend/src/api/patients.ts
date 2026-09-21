import { apiGet } from "./client";
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
  return `/api/patients/${id}/photo`;
}
