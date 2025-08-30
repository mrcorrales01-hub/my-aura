import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const LANGS = ["en","sv","es","de","fr","pt","it","nl","ru","ar","tr","zh-Hans","zh-Hant","ja","ko","hi","bn","pl","fa","th","vi","fil"] as const;
export type Lang = typeof LANGS[number];

export const RTL_LANGUAGES = ["ar", "fa"] as const;

export async function loadLocale(lang: Lang) {
  try {
    const mod = await import(`@/locales/${lang}.json`);
    i18n.addResourceBundle(lang, "translation", mod.default, true, true);
  } catch (error) {
    console.warn(`Failed to load locale ${lang}, falling back to English`);
    if (lang !== "en") {
      const enMod = await import(`@/locales/en.json`);
      i18n.addResourceBundle(lang, "translation", enMod.default, true, true);
    }
  }
}

// Initialize i18next
await i18n.use(initReactI18next).init({
  resources: {}, // filled by loadLocale on demand
  lng: localStorage.getItem("aura.lang") ?? "sv",
  fallbackLng: "en",
  interpolation: { 
    escapeValue: false 
  },
  react: {
    useSuspense: false
  }
});

export async function setLanguage(lang: Lang) {
  await loadLocale(lang);
  await i18n.changeLanguage(lang);
  localStorage.setItem("aura.lang", lang);
  document.documentElement.dir = RTL_LANGUAGES.includes(lang as any) ? "rtl" : "ltr";
  document.documentElement.lang = lang;
}

// Load initial language
const initial = (localStorage.getItem("aura.lang") ?? "sv") as Lang;
if (LANGS.includes(initial)) {
  await loadLocale(initial);
  await i18n.changeLanguage(initial);
  document.documentElement.dir = RTL_LANGUAGES.includes(initial as any) ? "rtl" : "ltr";
  document.documentElement.lang = initial;
}

export { LANGS };
export default i18n;