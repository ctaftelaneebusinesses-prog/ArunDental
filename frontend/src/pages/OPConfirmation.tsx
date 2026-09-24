import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PageMeta } from "../components/PageMeta";
import { buildWhatsAppLink, clinicInfo } from "../config/clinicInfo";
import { WhatsAppIcon } from "../components/icons/DentalIcons";
import type { OpConfirmationResult } from "../types";
import { patientConfirmationRequestText } from "../utils/contactLinks";
import styles from "./OPConfirmation.module.css";

function formatDate(value: string): string {
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function OPConfirmation() {
  const { t } = useTranslation();
  const location = useLocation();
  const result = (location.state as { result?: OpConfirmationResult } | null)?.result;

  if (!result) {
    return (
      <section className={styles.section}>
        <div className={`container ${styles.missingWrap}`}>
          <h1>{t("opConfirmation.noResultTitle")}</h1>
          <p>{t("opConfirmation.noResultText")}</p>
          <Link to="/book-op" className="btn btn-primary">
            {t("common.bookOp")}
          </Link>
        </div>
      </section>
    );
  }

  const whatsappMessage = patientConfirmationRequestText(result);

  return (
    <>
      <PageMeta
        title={t("opConfirmation.meta.title")}
        description={t("opConfirmation.meta.description")}
        path="/op-confirmation"
      />

      <section className={styles.section}>
        <div className={`container ${styles.wrap}`}>
          <div className={`${styles.noPrint} ${styles.successBanner}`}>
            <h1>{t("opConfirmation.successTitle")}</h1>
            <p>{t("opConfirmation.successText")}</p>
          </div>

          <div className={`card ${styles.slip}`} id="op-slip">
            <div className={styles.slipHeader}>
              <div>
                <h2 className={styles.clinicName}>{clinicInfo.name}</h2>
                <p className={styles.clinicLocation}>{clinicInfo.location}</p>
              </div>
              <div className={styles.opBadge}>
                <span>{t("opConfirmation.opNumberLabel")}</span>
                <strong>{result.opNumber}</strong>
              </div>
            </div>

            <dl className={styles.detailsGrid}>
              <div>
                <dt>{t("opConfirmation.patientName")}</dt>
                <dd>{result.patientName}</dd>
              </div>
              <div>
                <dt>{t("opConfirmation.appointmentDate")}</dt>
                <dd>{formatDate(result.appointmentDate)}</dd>
              </div>
              <div>
                <dt>{t("opConfirmation.appointmentTime")}</dt>
                <dd>{result.appointmentTime || t("opConfirmation.timeTbc")}</dd>
              </div>
              <div>
                <dt>{t("opConfirmation.doctor")}</dt>
                <dd>
                  {result.doctorName}, {result.qualification}
                </dd>
              </div>
            </dl>

            <p className={styles.slipFooter}>{t("opConfirmation.footerNote")}</p>
          </div>

          <div className={`${styles.noPrint} ${styles.actions}`}>
            <button type="button" className="btn btn-primary" onClick={() => window.print()}>
              {t("opConfirmation.downloadSlip")}
            </button>
            <a
              href={buildWhatsAppLink(whatsappMessage)}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary"
            >
              <WhatsAppIcon width={18} height={18} /> {t("opConfirmation.whatsappConfirmation")}
            </a>
            <Link to="/" className="btn btn-secondary">
              {t("common.backToHome")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
