import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '@/contexts/AuthContext';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { TrustBadge } from '@/components/TrustBadge';

export const HomeHeader = () => {
  const { t, i18n } = useTranslation(['home', 'common']);
  const { user } = useAuthContext();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    // Get display name from user metadata or profile data
    const displayName = user?.user_metadata?.full_name || 
                       user?.user_metadata?.display_name || 
                       user?.email?.split('@')[0] || 
                       'vän';
    
    if (hour < 12) {
      return t('home:greetingMorning', { name: displayName });
    } else if (hour < 17) {
      return t('home:greetingAfternoon', { name: displayName });
    } else {
      return t('home:greetingEvening', { name: displayName });
    }
  }, [t, user]);

  const todayDate = useMemo(() => {
    return new Date().toLocaleDateString(i18n.language, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [i18n.language]);

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
    localStorage.setItem('aura-lang', language);
  };

  return (
    <header className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {greeting}
          </h1>
          <p className="text-muted-foreground">
            {t('home:today')}, {todayDate}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <TrustBadge variant="header" />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
};