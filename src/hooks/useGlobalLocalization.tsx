import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type GlobalLanguage = 'en' | 'es' | 'zh' | 'sv' | 'fr' | 'de' | 'ja' | 'pt' | 'ar' | 'hi' | 'ru' | 'it';

interface GlobalLanguageContextType {
  language: GlobalLanguage;
  currentLanguage: GlobalLanguage;
  setLanguage: (lang: GlobalLanguage) => void;
  t: (key: string, params?: Record<string, string>) => string;
  isRTL: boolean;
  currency: string;
  emergencyNumber: string;
  timeZone: string;
}

export const globalLanguages = [
  { code: 'en' as const, name: 'English', flag: '🇺🇸', rtl: false, currency: 'USD', emergency: '911', timezone: 'America/New_York' },
  { code: 'es' as const, name: 'Español', flag: '🇪🇸', rtl: false, currency: 'EUR', emergency: '112', timezone: 'Europe/Madrid' },
  { code: 'zh' as const, name: '中文', flag: '🇨🇳', rtl: false, currency: 'CNY', emergency: '110', timezone: 'Asia/Shanghai' },
  { code: 'sv' as const, name: 'Svenska', flag: '🇸🇪', rtl: false, currency: 'SEK', emergency: '112', timezone: 'Europe/Stockholm' },
  { code: 'fr' as const, name: 'Français', flag: '🇫🇷', rtl: false, currency: 'EUR', emergency: '112', timezone: 'Europe/Paris' },
  { code: 'de' as const, name: 'Deutsch', flag: '🇩🇪', rtl: false, currency: 'EUR', emergency: '112', timezone: 'Europe/Berlin' },
  { code: 'ja' as const, name: '日本語', flag: '🇯🇵', rtl: false, currency: 'JPY', emergency: '110', timezone: 'Asia/Tokyo' },
  { code: 'pt' as const, name: 'Português', flag: '🇵🇹', rtl: false, currency: 'EUR', emergency: '112', timezone: 'Europe/Lisbon' },
  { code: 'ar' as const, name: 'العربية', flag: '🇸🇦', rtl: true, currency: 'SAR', emergency: '997', timezone: 'Asia/Riyadh' },
  { code: 'hi' as const, name: 'हिन्दी', flag: '🇮🇳', rtl: false, currency: 'INR', emergency: '112', timezone: 'Asia/Kolkata' },
  { code: 'ru' as const, name: 'Русский', flag: '🇷🇺', rtl: false, currency: 'RUB', emergency: '112', timezone: 'Europe/Moscow' },
  { code: 'it' as const, name: 'Italiano', flag: '🇮🇹', rtl: false, currency: 'EUR', emergency: '112', timezone: 'Europe/Rome' }
];

const GlobalLanguageContext = createContext<GlobalLanguageContextType | undefined>(undefined);

export const useGlobalLocalization = () => {
  const context = useContext(GlobalLanguageContext);
  if (!context) {
    throw new Error('useGlobalLocalization must be used within a GlobalLanguageProvider');
  }
  return context;
};

