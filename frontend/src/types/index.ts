export type AppointmentStatus = "Pending" | "Confirmed" | "Arrived" | "Completed" | "Cancelled";
export type PaymentStatus = "Payment Pending" | "Payment Completed";
export type Gender = "Male" | "Female" | "Other" | "Prefer not to say";
export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-" | "Unknown";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AppointmentSummary {
  id: string;
  opNumber: string;
  patientId: string;
  hasPhoto: boolean;
  patientName: string;
  mobile: string;
  address: string;
  age: number | null;
  gender: string | null;
  bloodGroup: string | null;
  occupation: string | null;
  dentalProblem: string | null;
  previousTreatment: string | null;
  appointmentDate: string;
  appointmentTime: string | null;
  status: AppointmentStatus;
  sittingCount: number;
  paymentStatus: PaymentStatus;
  // Whole rupees; null until entered.
  feeAmount: number | null;
  createdAt: string;
}

export interface PatientSummary {
  id: string;
  opNumber: string;
  name: string;
  mobile: string;
  age: number | null;
  gender: string | null;
  bloodGroup: string | null;
  createdAt: string;
}

export interface PatientAppointmentRecord {
  id: string;
  opNumber: string;
  appointmentDate: string;
  appointmentTime: string | null;
  status: AppointmentStatus;
  createdAt: string;
}

export interface PatientDetail extends PatientSummary {
  address: string;
  occupation: string | null;
  dentalProblem: string | null;
  previousTreatment: string | null;
  photoPath: string;
  appointments: PatientAppointmentRecord[];
}

export interface DashboardSummary {
  todaysOp: number;
  upcomingAppointments: number;
  newPatients: number;
  pendingAppointments: number;
  totalAppointments: number;
}

export interface OpConfirmationResult {
  opNumber: string;
  patientName: string;
  appointmentDate: string;
  appointmentTime: string | null;
  doctorName: string;
  qualification: string;
}
