import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl?: boolean;
}

export const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)', flag: '🇧🇷' },
  { code: 'pt-PT', name: 'Portuguese (Portugal)', nativeName: 'Português (Portugal)', flag: '🇵🇹' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
];

// Basic translations for core app features
const translations: Record<string, Record<string, string>> = {
  en: {
    'app.name': 'My Aura',
    'app.tagline': 'Real-time AI coach for mental health & relationships',
    'nav.home': 'Home',
    'nav.dashboard': 'Dashboard',
    'nav.coach': 'Coach Chat',
    'nav.live': 'Live Session',
    'nav.exercises': 'Exercises',
    'nav.journal': 'Journal',
    'nav.goals': 'Goals',
    'nav.relationships': 'Relationships',
    'nav.resources': 'Resources',
    'nav.settings': 'Settings',
    'auth.login': 'Sign In',
    'auth.signup': 'Sign Up',
    'auth.logout': 'Sign Out',
    'welcome.title': 'Welcome to My Aura',
    'welcome.subtitle': 'Your personal space for mental health and emotional well-being',
    'pricing.free': 'Free',
    'pricing.plus': 'Plus',
    'pricing.pro': 'Pro',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.continue': 'Continue',
  },
  sv: {
    'app.name': 'My Aura',
    'app.tagline': 'AI-coach i realtid för mental hälsa och relationer',
    'nav.home': 'Hem',
    'nav.dashboard': 'Översikt',
    'nav.coach': 'Coach Chat',
    'nav.live': 'Live Session',
    'nav.exercises': 'Övningar',
    'nav.journal': 'Dagbok',
    'nav.goals': 'Mål',
    'nav.relationships': 'Relationer',
    'nav.resources': 'Resurser',
    'nav.settings': 'Inställningar',
    'auth.login': 'Logga In',
    'auth.signup': 'Registrera',
    'auth.logout': 'Logga Ut',
    'welcome.title': 'Välkommen till My Aura',
    'welcome.subtitle': 'Ditt personliga utrymme för mental hälsa och emotionellt välbefinnande',
    'pricing.free': 'Gratis',
    'pricing.plus': 'Plus',
    'pricing.pro': 'Pro',
    'common.loading': 'Laddar...',
    'common.error': 'Fel',
    'common.save': 'Spara',
    'common.cancel': 'Avbryt',
    'common.continue': 'Fortsätt',
  }
};

interface I18nContextType {
  currentLanguage: string;
  setLanguage: (code: string) => void;
  t: (key: string, params?: Record<string, string>) => string;
  isRTL: boolean;
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
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    const saved = localStorage.getItem('aura-language');
    if (saved) return saved;
    
    // Auto-detect from browser
    const browserLang = navigator.language.toLowerCase();
    const supported = languages.find(lang => 
      browserLang.startsWith(lang.code.toLowerCase()) ||
      lang.code.toLowerCase().startsWith(browserLang.split('-')[0])
    );
    return supported?.code || 'en';
  });

  const setLanguage = (code: string) => {
    setCurrentLanguage(code);
    localStorage.setItem('aura-language', code);
  };

  const t = (key: string, params?: Record<string, string>) => {
    const translation = translations[currentLanguage]?.[key] || translations.en[key] || key;
    
    if (params) {
      return Object.entries(params).reduce(
        (text, [param, value]) => text.replace(`{${param}}`, value),
        translation
      );
    }
    
    return translation;
  };

  const currentLang = languages.find(lang => lang.code === currentLanguage);
  const isRTL = currentLang?.rtl || false;

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage, isRTL]);

  return (
    <I18nContext.Provider value={{ currentLanguage, setLanguage, t, isRTL }}>
      {children}
    </I18nContext.Provider>
  );
};