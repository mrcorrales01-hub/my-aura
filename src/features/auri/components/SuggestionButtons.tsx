import { useTranslation } from 'react-i18next';

const SUGGESTIONS = [
  { key: 'mood', textKey: 'suggestions.mood', prompt: 'Hjälp mig förstå mina känslor idag.' },
  { key: 'stress', textKey: 'suggestions.stress', prompt: 'Jag känner stress. Ge mig en snabb plan.' },
  { key: 'anxiety', textKey: 'suggestions.anxiety', prompt: 'Jag är orolig. Låt oss göra andning + strategi.' },
  { key: 'sleep', textKey: 'suggestions.sleep', prompt: 'Sömntips ikväll? 3 konkreta steg.' },
  { key: 'general', textKey: 'suggestions.general', prompt: 'Förslag på en 5-min välmåenderutin.' },
];

export function SuggestionButtons({ onUse }: { onUse: (p: string) => void }) {
  const { t } = useTranslation('auri');
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {SUGGESTIONS.map(s => (
        <button 
          type="button" 
          key={s.key}
          className="rounded-xl border px-3 py-2 text-left hover:bg-accent transition-colors"
          onClick={() => onUse(s.prompt)}
        >
          {t(s.textKey)}
        </button>
      ))}
    </div>
  );
}