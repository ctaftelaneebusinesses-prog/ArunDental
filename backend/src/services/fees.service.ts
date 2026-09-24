import type { Payment, Prisma } from "@prisma/client";
import type { PaymentStatus } from "../utils/validation";

// Total fee vs. what has been received so far decides the payment status, so
// staff only ever enter amounts — the status can't drift out of sync.
export function derivePaymentStatus(feeAmount: number | null, paidAmount: number): PaymentStatus {
  if (feeAmount != null && feeAmount > 0 && paidAmount >= feeAmount) return "Payment Completed";
  if (paidAmount > 0) return "Partially Paid";
  return "Payment Pending";
}

export interface FeeDetails {
  feeAmount: number | null;
  paidAmount: number;
  dueAmount: number | null;
  paymentStatus: PaymentStatus;
  payments: { id: string; amount: number; method: string; note: string | null; paidAt: Date }[];
}

export function feeDetails(appointment: { feeAmount: number | null; payments: Payment[] }): FeeDetails {
  const paidAmount = appointment.payments.reduce((sum, p) => sum + p.amount, 0);
  return {
    feeAmount: appointment.feeAmount,
    paidAmount,
    dueAmount: appointment.feeAmount == null ? null : Math.max(appointment.feeAmount - paidAmount, 0),
    paymentStatus: derivePaymentStatus(appointment.feeAmount, paidAmount),
    payments: [...appointment.payments]
      .sort((a, b) => a.paidAt.getTime() - b.paidAt.getTime())
      .map(({ id, amount, method, note, paidAt }) => ({ id, amount, method, note, paidAt })),
  };
}

// Recomputes and stores paymentStatus after the fee or a payment changes.
// Runs inside the caller's transaction so the status matches what was written.
export async function syncPaymentStatus(tx: Prisma.TransactionClient, appointmentId: string): Promise<FeeDetails> {
  const appointment = await tx.appointment.findUniqueOrThrow({
    where: { id: appointmentId },
    include: { payments: true },
  });
  const details = feeDetails(appointment);
  if (appointment.paymentStatus !== details.paymentStatus) {
    await tx.appointment.update({ where: { id: appointmentId }, data: { paymentStatus: details.paymentStatus } });
  }
  return details;
}
