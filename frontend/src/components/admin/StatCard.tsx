import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import styles from "./StatCard.module.css";

type Tone = "blue" | "teal" | "violet" | "amber";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  tone?: Tone;
  index?: number;
}

/** Counts up to the target the first time a number arrives (and whenever it changes). */
function useCountUp(target: number | null, duration = 900) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (target === null) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(target);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const from = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setDisplay(Math.round(from + (target - from) * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return display;
}

export function StatCard({ label, value, icon, tone = "blue", index = 0 }: StatCardProps) {
  const numeric = typeof value === "number" ? value : null;
  const counted = useCountUp(numeric);

  return (
    <div className={`${styles.card} ${styles[tone]}`} style={{ "--i": index } as CSSProperties}>
      <span className={styles.orb} aria-hidden="true" />
      <div className={styles.icon}>{icon}</div>
      <p className={styles.value}>{numeric === null ? value : counted}</p>
      <p className={styles.label}>{label}</p>
    </div>
  );
}
