import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';

export function LanguageSetup() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const saveLanguageToProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const currentLang = i18n.language;
        
        // Check if profile exists first
        const { data: profile } = await supabase
          .from('profiles')
          .select('language_preference')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profile && !profile.language_preference) {
          // Only update if language_preference is null/empty
          await supabase
            .from('profiles')
            .update({ language_preference: currentLang })
            .eq('id', session.user.id);
          
          console.log('🌍 [LanguageSetup] Saved language preference:', currentLang);
        }
      } catch (error) {
        console.warn('🌍 [LanguageSetup] Failed to save language preference:', error);
      }
    };

    // Save language preference on first run
    saveLanguageToProfile();

    // Also save when language changes
    const handleLanguageChange = (lng: string) => {
      localStorage.setItem('aura.lang', lng);
      saveLanguageToProfile();
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  return null; // This is a utility component that doesn't render anything
}