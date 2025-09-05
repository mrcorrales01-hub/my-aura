import i18n from "i18next";
import { initReactI18next } from "react-i18next";

export const SUPPORTED_LANGUAGES = ["sv", "en", "es", "da", "no", "fi"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

// Detect initial language based on location/timezone/browser
const detectInitialLanguage = (): SupportedLanguage => {
  // Check if Swedish based on browser language or timezone
  const browserLang = navigator.language;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  if (browserLang.startsWith("sv") || timezone === "Europe/Stockholm") {
    return "sv";
  }
  
  // Map other languages
  if (browserLang.startsWith("es")) return "es";
  if (browserLang.startsWith("da")) return "da";
  if (browserLang.startsWith("no") || browserLang.startsWith("nb") || browserLang.startsWith("nn")) return "no";
  if (browserLang.startsWith("fi")) return "fi";
  
  return "en"; // Default fallback
};

export const loadLocale = async (language: SupportedLanguage): Promise<boolean> => {
  try {
    const module = await import(`./locales/${language}.json`);
    i18n.addResourceBundle(language, "translation", module.default, true, true);
    
    // Update document attributes
    document.documentElement.lang = language;
    document.documentElement.dir = "ltr"; // All supported languages are LTR
    
    return true;
  } catch (error) {
    console.warn(`Failed to load locale ${language}:`, error);
    // Fallback to English
    if (language !== "en") {
      try {
        const fallback = await import(`./locales/en.json`);
        i18n.addResourceBundle(language, "translation", fallback.default, true, true);
      } catch (fallbackError) {
        console.error('Failed to load fallback English locale:', fallbackError);
      }
    }
    return false;
  }
};

// Initialize i18n
const initialLanguage = detectInitialLanguage();

i18n.use(initReactI18next).init({
  lng: initialLanguage,
  fallbackLng: "en",
  debug: false,
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
  resources: {}, // Will be loaded dynamically
});

// Load initial locale
loadLocale(initialLanguage);

export default i18n;