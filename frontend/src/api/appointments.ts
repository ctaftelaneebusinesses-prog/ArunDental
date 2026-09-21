import { apiGet, apiPatchJson, apiPostForm } from "./client";
import type { AppointmentStatus, AppointmentSummary, OpConfirmationResult } from "../types";

export interface BookOpFormValues {
  photo: File;
  name: string;
  mobile: string;
  address: string;
  age?: string;
  gender?: string;
  bloodGroup?: string;
  preferredDate?: string;
  preferredTime?: string;
  dentalProblem?: string;
  previousTreatment?: string;
  consent: boolean;
}

export function submitBookOp(values: BookOpFormValues): Promise<OpConfirmationResult> {
  const formData = new FormData();
  formData.append("photo", values.photo);
  formData.append("name", values.name);
  formData.append("mobile", values.mobile);
  formData.append("address", values.address);
  if (values.age) formData.append("age", values.age);
  if (values.gender) formData.append("gender", values.gender);
  if (values.bloodGroup) formData.append("bloodGroup", values.bloodGroup);
  if (values.preferredDate) formData.append("preferredDate", values.preferredDate);
  if (values.preferredTime) formData.append("preferredTime", values.preferredTime);
  if (values.dentalProblem) formData.append("dentalProblem", values.dentalProblem);
  if (values.previousTreatment) formData.append("previousTreatment", values.previousTreatment);
  formData.append("consent", String(values.consent));

  return apiPostForm("/appointments", formData);
}

export function fetchAppointments(filters: { date?: string; status?: string } = {}): Promise<{
  appointments: AppointmentSummary[];
}> {
  const params = new URLSearchParams();
  if (filters.date) params.set("date", filters.date);
  if (filters.status) params.set("status", filters.status);
  const query = params.toString();
  return apiGet(`/appointments${query ? `?${query}` : ""}`);
}

export function updateAppointmentStatus(id: string, status: AppointmentStatus) {
  return apiPatchJson(`/appointments/${id}/status`, { status });
}

export function rescheduleAppointment(id: string, appointmentDate: string, appointmentTime?: string) {
  return apiPatchJson(`/appointments/${id}/reschedule`, { appointmentDate, appointmentTime });
}
