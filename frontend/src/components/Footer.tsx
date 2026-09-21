import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { clinicInfo } from "../config/clinicInfo";
import { MapPinIcon, PhoneIcon, WhatsAppIcon } from "./icons/DentalIcons";
import styles from "./Footer.module.css";

export function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.about}>
          <h3 className={styles.brand}>{clinicInfo.name}</h3>
          <p className={styles.tagline}>
            {clinicInfo.doctorName}, {clinicInfo.qualification}
          </p>
          <p className={styles.location}>{clinicInfo.location}</p>
        </div>

        <div className={styles.column}>
          <h4>{t("footer.quickLinks")}</h4>
          <ul>
            <li>
              <NavLink to="/">{t("nav.home")}</NavLink>
            </li>
            <li>
              <NavLink to="/about">{t("nav.about")}</NavLink>
            </li>
            <li>
              <NavLink to="/services">{t("nav.services")}</NavLink>
            </li>
            <li>
              <NavLink to="/gallery">{t("nav.gallery")}</NavLink>
            </li>
            <li>
              <NavLink to="/contact">{t("nav.contact")}</NavLink>
            </li>
          </ul>
        </div>

        <div className={styles.column}>
          <h4>{t("footer.patient")}</h4>
          <ul>
            <li>
              <NavLink to="/book-op">{t("common.bookOp")}</NavLink>
            </li>
            <li>
              <NavLink to="/contact?intent=enquiry">{t("common.enquiries")}</NavLink>
            </li>
          </ul>
        </div>

        <div className={styles.column}>
          <h4>{t("footer.contact")}</h4>
          <ul className={styles.contactList}>
            <li>
              <a href={clinicInfo.phoneHref}>
                <PhoneIcon width={16} height={16} /> {t("common.callClinic")}
              </a>
            </li>
            <li>
              <a href={`https://wa.me/${clinicInfo.whatsappNumber}`} target="_blank" rel="noreferrer">
                <WhatsAppIcon width={16} height={16} /> {t("common.whatsapp")}
              </a>
            </li>
            <li>
              <a href={clinicInfo.googleMapsUrl} target="_blank" rel="noreferrer">
                <MapPinIcon width={16} height={16} /> {t("common.googleMaps")}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <div className="container">
          <p>
            © {year} {clinicInfo.name}. {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
