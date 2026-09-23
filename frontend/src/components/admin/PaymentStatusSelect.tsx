import { useEffect, useState } from "react";
import type { PaymentStatus } from "../../types";
import styles from "./StatusSelect.module.css";

const PAYMENT_STATUS_OPTIONS: PaymentStatus[] = ["Payment Pending", "Payment Completed"];

interface PaymentStatusSelectProps {
  value: PaymentStatus;
  opNumber: string;
  disabled?: boolean;
  onChange: (status: PaymentStatus) => void;
  // Fee in whole rupees: the amount due while pending, the amount received once completed.
  amount?: number | null;
  onAmountChange?: (amount: number | null) => void;
}

/** Lets the admin mark an OP's fees as paid or pending, and record the amount, from the appointments table. */
export function PaymentStatusSelect({ value, opNumber, disabled, onChange, amount, onAmountChange }: PaymentStatusSelectProps) {
  const [draft, setDraft] = useState(amount != null ? String(amount) : "");

  // Follow the saved value when the row reloads.
  useEffect(() => {
    setDraft(amount != null ? String(amount) : "");
  }, [amount]);

  function commitAmount() {
    const trimmed = draft.trim();
    const next = trimmed === "" ? null : Math.round(Number(trimmed));
    if (next !== null && (!Number.isFinite(next) || next < 0)) {
      setDraft(amount != null ? String(amount) : "");
      return;
    }
    if (next !== (amount ?? null)) onAmountChange?.(next);
  }

  const select = (
    <select
      className={styles.select}
      value={value}
      disabled={disabled}
      aria-label={`Change payment status for ${opNumber}`}
      onChange={(event) => {
        const next = event.target.value as PaymentStatus;
        if (next !== value) onChange(next);
      }}
    >
      {PAYMENT_STATUS_OPTIONS.map((status) => (
        <option key={status} value={status}>
          {status}
        </option>
      ))}
    </select>
  );

  if (!onAmountChange) return select;

  return (
    <div className={styles.feeGroup}>
      {select}
      <label className={`${styles.amount} ${value === "Payment Completed" ? styles.amountPaid : styles.amountDue}`}>
        <span aria-hidden="true">₹</span>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          step={1}
          placeholder={value === "Payment Completed" ? "Amount paid" : "Amount due"}
          value={draft}
          disabled={disabled}
          aria-label={`${value === "Payment Completed" ? "Amount paid" : "Amount due"} for ${opNumber}`}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commitAmount}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
          }}
        />
      </label>
    </div>
  );
}
