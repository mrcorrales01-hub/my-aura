import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Languages, Globe } from "lucide-react";
import { useI18n, languages } from "@/hooks/useI18n";

interface LanguageSelectorProps {
  variant?: "button" | "compact";
}

export const LanguageSelector = ({ variant = "button" }: LanguageSelectorProps) => {
  const { currentLanguage, setLanguage, t } = useI18n();
  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0];
  const [open, setOpen] = useState(false);

  const handleLanguageSelect = (code: string) => {
    setLanguage(code);
    setOpen(false);
  };

  if (variant === "compact") {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <span className="text-sm">{currentLang.flag}</span>
            <span className="hidden sm:inline text-xs">{currentLang.name}</span>
            <Languages className="w-3 h-3" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Languages className="w-5 h-5" />
              Select Language
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-auto">
            {languages.map((lang) => (
              <Button
                key={lang.code}
                variant={currentLanguage === lang.code ? "default" : "outline"}
                onClick={() => handleLanguageSelect(lang.code)}
                className="flex items-center gap-2 h-12 justify-start text-left p-3"
              >
                <span className="text-lg">{lang.flag}</span>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{lang.name}</span>
                  <span className="text-xs text-muted-foreground">{lang.nativeName}</span>
                </div>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

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
            Select Language
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-auto">
          {languages.map((lang) => (
            <Button
              key={lang.code}
              variant={currentLanguage === lang.code ? "default" : "outline"}
              onClick={() => handleLanguageSelect(lang.code)}
              className="flex items-center gap-2 h-12 justify-start text-left p-3"
            >
              <span className="text-lg">{lang.flag}</span>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">{lang.name}</span>
                <span className="text-xs text-muted-foreground">{lang.nativeName}</span>
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};