// Enhanced translations with cultural context
const globalTranslations = {
  en: {
    // Core app features
    'app.name': 'Aura Wellness',
    'app.tagline': 'Your global wellness companion',
    'culture.greeting.formal': 'Good morning',
    'culture.greeting.casual': 'Hey there!',
    'culture.wellness.concept': 'Mental wellness is about balance and self-care',
    'emergency.cultural.note': 'Mental health support is available 24/7',
    'payment.currency.symbol': '$',
    'time.format': '12h',
    
    // Global features
    'global.offline.available': 'Available offline',
    'global.sync.pending': 'Syncing when online...',
    'global.location.detected': 'Location detected',
    'global.timezone.adjusted': 'Times adjusted for your timezone',
    'global.emergency.local': 'Local emergency services',
    'global.crisis.hotline': 'Crisis hotline',
    
    // Premium global features
    'premium.human.coaching': 'Human Coaching Sessions',
    'premium.group.therapy': 'Group Therapy Access',
    'premium.family.plan': 'Family Plan',
    'premium.corporate.wellness': 'Corporate Wellness Program',
    'premium.ai.advanced': 'Advanced AI with Cultural Context',
    'premium.analytics.predictive': 'Predictive Wellness Analytics',
    
    // Mobile features
    'mobile.biometric.auth': 'Biometric Authentication',
    'mobile.notifications.smart': 'Smart Notifications',
    'mobile.offline.mode': 'Offline Mode Available',
    'mobile.health.integration': 'Health App Integration'
  },
  // Add other language translations here...
  es: {
    'app.name': 'Aura Bienestar',
    'app.tagline': 'Tu compañero global de bienestar',
    'culture.greeting.formal': 'Buenos días',
    'culture.greeting.casual': '¡Hola!',
    'culture.wellness.concept': 'El bienestar mental es equilibrio y autocuidado',
    'emergency.cultural.note': 'Apoyo de salud mental disponible 24/7',
    'payment.currency.symbol': '€',
    'time.format': '24h'
  },
  fr: {
    'app.name': 'Aura Bien-être',
    'app.tagline': 'Votre compagnon mondial du bien-être',
    'culture.greeting.formal': 'Bonjour',
    'culture.greeting.casual': 'Salut !',
    'culture.wellness.concept': 'Le bien-être mental, c\'est l\'équilibre et les soins personnels',
    'emergency.cultural.note': 'Soutien en santé mentale disponible 24h/24',
    'payment.currency.symbol': '€',
    'time.format': '24h'
  },
  de: {
    'app.name': 'Aura Wellness',
    'app.tagline': 'Ihr globaler Wellness-Begleiter',
    'culture.greeting.formal': 'Guten Morgen',
    'culture.greeting.casual': 'Hallo!',
    'culture.wellness.concept': 'Mentales Wohlbefinden bedeutet Balance und Selbstfürsorge',
    'emergency.cultural.note': 'Unterstützung für psychische Gesundheit rund um die Uhr verfügbar',
    'payment.currency.symbol': '€',
    'time.format': '24h'
  },
  ar: {
    'app.name': 'أورا للعافية',
    'app.tagline': 'رفيقك العالمي للعافية',
    'culture.greeting.formal': 'صباح الخير',
    'culture.greeting.casual': 'أهلاً!',
    'culture.wellness.concept': 'العافية النفسية تعني التوازن والعناية بالذات',
    'emergency.cultural.note': 'دعم الصحة النفسية متاح على مدار الساعة',
    'payment.currency.symbol': 'ر.س',
    'time.format': '12h'
  },
  hi: {
    'app.name': 'ऑरा वेलनेस',
    'app.tagline': 'आपका वैश्विक कल्याण साथी',
    'culture.greeting.formal': 'नमस्ते',
    'culture.greeting.casual': 'हैलो!',
    'culture.wellness.concept': 'मानसिक कल्याण संतुलन और स्व-देखभाल के बारे में है',
    'emergency.cultural.note': 'मानसिक स्वास्थ्य सहायता 24/7 उपलब्ध है',
    'payment.currency.symbol': '₹',
    'time.format': '12h'
  },
  ja: {
    'app.name': 'アウラウェルネス',
    'app.tagline': 'あなたのグローバルウェルネスコンパニオン',
    'culture.greeting.formal': 'おはようございます',
    'culture.greeting.casual': 'こんにちは！',
    'culture.wellness.concept': 'メンタルウェルネスはバランスとセルフケアです',
    'emergency.cultural.note': 'メンタルヘルスサポートは24時間利用可能',
    'payment.currency.symbol': '¥',
    'time.format': '24h'
  },
  zh: {
    'app.name': '灵气健康',
    'app.tagline': '您的全球健康伴侣',
    'culture.greeting.formal': '早上好',
    'culture.greeting.casual': '你好！',
    'culture.wellness.concept': '心理健康是关于平衡和自我关怀',
    'emergency.cultural.note': '心理健康支持全天候可用',
    'payment.currency.symbol': '¥',
    'time.format': '24h'
  },
  pt: {
    'app.name': 'Aura Bem-estar',
    'app.tagline': 'Seu companheiro global de bem-estar',
    'culture.greeting.formal': 'Bom dia',
    'culture.greeting.casual': 'Olá!',
    'culture.wellness.concept': 'Bem-estar mental é sobre equilíbrio e autocuidado',
    'emergency.cultural.note': 'Apoio de saúde mental disponível 24/7',
    'payment.currency.symbol': '€',
    'time.format': '24h'
  },
  ru: {
    'app.name': 'Аура Велнес',
    'app.tagline': 'Ваш глобальный спутник здоровья',
    'culture.greeting.formal': 'Доброе утро',
    'culture.greeting.casual': 'Привет!',
    'culture.wellness.concept': 'Психическое здоровье - это баланс и забота о себе',
    'emergency.cultural.note': 'Поддержка психического здоровья доступна 24/7',
    'payment.currency.symbol': '₽',
    'time.format': '24h'
  },
  it: {
    'app.name': 'Aura Benessere',
    'app.tagline': 'Il tuo compagno globale del benessere',
    'culture.greeting.formal': 'Buongiorno',
    'culture.greeting.casual': 'Ciao!',
    'culture.wellness.concept': 'Il benessere mentale riguarda equilibrio e cura di sé',
    'emergency.cultural.note': 'Supporto per la salute mentale disponibile 24/7',
    'payment.currency.symbol': '€',
    'time.format': '24h'
  },
  sv: {
    'app.name': 'Aura Välmående',
    'app.tagline': 'Din globala välmående-följeslagare',
    'culture.greeting.formal': 'God morgon',
    'culture.greeting.casual': 'Hej!',
    'culture.wellness.concept': 'Mental hälsa handlar om balans och egenvård',
    'emergency.cultural.note': 'Stöd för mental hälsa tillgängligt 24/7',
    'payment.currency.symbol': 'kr',
    'time.format': '24h'
  }
};

