import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';

const LANGUAGES = [
  { code: 'sv', label: 'Svenska', flag: '🇸🇪' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'da', label: 'Dansk', flag: '🇩🇰' },
  { code: 'no', label: 'Norsk', flag: '🇳🇴' },
  { code: 'fi', label: 'Suomi', flag: '🇫🇮' },
];

export function FirstStartLanguageModal() {
  const [open, setOpen] = useState(false);
  const { i18n, t } = useTranslation('common');

  useEffect(() => {
    // Check if this is the first start
    const hasSeenLanguageModal = localStorage.getItem('aura.firstStart');
    if (!hasSeenLanguageModal) {
      setOpen(true);
    }
  }, []);

  const handleLanguageSelect = async (code: string) => {
    await i18n.changeLanguage(code);
    localStorage.setItem('aura.lang', code);
    localStorage.setItem('aura.firstStart', 'true');

    // Save to profile if logged in
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase
        .from('profiles')
        .update({ language_preference: code })
        .eq('id', session.user.id);
    }

    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300">
        <h2 className="text-2xl font-semibold mb-2 text-foreground">
          {t('firstStart.title')}
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          {t('firstStart.subtitle')}
        </p>
        
        <div className="grid grid-cols-2 gap-3 mb-6">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageSelect(lang.code)}
              className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-left transition-all hover:bg-accent hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <span className="text-2xl">{lang.flag}</span>
              <span className="font-medium text-foreground">{lang.label}</span>
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-sm text-muted-foreground mb-4 cursor-pointer">
          <input
            type="checkbox"
            className="rounded border-border"
            onChange={(e) => {
              localStorage.setItem('aura.followSystem', e.target.checked ? '1' : '0');
            }}
          />
          <span>{t('firstStart.followSystem')}</span>
        </label>
      </div>
    </div>
  );
}
