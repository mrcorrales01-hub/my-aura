import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { languages, detectLanguage, getLanguage, isRTL, Language } from '@/lib/i18n';

// Dynamic imports for translation files
const translationCache: Record<string, any> = {};

const loadTranslation = async (languageCode: string): Promise<any> => {
  if (translationCache[languageCode]) {
    return translationCache[languageCode];
  }

  try {
    const translation = await import(`../translations/${languageCode}.json`);
    translationCache[languageCode] = translation.default;
    return translation.default;
  } catch (error) {
    console.warn(`Translation file for ${languageCode} not found, falling back to English`);
    if (!translationCache.en) {
      const enTranslation = await import('../translations/en.json');
      translationCache.en = enTranslation.default;
    }
    return translationCache.en;
  }
};

interface I18nContextType {
  currentLanguage: string;
  currentLang: Language;
  setLanguage: (code: string) => void;
  t: (key: string, params?: Record<string, string>) => string;
  isRTL: boolean;
  languages: Language[];
  loading: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

interface I18nProviderProps {
  children: ReactNode;
}

export const I18nProvider = ({ children }: I18nProviderProps) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => detectLanguage());
  const [translations, setTranslations] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const currentLang = getLanguage(currentLanguage);
  const rtl = isRTL(currentLanguage);

  useEffect(() => {
    const loadCurrentTranslation = async () => {
      setLoading(true);
      const translation = await loadTranslation(currentLanguage);
      setTranslations(translation);
      setLoading(false);
    };

    loadCurrentTranslation();
  }, [currentLanguage]);

  useEffect(() => {
    // Update document attributes for RTL support and language
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLanguage;
    
    // Update CSS classes for styling
    document.documentElement.className = rtl ? 'rtl' : 'ltr';
    
    // Store language preference
    localStorage.setItem('aura-language', currentLanguage);
  }, [currentLanguage, rtl]);

  const setLanguage = (code: string) => {
    const lang = languages.find(l => l.code === code);
    if (lang) {
      setCurrentLanguage(code);
    }
  };

  const t = (key: string, params?: Record<string, string>): string => {
    if (loading) return key;

    const keys = key.split('.');
    let value = translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key "${key}" not found for language "${currentLanguage}"`);
        return key;
      }
    }

    if (typeof value !== 'string') {
      console.warn(`Translation key "${key}" is not a string for language "${currentLanguage}"`);
      return key;
    }

    // Replace parameters
    if (params) {
      return Object.entries(params).reduce(
        (text, [param, val]) => text.replace(new RegExp(`{${param}}`, 'g'), val),
        value
      );
    }

    return value;
  };

  return (
    <I18nContext.Provider 
      value={{ 
        currentLanguage, 
        currentLang,
        setLanguage, 
        t, 
        isRTL: rtl, 
        languages,
        loading 
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};