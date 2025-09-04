import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Check, Globe } from 'lucide-react';
import { loadLocale, SUPPORTED_LANGUAGES } from '@/lib/i18n';
import type { SupportedLanguage } from '@/lib/i18n';

const LANGUAGE_FLAGS: Record<SupportedLanguage, string> = {
  sv: '🇸🇪',
  en: '🇬🇧', 
  es: '🇪🇸',
  da: '🇩🇰',
  no: '🇳🇴',
  fi: '🇫🇮',
};

interface LanguageSwitcherProps {
  showAsModal?: boolean;
  onClose?: () => void;
}

export function LanguageSwitcher({ showAsModal = false, onClose }: LanguageSwitcherProps) {
  const { t, i18n } = useTranslation();
  const [followSystem, setFollowSystem] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(
    i18n.language as SupportedLanguage
  );

  useEffect(() => {
    // Check if user has set a preference for following system language
    const systemPref = localStorage.getItem('aura-follow-system-language');
    setFollowSystem(systemPref === 'true');
  }, []);

  const handleLanguageChange = async (language: SupportedLanguage) => {
    setSelectedLanguage(language);
    await loadLocale(language);
    await i18n.changeLanguage(language);
    
    // Save preference
    localStorage.setItem('aura-language', language);
    localStorage.setItem('aura-language-set', 'true');
    
    if (onClose) {
      onClose();
    }
  };

  const handleFollowSystemToggle = (checked: boolean) => {
    setFollowSystem(checked);
    localStorage.setItem('aura-follow-system-language', checked.toString());
    
    if (checked) {
      // Detect and set system language
      const browserLang = navigator.language;
      const detectedLang = browserLang.startsWith('sv') ? 'sv' :
                          browserLang.startsWith('es') ? 'es' :
                          browserLang.startsWith('da') ? 'da' :
                          browserLang.startsWith('no') ? 'no' :
                          browserLang.startsWith('fi') ? 'fi' : 'en';
      
      handleLanguageChange(detectedLang as SupportedLanguage);
    }
  };

  const content = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium">{t('language.modal.followSystem')}</h4>
          <p className="text-sm text-muted-foreground">
            Automatically use your device's language setting
          </p>
        </div>
        <Switch
          checked={followSystem}
          onCheckedChange={handleFollowSystemToggle}
        />
      </div>

      <div className="grid gap-3">
        {SUPPORTED_LANGUAGES.map((language) => (
          <Card
            key={language}
            className={`cursor-pointer transition-all hover:bg-muted/50 ${
              selectedLanguage === language ? 'ring-2 ring-primary bg-muted/30' : ''
            }`}
            onClick={() => handleLanguageChange(language)}
          >
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl" role="img" aria-label={`${language} flag`}>
                  {LANGUAGE_FLAGS[language]}
                </span>
                <span className="font-medium">
                  {t(`language.names.${language}`)}
                </span>
              </div>
              {selectedLanguage === language && (
                <Check className="h-5 w-5 text-primary" />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {showAsModal && (
        <Button 
          onClick={onClose} 
          className="w-full"
          size="lg"
        >
          {t('language.modal.confirm')}
        </Button>
      )}
    </div>
  );

  if (showAsModal) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>{t('language.modal.title')}</span>
            </DialogTitle>
            <DialogDescription>
              {t('language.modal.description')}
            </DialogDescription>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <Globe className="h-5 w-5" />
          <span>{t('settings.language')}</span>
        </h3>
        {content}
      </CardContent>
    </Card>
  );
}