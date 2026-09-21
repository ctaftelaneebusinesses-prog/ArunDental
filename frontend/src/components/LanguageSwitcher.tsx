import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES, setStoredLanguage } from "../i18n";
import styles from "./LanguageSwitcher.module.css";

export function LanguageSwitcher({ variant = "light" }: { variant?: "light" | "dark" }) {
  const { i18n, t } = useTranslation();

  function handleChange(code: string) {
    i18n.changeLanguage(code);
    setStoredLanguage(code);
  }

  return (
    <label className={`${styles.wrap} ${variant === "dark" ? styles.dark : ""}`}>
      <span className="visually-hidden">{t("nav.language")}</span>
      <select
        value={i18n.resolvedLanguage ?? "en"}
        onChange={(e) => handleChange(e.target.value)}
        className={styles.select}
        aria-label={t("nav.language")}
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </label>
  );
}
