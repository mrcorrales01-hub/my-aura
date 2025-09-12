import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

export const SUPPORTED_LANGUAGES = [
  { code: 'sv', name: 'Svenska' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'no', name: 'Norsk' },
  { code: 'da', name: 'Dansk' },
  { code: 'fi', name: 'Suomi' }
];

// Safe translation helper that provides fallbacks
export const safeT = (t: any) => (key: string, defaultValue: string) => 
  t(key, { defaultValue });

// Initialize language from localStorage on startup
const initLang = () => {
  const stored = localStorage.getItem('aura.lang');
  if (stored && ['sv', 'en', 'es', 'no', 'da', 'fi'].includes(stored)) {
    i18n.changeLanguage(stored);
  } else {
    i18n.changeLanguage('sv');
  }
};

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    supportedLngs: ['sv', 'en', 'es', 'no', 'da', 'fi'],
    fallbackLng: ['sv', 'en'],
    defaultNS: 'common',
    ns: ['common', 'auth', 'home', 'auri', 'roleplay', 'profile', 'visit', 'pricing', 'coach', 'screeners', 'timeline', 'crisis', 'nav'],
    debug: import.meta.env.DEV,
    
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    
    react: {
      useSuspense: false,
    },
    
    interpolation: {
      escapeValue: false,
    },
    
    detection: {
      order: ['localStorage', 'htmlTag', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'aura.lang',
    },
  })
  .then(() => {
    // Apply language to HTML element
    document.documentElement.lang = i18n.language || 'sv';
  });

// Initialize language on startup
initLang();

// Track used keys for health checks
const used = new Set<string>();
const origT = i18n.t.bind(i18n);
// @ts-ignore
i18n.t = ((key: any, opt?: any) => { 
  if (typeof key === 'string') used.add(key); 
  return origT(key, opt); 
}) as any;
// @ts-ignore
(window as any).__i18nKeysUsed = used;

export default i18n;