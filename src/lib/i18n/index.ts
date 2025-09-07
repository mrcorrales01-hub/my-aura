import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const SUPPORTED_LANGUAGES_ARRAY = ['sv', 'en', 'es', 'no', 'da', 'fi'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES_ARRAY[number];

export const SUPPORTED_LANGUAGES = [
  { code: 'sv', name: 'Svenska' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'no', name: 'Norsk' },
  { code: 'da', name: 'Dansk' },
  { code: 'fi', name: 'Suomi' }
];

export const DEFAULT_LANGUAGE = 'sv';

export const NAMESPACES = [
  'common',
  'auth', 
  'auri',
  'mood',
  'journal',
  'plan',
  'crisis',
  'exercises',
  'settings'
] as const;
export type Namespace = typeof NAMESPACES[number];

// Detect initial language based on location/timezone/browser
const detectInitialLanguage = (): SupportedLanguage => {
  const stored = localStorage.getItem('aura-lang');
  if (stored && SUPPORTED_LANGUAGES_ARRAY.includes(stored as SupportedLanguage)) {
    return stored as SupportedLanguage;
  }

  const browserLang = navigator.language;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  if (browserLang.startsWith('sv') || timezone === 'Europe/Stockholm') {
    return 'sv';
  }
  
  if (browserLang.startsWith('es')) return 'es';
  if (browserLang.startsWith('da')) return 'da';
  if (browserLang.startsWith('no') || browserLang.startsWith('nb') || browserLang.startsWith('nn')) return 'no';
  if (browserLang.startsWith('fi')) return 'fi';
  
  return 'sv'; // Default to Swedish
};

// Load translation namespace
export const loadNamespace = async (language: SupportedLanguage, namespace: Namespace): Promise<boolean> => {
  try {
    const module = await import(`./locales/${language}/${namespace}.json`);
    i18n.addResourceBundle(language, namespace, module.default, true, true);
    return true;
  } catch (error) {
    console.warn(`Failed to load ${namespace} for ${language}:`, error);
    
    // Fallback to English
    if (language !== 'en') {
      try {
        const fallback = await import(`./locales/en/${namespace}.json`);
        i18n.addResourceBundle(language, namespace, fallback.default, true, true);
      } catch (fallbackError) {
        console.error('Failed to load fallback English namespace:', fallbackError);
      }
    }
    return false;
  }
};

// Load all namespaces for a language
export const loadLanguage = async (language: SupportedLanguage): Promise<void> => {
  const promises = NAMESPACES.map(ns => loadNamespace(language, ns));
  await Promise.all(promises);
  
  // Update document attributes
  document.documentElement.lang = language;
  document.documentElement.dir = 'ltr'; // All supported languages are LTR
  localStorage.setItem('aura-lang', language);
};

// Initialize i18n
const initialLanguage = detectInitialLanguage();

i18n.use(initReactI18next).init({
  lng: initialLanguage,
  fallbackLng: ['en', 'sv'],
  defaultNS: 'common',
  ns: NAMESPACES,
  debug: import.meta.env.DEV,
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
  resources: {}, // Will be loaded dynamically
});

// Load initial namespaces
loadLanguage(initialLanguage);

export { i18n };
export default i18n;