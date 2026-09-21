import { apiGet } from "./client";
import type { DashboardSummary } from "../types";

export function fetchDashboardSummary(): Promise<DashboardSummary> {
  return apiGet("/dashboard/summary");
}
