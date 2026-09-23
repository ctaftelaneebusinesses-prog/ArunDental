import { apiGet, apiPatchJson, apiPostJson } from "./client";
import type { AppointmentStatus, AppointmentSummary, OpConfirmationResult, PaymentStatus } from "../types";

export interface BookOpFormValues {
  name: string;
  mobile: string;
  address: string;
  age?: string;
  gender?: string;
  bloodGroup?: string;
  occupation?: string;
  preferredDate?: string;
  preferredTime?: string;
  dentalProblem?: string;
  previousTreatment?: string;
  consent: boolean;
}

export function submitBookOp(values: BookOpFormValues): Promise<OpConfirmationResult> {
  // Optional fields left blank are simply omitted from the request.
  return apiPostJson("/appointments", {
    name: values.name,
    mobile: values.mobile,
    address: values.address,
    age: values.age || undefined,
    gender: values.gender || undefined,
    bloodGroup: values.bloodGroup || undefined,
    occupation: values.occupation || undefined,
    preferredDate: values.preferredDate || undefined,
    preferredTime: values.preferredTime || undefined,
    dentalProblem: values.dentalProblem || undefined,
    previousTreatment: values.previousTreatment || undefined,
    consent: values.consent,
  });
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

export function updateAppointmentSitting(id: string, sittingCount: number) {
  return apiPatchJson(`/appointments/${id}/sitting`, { sittingCount });
}

export function updateAppointmentPaymentStatus(id: string, paymentStatus: PaymentStatus) {
  return apiPatchJson(`/appointments/${id}/payment-status`, { paymentStatus });
}

// null clears the amount.
export function updateAppointmentFeeAmount(id: string, feeAmount: number | null) {
  return apiPatchJson(`/appointments/${id}/payment-status`, { feeAmount });
}
