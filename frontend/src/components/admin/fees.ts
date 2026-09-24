import type { PaymentMethod, PaymentStatus } from "../../types";

export const PAYMENT_METHODS: PaymentMethod[] = ["Cash", "UPI", "Card", "Bank Transfer", "Other"];

export function formatRupees(amount: number | null | undefined): string {
  return amount == null ? "—" : `₹${amount.toLocaleString("en-IN")}`;
}

export function paymentStatusTone(status: PaymentStatus): "due" | "partial" | "paid" {
  if (status === "Payment Completed") return "paid";
  if (status === "Partially Paid") return "partial";
  return "due";
}
