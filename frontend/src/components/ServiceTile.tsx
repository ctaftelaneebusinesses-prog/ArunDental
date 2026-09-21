import type { PointerEvent } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRightIcon } from "./icons/DentalIcons";
import { ServiceIcon } from "./ServiceIcon";
import type { ServiceItem } from "../data/services.data";
import styles from "./ServiceTile.module.css";

interface ServiceTileProps {
  service: ServiceItem;
  categorySlug: string;
  index: number;
}

const MAX_TILT = 7;

/** Tilts the card toward the cursor and feeds the spotlight — mouse only, no re-renders. */
function handlePointerMove(event: PointerEvent<HTMLAnchorElement>) {
  if (event.pointerType !== "mouse") return;
  const el = event.currentTarget;
  const rect = el.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width;
  const y = (event.clientY - rect.top) / rect.height;
  el.style.setProperty("--mx", `${x * 100}%`);
  el.style.setProperty("--my", `${y * 100}%`);
  el.style.setProperty("--ry", `${(x - 0.5) * 2 * MAX_TILT}deg`);
  el.style.setProperty("--rx", `${(0.5 - y) * 2 * MAX_TILT}deg`);
}

function handlePointerLeave(event: PointerEvent<HTMLAnchorElement>) {
  event.currentTarget.style.setProperty("--rx", "0deg");
  event.currentTarget.style.setProperty("--ry", "0deg");
}

export function ServiceTile({ service, categorySlug, index }: ServiceTileProps) {
  const { t } = useTranslation();
  const base = `services.categories.${categorySlug}.items.${service.slug}`;
  const name = t(`${base}.name`, service.name);
  const description = t(`${base}.description`, service.description);

  return (
    <Link
      to="/book-op"
      className={styles.tile}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <span className={styles.fx} aria-hidden="true">
        <span className={styles.spotlight} />
        <span className={styles.shine} />
      </span>
      <span className={styles.border} aria-hidden="true" />

      <div className={styles.media}>
        <div className={styles.imageWrap}>
          <img src={service.image} alt={name} loading="lazy" />
          <div className={styles.scrim} aria-hidden="true" />
          <span className={styles.num} aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </span>
          {!service.available && <span className={`badge badge-pending ${styles.badge}`}>{t("services.comingSoon")}</span>}
        </div>

        <span className={styles.iconBadge} aria-hidden="true">
          <span className={styles.pulse} />
          <span className={styles.iconInner}>
            <ServiceIcon icon={service.icon} width={26} height={26} />
          </span>
        </span>
      </div>

      <div className={styles.content}>
        <h3 className={styles.name}>{name}</h3>
        <p className={styles.description}>{description}</p>
        <span className={styles.cta}>
          {t("common.bookOp")}
          <span className={styles.arrowBtn}>
            <ArrowRightIcon width={16} height={16} />
          </span>
        </span>
      </div>
    </Link>
  );
}
