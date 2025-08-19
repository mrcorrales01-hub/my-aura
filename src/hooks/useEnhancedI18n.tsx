import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { languages, detectLanguage, getLanguage, isRTL, Language } from '@/lib/i18n';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Dynamic imports for translation files with enhanced caching
const translationCache: Record<string, any> = {};
const loadingPromises: Record<string, Promise<any>> = {};

const loadTranslation = async (languageCode: string): Promise<any> => {
  if (translationCache[languageCode]) {
    return translationCache[languageCode];
  }

  if (loadingPromises[languageCode]) {
    return loadingPromises[languageCode];
  }

  loadingPromises[languageCode] = (async () => {
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
  })();

  return loadingPromises[languageCode];
};

interface EnhancedI18nContextType {
  currentLanguage: string;
  currentLang: Language;
  setLanguage: (code: string) => Promise<void>;
  t: (key: string, params?: Record<string, string>) => string;
  isRTL: boolean;
  languages: Language[];
  loading: boolean;
  refreshTranslations: () => Promise<void>;
}

const EnhancedI18nContext = createContext<EnhancedI18nContextType | undefined>(undefined);

export const useI18n = () => {
  const context = useContext(EnhancedI18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an EnhancedI18nProvider');
  }
  return context;
};

interface EnhancedI18nProviderProps {
  children: ReactNode;
}

export const EnhancedI18nProvider = ({ children }: EnhancedI18nProviderProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentLanguage, setCurrentLanguage] = useState(() => detectLanguage());
  const [translations, setTranslations] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const currentLang = getLanguage(currentLanguage);
  const rtl = isRTL(currentLanguage);

  // Load translations for current language
  const loadCurrentTranslation = useCallback(async (languageCode: string) => {
    setLoading(true);
    try {
      const translation = await loadTranslation(languageCode);
      setTranslations(translation);
    } catch (error) {
      console.error('Failed to load translation:', error);
      toast({
        title: "Translation Error",
        description: "Failed to load language pack. Using English as fallback.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Initialize language from user profile or localStorage
  useEffect(() => {
    const initializeLanguage = async () => {
      let selectedLanguage = currentLanguage;

      if (user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('language_preference')
            .eq('id', user.id)
            .single();

          if (profile?.language_preference && 
              languages.find(lang => lang.code === profile.language_preference)) {
            selectedLanguage = profile.language_preference;
          }
        } catch (error) {
          console.error('Failed to load language preference:', error);
        }
      }

      if (selectedLanguage !== currentLanguage) {
        setCurrentLanguage(selectedLanguage);
      }
      
      await loadCurrentTranslation(selectedLanguage);
    };

    initializeLanguage();
  }, [user, loadCurrentTranslation]);

  // Update document attributes and localStorage when language changes
  useEffect(() => {
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLanguage;
    document.documentElement.className = rtl ? 'rtl' : 'ltr';
    
    localStorage.setItem('aura-language', currentLanguage);
    
    // Add CSS classes for better responsive handling
    document.body.setAttribute('data-language', currentLanguage);
    document.body.setAttribute('data-rtl', rtl.toString());
    
    // Update CSS custom properties for layout adjustments
    const root = document.documentElement;
    root.style.setProperty('--text-direction', rtl ? 'rtl' : 'ltr');
    root.style.setProperty('--start', rtl ? 'right' : 'left');
    root.style.setProperty('--end', rtl ? 'left' : 'right');
  }, [currentLanguage, rtl]);

  // Enhanced setLanguage function with profile sync
  const setLanguage = async (code: string) => {
    const lang = languages.find(l => l.code === code);
    if (!lang) return;

    try {
      setCurrentLanguage(code);
      await loadCurrentTranslation(code);
      
      // Update user profile if authenticated
      if (user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            language_preference: code,
            email: user.email || ''
          });

        if (profileError) {
          console.error('Failed to update profile language:', profileError);
        }

        // Also update user_preferences table if it exists
        const { error: preferencesError } = await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.id,
            language_preference: code
          });

        if (preferencesError && preferencesError.code !== '42P01') { // Ignore if table doesn't exist
          console.error('Failed to update preferences language:', preferencesError);
        }
      }

      // Trigger a custom event for components to react to language changes
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: code, lang } }));
      
    } catch (error) {
      console.error('Failed to change language:', error);
      toast({
        title: "Language Change Failed",
        description: "Failed to change language. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Enhanced translation function with better fallbacks
  const t = (key: string, params?: Record<string, string>): string => {
    if (loading && !translations) return key;

    const keys = key.split('.');
    let value = translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Try fallback to English if available in cache
        if (translationCache.en) {
          let fallbackValue = translationCache.en;
          for (const fallbackKey of keys) {
            if (fallbackValue && typeof fallbackValue === 'object' && fallbackKey in fallbackValue) {
              fallbackValue = fallbackValue[fallbackKey];
            } else {
              break;
            }
          }
          if (typeof fallbackValue === 'string') {
            return params ? 
              Object.entries(params).reduce(
                (text, [param, val]) => text.replace(new RegExp(`{${param}}`, 'g'), val),
                fallbackValue
              ) : fallbackValue;
          }
        }
        
        console.warn(`Translation key "${key}" not found for language "${currentLanguage}"`);
        return key;
      }
    }

    if (typeof value !== 'string') {
      console.warn(`Translation key "${key}" is not a string for language "${currentLanguage}"`);
      return key;
    }

    // Replace parameters with improved regex
    if (params) {
      return Object.entries(params).reduce(
        (text, [param, val]) => text.replace(new RegExp(`{${param}}`, 'g'), val),
        value
      );
    }

    return value;
  };

  // Refresh translations (useful for updating without reload)
  const refreshTranslations = async () => {
    delete translationCache[currentLanguage];
    delete loadingPromises[currentLanguage];
    await loadCurrentTranslation(currentLanguage);
  };

  return (
    <EnhancedI18nContext.Provider 
      value={{ 
        currentLanguage, 
        currentLang,
        setLanguage, 
        t, 
        isRTL: rtl, 
        languages,
        loading,
        refreshTranslations
      }}
    >
      {children}
    </EnhancedI18nContext.Provider>
  );
};