export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl: boolean;
  currency: string;
  emergencyNumber: string;
  timezone: string;
}

export const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', rtl: false, currency: 'USD', emergencyNumber: '911', timezone: 'America/New_York' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', rtl: false, currency: 'EUR', emergencyNumber: '112', timezone: 'Europe/Madrid' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪', rtl: false, currency: 'SEK', emergencyNumber: '112', timezone: 'Europe/Stockholm' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', rtl: false, currency: 'EUR', emergencyNumber: '112', timezone: 'Europe/Berlin' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', rtl: false, currency: 'EUR', emergencyNumber: '112', timezone: 'Europe/Paris' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', rtl: false, currency: 'EUR', emergencyNumber: '112', timezone: 'Europe/Lisbon' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', rtl: false, currency: 'EUR', emergencyNumber: '112', timezone: 'Europe/Rome' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', rtl: false, currency: 'EUR', emergencyNumber: '112', timezone: 'Europe/Amsterdam' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', rtl: false, currency: 'RUB', emergencyNumber: '112', timezone: 'Europe/Moscow' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true, currency: 'SAR', emergencyNumber: '999', timezone: 'Asia/Riyadh' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', rtl: false, currency: 'TRY', emergencyNumber: '112', timezone: 'Europe/Istanbul' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳', rtl: false, currency: 'CNY', emergencyNumber: '120', timezone: 'Asia/Shanghai' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文', flag: '🇹🇼', rtl: false, currency: 'TWD', emergencyNumber: '119', timezone: 'Asia/Taipei' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', rtl: false, currency: 'JPY', emergencyNumber: '110', timezone: 'Asia/Tokyo' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', rtl: false, currency: 'KRW', emergencyNumber: '112', timezone: 'Asia/Seoul' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', rtl: false, currency: 'INR', emergencyNumber: '112', timezone: 'Asia/Kolkata' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩', rtl: false, currency: 'BDT', emergencyNumber: '999', timezone: 'Asia/Dhaka' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱', rtl: false, currency: 'PLN', emergencyNumber: '112', timezone: 'Europe/Warsaw' },
  { code: 'fa', name: 'Farsi', nativeName: 'فارسی', flag: '🇮🇷', rtl: true, currency: 'IRR', emergencyNumber: '115', timezone: 'Asia/Tehran' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭', rtl: false, currency: 'THB', emergencyNumber: '191', timezone: 'Asia/Bangkok' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', rtl: false, currency: 'VND', emergencyNumber: '113', timezone: 'Asia/Ho_Chi_Minh' },
  { code: 'tl', name: 'Filipino', nativeName: 'Filipino', flag: '🇵🇭', rtl: false, currency: 'PHP', emergencyNumber: '117', timezone: 'Asia/Manila' },
];

export const detectLanguage = (): string => {
  const saved = localStorage.getItem('aura-language');
  if (saved && languages.find(lang => lang.code === saved)) {
    return saved;
  }
  
  const browserLang = navigator.language.toLowerCase();
  const supported = languages.find(lang => 
    browserLang.startsWith(lang.code.toLowerCase()) ||
    lang.code.toLowerCase().startsWith(browserLang.split('-')[0])
  );
  
  return supported?.code || 'en';
};

export const getLanguage = (code: string): Language => {
  return languages.find(lang => lang.code === code) || languages[0];
};

export const isRTL = (code: string): boolean => {
  const lang = getLanguage(code);
  return lang.rtl;
};