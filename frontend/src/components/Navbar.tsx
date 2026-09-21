import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { clinicInfo } from "../config/clinicInfo";
import { CloseIcon, MenuIcon } from "./icons/DentalIcons";
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
    <header className={styles.header} data-print-hide>
      <div className={styles.bar}>
        <NavLink to="/" className={styles.brand} aria-label={`${clinicInfo.name} home`}>
          <img src="/assets/brand/logo.png" alt="" className={styles.brandMark} width={48} height={48} />
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
          <NavLink to="/book-op" className="btn btn-primary btn-sm">
            {t("common.bookOp")}
          </NavLink>
          <a
            href="https://craftlanee.com/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.powered}
            aria-label={`${t("footer.poweredBy")} CraftLanee`}
          >
            <span className={styles.poweredText}>{t("footer.poweredBy")}</span>
            <img src="/assets/craftlanee-logo-mark.png" alt="CraftLanee" className={styles.poweredLogo} />
          </a>
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
          </div>
          <a
            href="https://craftlanee.com/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.mobilePowered}
            aria-label={`${t("footer.poweredBy")} CraftLanee`}
          >
            <span className={styles.poweredText}>{t("footer.poweredBy")}</span>
            <img src="/assets/craftlanee-logo-mark.png" alt="CraftLanee" className={styles.poweredLogo} />
          </a>
        </div>
      )}
    </header>
  );
}
