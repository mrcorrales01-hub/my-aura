import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Languages, Globe, Clock, DollarSign, Phone } from "lucide-react";
import { useGlobalLocalization, globalLanguages, GlobalLanguage } from "@/hooks/useGlobalLocalization";

interface GlobalLanguageSelectorProps {
  variant?: "button" | "modal" | "card" | "compact";
}

export const GlobalLanguageSelector = ({ variant = "button" }: GlobalLanguageSelectorProps) => {
  const { currentLanguage, setLanguage, t, currency, emergencyNumber, timeZone } = useGlobalLocalization();
  const currentLang = globalLanguages.find(lang => lang.code === currentLanguage) || globalLanguages[0];
  const [open, setOpen] = useState(false);

  const handleLanguageSelect = (lang: GlobalLanguage) => {
    setLanguage(lang);
    setOpen(false);
  };

  const LanguageGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96">
      {globalLanguages.map((lang) => {
        const isSelected = currentLanguage === lang.code;
        return (
          <Card
            key={lang.code}
            className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-wellness ${
              isSelected ? 'ring-2 ring-wellness-primary bg-gradient-wellness' : 'hover:bg-muted/50'
            }`}
            onClick={() => handleLanguageSelect(lang.code)}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{lang.flag}</span>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">{lang.name}</h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <DollarSign className="w-3 h-3" />
                  <span>{lang.currency}</span>
                  {lang.rtl && <Badge variant="outline" className="text-xs">RTL</Badge>}
                </div>
              </div>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                <span>Emergency: {lang.emergency}</span>
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
          <Globe className="w-12 h-12 text-wellness-primary mx-auto mb-4" />
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
          <Button variant="ghost" size="sm" className="h-8 px-2">
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
        </DialogContent>
      </Dialog>
    );
  }

  if (variant === "modal") {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span className="text-lg">{currentLang.flag}</span>
            <span className="hidden sm:inline">{currentLang.name}</span>
            <div className="hidden lg:flex items-center gap-1 text-xs text-muted-foreground">
              <span>{currency}</span>
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
        <Button variant="outline" size="sm" className="flex items-center gap-2">
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
      </DialogContent>
    </Dialog>
  );
};