import { apiGet, apiPostJson } from "./client";
import type { AdminUser } from "../types";

export function login(email: string, password: string): Promise<{ user: AdminUser }> {
  return apiPostJson("/auth/login", { email, password });
}

export function logout(): Promise<{ success: boolean }> {
  return apiPostJson("/auth/logout", {});
}

export function fetchCurrentUser(): Promise<{ user: AdminUser }> {
  return apiGet("/auth/me");
}
