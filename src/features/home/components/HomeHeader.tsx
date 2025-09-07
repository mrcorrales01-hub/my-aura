import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n/index';

export const HomeHeader = () => {
  const { t, i18n } = useTranslation(['home', 'common']);
  const { user } = useAuthContext();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    const name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
    
    if (hour < 12) {
      return t('home:greetingMorning', { name });
    } else if (hour < 17) {
      return t('home:greetingAfternoon', { name });
    } else {
      return t('home:greetingEvening', { name });
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
          <Globe className="h-4 w-4 text-muted-foreground" />
          <Select value={i18n.language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-32" data-testid="language-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </header>
  );
};