import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { CloseIcon } from "./icons/DentalIcons";
import styles from "./Modal.module.css";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
  // Near full-screen — for spreadsheet-style previews with many columns.
  extraWide?: boolean;
}

export function Modal({ title, onClose, children, wide = false, extraWide = false }: ModalProps) {
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return createPortal(
    <div className={styles.overlay} role="presentation" onClick={onClose}>
      <div
        className={`${styles.panel} ${wide ? styles.panelWide : ""} ${extraWide ? styles.panelExtraWide : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2>{title}</h2>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close dialog">
            <CloseIcon width={20} height={20} />
          </button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>,
    document.body
  );
}
