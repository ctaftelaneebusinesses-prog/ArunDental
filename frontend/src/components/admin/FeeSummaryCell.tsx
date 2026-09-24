import type { FeeDetails } from "../../types";
import { formatRupees, paymentStatusTone } from "./fees";
import styles from "./Fees.module.css";

interface FeeSummaryCellProps {
  fees: FeeDetails;
  opNumber: string;
  onManage: () => void;
}

/** Fee position at a glance: total, a paid-vs-total meter and what is still due; "Manage" opens the full fee manager. */
export function FeeSummaryCell({ fees, opNumber, onManage }: FeeSummaryCellProps) {
  const total = fees.feeAmount;
  const paid = fees.paidAmount ?? 0;
  const tone = paymentStatusTone(fees.paymentStatus);
  const percent = total != null && total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;

  return (
    <div className={styles.cell}>
      {total == null ? (
        <span className={styles.cellEmpty}>Fee not set</span>
      ) : (
        <>
          <div className={styles.cellHead}>
            <span className={styles.cellTotal}>{formatRupees(total)}</span>
            <span className={`${styles.pill} ${styles[`pill_${tone}`]}`}>{fees.paymentStatus}</span>
          </div>
          <div
            className={styles.meter}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={tone === "paid" ? 100 : percent}
            aria-label={`${formatRupees(paid)} paid of ${formatRupees(total)}`}
          >
            <span
              className={`${styles.meterFill} ${styles[`fill_${tone}`]}`}
              style={{ width: `${tone === "paid" ? 100 : percent}%` }}
            />
          </div>
          <div className={styles.cellFoot}>
            <span>
              Paid <strong className={styles.clear}>{formatRupees(paid)}</strong>
            </span>
            <span>
              {fees.dueAmount ? (
                <>
                  Due <strong className={styles.due}>{formatRupees(fees.dueAmount)}</strong>
                </>
              ) : (
                <strong className={styles.clear}>Settled ✓</strong>
              )}
            </span>
          </div>
        </>
      )}
      <button
        type="button"
        className={styles.manageBtn}
        onClick={onManage}
        aria-label={`Manage fees and payments for ${opNumber}`}
      >
        {total == null ? "+ Add fee" : "Manage fees"}
      </button>
    </div>
  );
}
