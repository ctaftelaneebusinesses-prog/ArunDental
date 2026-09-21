import type { ReactNode } from "react";
import styles from "./StatCard.module.css";

export function StatCard({ label, value, icon }: { label: string; value: number | string; icon: ReactNode }) {
  return (
    <div className={`card ${styles.card}`}>
      <div className={styles.icon}>{icon}</div>
      <div>
        <p className={styles.value}>{value}</p>
        <p className={styles.label}>{label}</p>
      </div>
    </div>
  );
}
