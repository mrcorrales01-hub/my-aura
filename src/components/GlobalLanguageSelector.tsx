import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Languages, Globe, Clock, DollarSign, Phone, Check } from "lucide-react";
import { useI18n } from "@/hooks/useEnhancedI18n";
import { languages, Language } from "@/lib/i18n";

interface GlobalLanguageSelectorProps {
  variant?: "button" | "modal" | "card" | "compact";
}

export const GlobalLanguageSelector = ({ variant = "button" }: GlobalLanguageSelectorProps) => {
  const { currentLanguage, setLanguage, t, currentLang } = useI18n();
  const [open, setOpen] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  const handleLanguageSelect = async (lang: Language) => {
    if (lang.code === currentLanguage) {
      setOpen(false);
      return;
    }

    setIsChanging(true);
    try {
      await setLanguage(lang.code);
      setOpen(false);
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setIsChanging(false);
    }
  };

  const LanguageGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 p-2">
      {languages.map((lang) => {
        const isSelected = currentLanguage === lang.code;
        return (
          <Card
            key={lang.code}
            className={`
              p-4 cursor-pointer transition-all duration-300 hover:shadow-wellness
              ${isSelected 
                ? 'ring-2 ring-primary bg-primary/5 border-primary' 
                : 'hover:bg-muted/50 hover:border-muted-foreground/20'
              }
              ${lang.rtl ? 'text-right' : 'text-left'}
            `}
            onClick={() => handleLanguageSelect(lang)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleLanguageSelect(lang);
              }
            }}
          >
            <div className={`flex items-center gap-3 mb-2 ${lang.rtl ? 'flex-row-reverse' : ''}`}>
              <span className="text-2xl" role="img" aria-label={`${lang.name} flag`}>
                {lang.flag}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm truncate">{lang.name}</h3>
                  {isSelected && (
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {lang.nativeName}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <DollarSign className="w-3 h-3" />
                  <span>{lang.currency}</span>
                  {lang.rtl && <Badge variant="outline" className="text-xs">RTL</Badge>}
                </div>
              </div>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                <span>Emergency: {lang.emergencyNumber}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{lang.timezone.split('/')[1]}</span>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );

  if (variant === "card") {
    return (
      <Card className="p-6 bg-card/90 backdrop-blur-sm">
        <div className="text-center mb-6">
          <Globe className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">{t('common.selectLanguage')}</h2>
          <p className="text-muted-foreground">
            Choose your language and region for a personalized experience
          </p>
        </div>
        <ScrollArea className="h-80">
          <LanguageGrid />
        </ScrollArea>
      </Card>
    );
  }

  if (variant === "compact") {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2"
            disabled={isChanging}
          >
            <span className="text-sm">{currentLang.flag}</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Languages className="w-5 h-5" />
              {t('common.selectLanguage')}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-96 mt-4">
            <LanguageGrid />
          </ScrollArea>
          {isChanging && (
            <div className="flex items-center justify-center p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                {t('common.loading')}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  if (variant === "modal") {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            disabled={isChanging}
          >
            <Globe className="w-4 h-4" />
            <span className="text-lg">{currentLang.flag}</span>
            <span className="hidden sm:inline">{currentLang.name}</span>
            <div className="hidden lg:flex items-center gap-1 text-xs text-muted-foreground">
              <span>{currentLang.currency}</span>
            </div>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Languages className="w-5 h-5" />
              Global Language & Region Settings
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-96 mt-4">
            <LanguageGrid />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
          disabled={isChanging}
        >
          <span className="text-sm">{currentLang.flag}</span>
          <span className="hidden sm:inline text-xs">{currentLang.name}</span>
          <Languages className="w-3 h-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Languages className="w-5 h-5" />
            {t('common.selectLanguage')}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-96 mt-4">
          <LanguageGrid />
        </ScrollArea>
        {isChanging && (
          <div className="flex items-center justify-center p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              {t('common.loading')}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};