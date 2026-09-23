import styles from "./SittingStepper.module.css";

const MIN_SITTINGS = 1;
const MAX_SITTINGS = 50;

interface SittingStepperProps {
  value: number;
  opNumber: string;
  disabled?: boolean;
  onChange: (value: number) => void;
}

/**
 * Lets the admin track how many treatment sittings/visits an OP has had so
 * far (e.g. a root canal spanning several visits) with a plus/minus counter,
 * instead of typing a number by hand.
 */
export function SittingStepper({ value, opNumber, disabled, onChange }: SittingStepperProps) {
  function step(delta: number) {
    const next = Math.min(MAX_SITTINGS, Math.max(MIN_SITTINGS, value + delta));
    if (next !== value) onChange(next);
  }

  return (
    <div className={styles.stepper}>
      <button
        type="button"
        className={styles.stepBtn}
        aria-label={`Decrease sitting count for ${opNumber}`}
        disabled={disabled || value <= MIN_SITTINGS}
        onClick={() => step(-1)}
      >
        −
      </button>
      <span className={styles.value} aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className={styles.stepBtn}
        aria-label={`Increase sitting count for ${opNumber}`}
        disabled={disabled || value >= MAX_SITTINGS}
        onClick={() => step(1)}
      >
        +
      </button>
    </div>
  );
}
