import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Reveal } from "./Reveal";
import { ArrowRightIcon } from "./icons/DentalIcons";
import styles from "./CtaBanner.module.css";

/** Closing call-to-action band reused at the foot of inner pages. */
export function CtaBanner() {
  const { t } = useTranslation();

  return (
    <section className={styles.section}>
      <Reveal className="container">
        <div className={styles.banner}>
          <div className={styles.glow} aria-hidden="true" />
          <div className={styles.text}>
            <h2>{t("home.cta.heading")}</h2>
            <p>{t("home.cta.text")}</p>
          </div>
          <div className={styles.actions}>
            <Link to="/book-op" className={`btn btn-primary ${styles.primary}`}>
              {t("common.bookOp")}
              <ArrowRightIcon width={18} height={18} />
            </Link>
            <Link to="/contact?intent=enquiry" className="btn btn-on-dark">
              {t("common.enquiries")}
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
