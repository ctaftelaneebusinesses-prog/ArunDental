import { apiGet, apiPatchJson, apiPostJson } from "./client";
import type { EnquiryRecord, EnquiryStatus } from "../types";

export interface EnquiryFormValues {
  name: string;
  mobile: string;
  message: string;
  callbackTime?: string;
}

export function submitEnquiry(values: EnquiryFormValues) {
  return apiPostJson<{ enquiry: { id: string; createdAt: string } }>("/enquiries", values);
}

export function fetchEnquiries(status?: string): Promise<{ enquiries: EnquiryRecord[] }> {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiGet(`/enquiries${query}`);
}

export function updateEnquiryStatus(id: string, status: EnquiryStatus) {
  return apiPatchJson(`/enquiries/${id}/status`, { status });
}
