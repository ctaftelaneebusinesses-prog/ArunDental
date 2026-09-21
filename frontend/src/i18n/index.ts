import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import te from "./locales/te.json";
import ta from "./locales/ta.json";
import kn from "./locales/kn.json";

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "te", label: "తెలుగు" },
  { code: "ta", label: "தமிழ்" },
  { code: "kn", label: "ಕನ್ನಡ" },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

const LANGUAGE_STORAGE_KEY = "adc-language";

function getStoredLanguage(): string {
  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && SUPPORTED_LANGUAGES.some((lang) => lang.code === stored)) {
      return stored;
    }
  } catch {
    // localStorage unavailable (private browsing, etc.) — fall back to default
  }
  return "en";
}

export function setStoredLanguage(code: string): void {
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
  } catch {
    // ignore — language will still switch for this session
  }
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    te: { translation: te },
    ta: { translation: ta },
    kn: { translation: kn },
  },
  lng: getStoredLanguage(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  returnEmptyString: false,
});

export default i18n;
