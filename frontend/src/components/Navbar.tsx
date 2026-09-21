import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { clinicInfo } from "../config/clinicInfo";
import { CloseIcon, MenuIcon, ToothIcon } from "./icons/DentalIcons";
import { LanguageSwitcher } from "./LanguageSwitcher";
import styles from "./Navbar.module.css";

export function Navbar() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { to: "/", label: t("nav.home") },
    { to: "/about", label: t("nav.about") },
    { to: "/services", label: t("nav.services") },
    { to: "/gallery", label: t("nav.gallery") },
    { to: "/contact", label: t("nav.contact") },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.bar}>
        <NavLink to="/" className={styles.brand} aria-label={`${clinicInfo.name} home`}>
          <ToothIcon className={styles.brandMark} width={44} height={44} strokeWidth={1.4} aria-hidden="true" />
          <span className={styles.brandText}>
            <span className={styles.brandName}>{clinicInfo.name}</span>
            <span className={styles.brandTag}>
              {clinicInfo.doctorName}, {clinicInfo.qualification}
            </span>
          </span>
        </NavLink>

        <nav className={styles.desktopNav} aria-label="Primary navigation">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.ctaGroup}>
          <LanguageSwitcher />
          <NavLink to="/contact?intent=enquiry" className="btn btn-secondary btn-sm">
            {t("common.enquiries")}
          </NavLink>
          <NavLink to="/book-op" className="btn btn-primary btn-sm">
            {t("common.bookOp")}
          </NavLink>
        </div>

        <button
          type="button"
          className={styles.menuToggle}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((v) => !v)}
        >
          {isOpen ? <CloseIcon width={24} height={24} /> : <MenuIcon width={24} height={24} />}
        </button>
      </div>

      {isOpen && (
        <div className={styles.mobilePanel} role="dialog" aria-label="Mobile navigation">
          <nav className={styles.mobileNav}>
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) => `${styles.mobileLink} ${isActive ? styles.mobileLinkActive : ""}`}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className={styles.mobileLanguage}>
            <LanguageSwitcher />
          </div>
          <div className={styles.mobileCtas}>
            <NavLink to="/book-op" className="btn btn-primary btn-block">
              {t("common.bookOp")}
            </NavLink>
            <NavLink to="/contact?intent=enquiry" className="btn btn-secondary btn-block">
              {t("common.enquiries")}
            </NavLink>
          </div>
        </div>
      )}
    </header>
  );
}
