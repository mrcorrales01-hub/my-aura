import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Languages, Globe } from "lucide-react";
import { useLanguage, languages, Language } from "@/hooks/useLanguage";

interface LanguageSelectorProps {
  variant?: "button" | "modal" | "card";
}

export const LanguageSelector = ({ variant = "button" }: LanguageSelectorProps) => {
  const { currentLanguage, setLanguage, t } = useLanguage();
  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0];
  const [open, setOpen] = useState(false);

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    setOpen(false);
  };

  const LanguageGrid = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96">
      {languages.map((lang) => (
        <Button
          key={lang.code}
          variant={currentLanguage === lang.code ? "wellness" : "outline"}
          onClick={() => handleLanguageSelect(lang.code)}
          className="flex items-center gap-2 h-12 justify-start text-left p-3"
        >
          <span className="text-lg">{lang.flag}</span>
          <span className="text-sm font-medium truncate">{lang.name}</span>
        </Button>
      ))}
    </div>
  );

  if (variant === "card") {
    return (
      <Card className="p-6 bg-card/90 backdrop-blur-sm">
        <div className="text-center mb-6">
          <Globe className="w-12 h-12 text-wellness-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">{t('common.selectLanguage')}</h2>
          <p className="text-muted-foreground">
            Choose your preferred language to get started
          </p>
        </div>
        <ScrollArea className="h-80">
          <LanguageGrid />
        </ScrollArea>
      </Card>
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
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <span className="text-sm">{currentLang.flag}</span>
          <span className="hidden sm:inline text-xs">{currentLang.name}</span>
          <Languages className="w-3 h-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
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