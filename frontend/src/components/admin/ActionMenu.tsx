import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { MoreIcon } from "./AdminIcons";
import styles from "./ActionMenu.module.css";

export interface ActionMenuItem {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

/**
 * Compact "⋮ more" button that opens a small menu of less-frequent row actions
 * (e.g. Reschedule, Cancel). Rendered through a portal so it always sits above
 * the table, which clips overflow for its own rounded corners.
 */
export function ActionMenu({ items, label = "More actions" }: { items: ActionMenuItem[]; label?: string }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function place() {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      // Right-align the menu to the trigger, flip above it if it would run off the bottom.
      const menuHeight = menuRef.current?.offsetHeight ?? 160;
      const opensUp = rect.bottom + menuHeight + 8 > window.innerHeight;
      setCoords({
        top: opensUp ? rect.top - menuHeight - 6 : rect.bottom + 6,
        left: Math.max(8, rect.right - 200),
      });
    }

    place();
    function handleOutside(event: MouseEvent) {
      if (triggerRef.current?.contains(event.target as Node)) return;
      if (menuRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleKey);
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleKey);
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open]);

  if (items.length === 0) return null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((v) => !v)}
      >
        <MoreIcon width={18} height={18} />
      </button>

      {open &&
        coords &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            className={styles.menu}
            style={{ top: coords.top, left: coords.left }}
          >
            {items.map((item) => (
              <button
                key={item.key}
                type="button"
                role="menuitem"
                className={`${styles.item} ${item.danger ? styles.itemDanger : ""}`}
                disabled={item.disabled}
                onClick={() => {
                  setOpen(false);
                  item.onClick();
                }}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}
