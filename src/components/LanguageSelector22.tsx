import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { setLanguage, LANGS, type Lang } from '@/i18n/index';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Languages, Globe } from "lucide-react";

const LANGUAGE_OPTIONS = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "sv", name: "Svenska", flag: "🇸🇪" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "nl", name: "Nederlands", flag: "🇳🇱" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "tr", name: "Türkçe", flag: "🇹🇷" },
  { code: "zh-Hans", name: "中文(简体)", flag: "🇨🇳" },
  { code: "zh-Hant", name: "中文(繁體)", flag: "🇹🇼" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
  { code: "bn", name: "বাংলা", flag: "🇧🇩" },
  { code: "pl", name: "Polski", flag: "🇵🇱" },
  { code: "fa", name: "فارسی", flag: "🇮🇷" },
  { code: "th", name: "ไทย", flag: "🇹🇭" },
  { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
  { code: "fil", name: "Filipino", flag: "🇵🇭" }
];

interface LanguageSelector22Props {
  variant?: "button" | "compact";
}

export const LanguageSelector22 = ({ variant = "button" }: LanguageSelector22Props) => {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  
  const currentLang = LANGUAGE_OPTIONS.find(lang => lang.code === i18n.language) || LANGUAGE_OPTIONS[0];

  const handleLanguageSelect = async (code: string) => {
    await setLanguage(code as Lang);
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
              {t('settings.language', 'Language')}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-auto">
            {LANGUAGE_OPTIONS.map((lang) => (
              <Button
                key={lang.code}
                variant={i18n.language === lang.code ? "default" : "outline"}
                onClick={() => handleLanguageSelect(lang.code)}
                className="flex items-center gap-2 h-12 justify-start text-left p-3"
              >
                <span className="text-lg">{lang.flag}</span>
                <span className="text-sm font-medium">{lang.name}</span>
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
            {t('settings.language', 'Language')}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-auto">
          {LANGUAGE_OPTIONS.map((lang) => (
            <Button
              key={lang.code}
              variant={i18n.language === lang.code ? "default" : "outline"}
              onClick={() => handleLanguageSelect(lang.code)}
              className="flex items-center gap-2 h-12 justify-start text-left p-3"
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="text-sm font-medium">{lang.name}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LanguageSelector22;