export const GlobalLanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<GlobalLanguage>('en');
  const { toast } = useToast();

  const currentLangData = globalLanguages.find(lang => lang.code === language) || globalLanguages[0];

  useEffect(() => {
    const savedLanguage = localStorage.getItem('aura-global-language') as GlobalLanguage;
    if (savedLanguage && globalLanguages.some(lang => lang.code === savedLanguage)) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = async (lang: GlobalLanguage) => {
    try {
      setLanguageState(lang);
      localStorage.setItem('aura-global-language', lang);

      // Map to local app language set
      const mapToLocal = (g: GlobalLanguage): 'en' | 'es' | 'zh' | 'sv' => {
        switch (g) {
          case 'en':
          case 'es':
          case 'zh':
          case 'sv':
            return g;
          default:
            return 'en';
        }
      };
      const localLang = mapToLocal(lang);
      localStorage.setItem('aura-language', localLang);
      window.dispatchEvent(new CustomEvent('aura-language-changed', { detail: localLang }));
      
      // Update document direction for RTL languages (use selected lang, not previous state)
      const selected = globalLanguages.find(l => l.code === lang) || globalLanguages[0];
      document.dir = selected.rtl ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
      
      toast({
        title: "Language updated",
        description: `Switched to ${globalLanguages.find(l => l.code === lang)?.name}`,
      });
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  };

  const t = (key: string, params?: Record<string, string>) => {
    const translations = globalTranslations[language] || globalTranslations.en;
    let translation = translations[key] || key;

    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        translation = translation.replace(`{${paramKey}}`, value);
      });
    }

    return translation;
  };

  return (
    <GlobalLanguageContext.Provider value={{
      language,
      currentLanguage: language,
      setLanguage,
      t,
      isRTL: currentLangData.rtl,
      currency: currentLangData.currency,
      emergencyNumber: currentLangData.emergency,
      timeZone: currentLangData.timezone
    }}>
      {children}
    </GlobalLanguageContext.Provider>
  );
};