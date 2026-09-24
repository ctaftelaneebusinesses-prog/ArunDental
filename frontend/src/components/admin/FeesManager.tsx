import { FormEvent, useEffect, useState } from "react";
import { addPayment, deletePayment, updateAppointmentFee } from "../../api/appointments";
import { ApiError } from "../../api/client";
import type { FeeDetails, PaymentMethod } from "../../types";
import { PAYMENT_METHODS, formatRupees, paymentStatusTone } from "./fees";
import styles from "./Fees.module.css";

interface FeesManagerProps {
  appointmentId: string;
  opNumber: string;
  fees: FeeDetails;
  // Called with the server's updated figures after every change, so the
  // parent can refresh its list.
  onChanged?: (fees: FeeDetails) => void;
}

function todayIso(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

/** Total fee, amount paid, amount due, and a payment history staff can add to. */
export function FeesManager({ appointmentId, opNumber, fees: initialFees, onChanged }: FeesManagerProps) {
  const [fees, setFees] = useState(initialFees);
  const [feeDraft, setFeeDraft] = useState(initialFees.feeAmount != null ? String(initialFees.feeAmount) : "");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("Cash");
  const [paidOn, setPaidOn] = useState(todayIso());
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Follow the parent's copy when it reloads.
  useEffect(() => {
    setFees(initialFees);
    setFeeDraft(initialFees.feeAmount != null ? String(initialFees.feeAmount) : "");
  }, [initialFees]);

  // Pre-fill the payment amount with whatever is still due.
  useEffect(() => {
    setAmount(fees.dueAmount ? String(fees.dueAmount) : "");
  }, [fees.dueAmount]);

  async function run(action: () => Promise<{ fees: FeeDetails }>) {
    setBusy(true);
    setError(null);
    try {
      const res = await action();
      setFees(res.fees);
      onChanged?.(res.fees);
      return true;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  function handleSaveFee(event: FormEvent) {
    event.preventDefault();
    const trimmed = feeDraft.trim();
    const next = trimmed === "" ? null : Number(trimmed);
    if (next !== null && (!Number.isInteger(next) || next < 0)) {
      setError("Enter the total fee in whole rupees.");
      return;
    }
    if (next === fees.feeAmount) return;
    void run(() => updateAppointmentFee(appointmentId, next));
  }

  async function handleAddPayment(event: FormEvent) {
    event.preventDefault();
    const value = Number(amount);
    if (!Number.isInteger(value) || value < 1) {
      setError("Enter the amount received in whole rupees.");
      return;
    }
    const ok = await run(() =>
      addPayment(appointmentId, { amount: value, method, paidOn, note: note.trim() || undefined })
    );
    if (ok) setNote("");
  }

  function handleRemove(paymentId: string, paymentAmount: number) {
    if (!window.confirm(`Remove this payment of ${formatRupees(paymentAmount)}? The due amount will go up again.`)) return;
    void run(() => deletePayment(appointmentId, paymentId));
  }

  const tone = paymentStatusTone(fees.paymentStatus);
  const hasFee = fees.feeAmount != null && fees.feeAmount > 0;

  return (
    <div className={styles.manager}>
      <div className={styles.summary}>
        <div className={styles.stat}>
          <span>Total Fee</span>
          <strong>{formatRupees(fees.feeAmount)}</strong>
        </div>
        <div className={`${styles.stat} ${styles.statPaid}`}>
          <span>Paid</span>
          <strong>{formatRupees(fees.paidAmount)}</strong>
        </div>
        <div className={`${styles.stat} ${styles.statDue}`}>
          <span>Due</span>
          <strong>{fees.dueAmount == null ? "—" : fees.dueAmount === 0 ? "Nil" : formatRupees(fees.dueAmount)}</strong>
        </div>
      </div>

      <div className={styles.statusRow}>
        Status: <span className={`${styles.pill} ${styles[`pill_${tone}`]}`}>{fees.paymentStatus}</span>
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <form className={styles.block} onSubmit={handleSaveFee}>
        <h4 className={styles.blockTitle}>Total fee for {opNumber}</h4>
        <div className={styles.row}>
          <label>
            Total fee (₹)
            <input
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              className={styles.amountInput}
              placeholder="e.g. 3000"
              value={feeDraft}
              disabled={busy}
              onChange={(e) => setFeeDraft(e.target.value)}
            />
          </label>
          <button type="submit" className="btn btn-secondary btn-sm" disabled={busy}>
            {fees.feeAmount == null ? "Set Fee" : "Update Fee"}
          </button>
        </div>
        <p className={styles.help}>The full treatment fee for this OP. Payments below are deducted from it.</p>
      </form>

      <form className={styles.block} onSubmit={handleAddPayment}>
        <h4 className={styles.blockTitle}>Record a payment</h4>
        {!hasFee ? (
          <p className={styles.empty}>Set the total fee first, then record payments against it.</p>
        ) : fees.dueAmount === 0 ? (
          <p className={styles.empty}>Fully paid — nothing is due for this OP.</p>
        ) : (
          <div className={styles.row}>
            <label>
              Amount (₹)
              <input
                type="number"
                inputMode="numeric"
                min={1}
                max={fees.dueAmount ?? undefined}
                step={1}
                className={styles.amountInput}
                value={amount}
                disabled={busy}
                onChange={(e) => setAmount(e.target.value)}
              />
            </label>
            <label>
              Mode
              <select value={method} disabled={busy} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Date
              <input type="date" value={paidOn} max={todayIso()} disabled={busy} onChange={(e) => setPaidOn(e.target.value)} />
            </label>
            <label className={styles.noteField}>
              Note (optional)
              <input
                type="text"
                maxLength={200}
                placeholder="e.g. 2nd sitting"
                value={note}
                disabled={busy}
                onChange={(e) => setNote(e.target.value)}
              />
            </label>
            <button type="submit" className="btn btn-primary btn-sm" disabled={busy}>
              {busy ? "Saving…" : "Add Payment"}
            </button>
          </div>
        )}
      </form>

      <div>
        <h4 className={styles.blockTitle}>Payment history</h4>
        {fees.payments.length === 0 ? (
          <p className={styles.empty}>No payments recorded yet.</p>
        ) : (
          <table className={styles.history}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Mode</th>
                <th>Note</th>
                <th className={styles.num}>Amount</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {fees.payments.map((p) => (
                <tr key={p.id}>
                  <td>{new Date(p.paidAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                  <td>{p.method}</td>
                  <td>{p.note || "—"}</td>
                  <td className={styles.num}>{formatRupees(p.amount)}</td>
                  <td>
                    <button
                      type="button"
                      className={styles.removeBtn}
                      disabled={busy}
                      onClick={() => handleRemove(p.id, p.amount)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3}>Total paid</td>
                <td className={styles.num}>{formatRupees(fees.paidAmount)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
}
