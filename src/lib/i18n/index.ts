import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Get supported languages from env or fallback to these six
const getSupportedLanguages = (): string[] => {
  const envLangs = import.meta.env.VITE_SUPPORTED_LANGS;
  if (envLangs) {
    return envLangs.split(',').map((lang: string) => lang.trim());
  }
  return ['sv', 'en', 'es', 'no', 'da', 'fi'];
};

export const supportedLanguages = getSupportedLanguages();
export type SupportedLanguage = 'sv' | 'en' | 'es' | 'no' | 'da' | 'fi';

export const SUPPORTED_LANGUAGES = [
  { code: 'sv', name: 'Svenska' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'no', name: 'Norsk' },
  { code: 'da', name: 'Dansk' },
  { code: 'fi', name: 'Suomi' }
];

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    supportedLngs: supportedLanguages,
    fallbackLng: ['en', 'sv'],
    defaultNS: 'common',
    ns: ['common', 'auri', 'roleplay', 'exercises'],
    debug: import.meta.env.DEV,
    
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    
    react: {
      useSuspense: true,
    },
    
    interpolation: {
      escapeValue: false,
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'aura-lang',
      caches: ['localStorage'],
    },
  });

export default i18n;