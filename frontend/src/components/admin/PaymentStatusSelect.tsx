import type { PaymentStatus } from "../../types";
import styles from "./StatusSelect.module.css";

const PAYMENT_STATUS_OPTIONS: PaymentStatus[] = ["Payment Pending", "Payment Completed"];

interface PaymentStatusSelectProps {
  value: PaymentStatus;
  opNumber: string;
  disabled?: boolean;
  onChange: (status: PaymentStatus) => void;
}

/** Lets the admin mark an OP's fees as paid or still pending, from the appointments table. */
export function PaymentStatusSelect({ value, opNumber, disabled, onChange }: PaymentStatusSelectProps) {
  return (
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
}
