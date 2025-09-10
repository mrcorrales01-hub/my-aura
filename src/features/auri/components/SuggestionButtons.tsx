import { useTranslation } from 'react-i18next';

const getSuggestions = (language: string) => {
  const suggestions = {
    sv: [
      { key: 'mood', textKey: 'suggestions.mood', prompt: 'Hjälp mig förstå mina känslor idag.' },
      { key: 'stress', textKey: 'suggestions.stress', prompt: 'Jag känner stress. Ge mig en snabb plan.' },
      { key: 'anxiety', textKey: 'suggestions.anxiety', prompt: 'Jag är orolig. Låt oss göra andning + strategi.' },
      { key: 'sleep', textKey: 'suggestions.sleep', prompt: 'Sömntips ikväll? 3 konkreta steg.' },
      { key: 'general', textKey: 'suggestions.general', prompt: 'Förslag på en 5-min välmåenderutin.' },
    ],
    en: [
      { key: 'mood', textKey: 'suggestions.mood', prompt: 'Help me understand my feelings today.' },
      { key: 'stress', textKey: 'suggestions.stress', prompt: 'I feel stressed. Give me a quick plan.' },
      { key: 'anxiety', textKey: 'suggestions.anxiety', prompt: 'I am worried. Let us do breathing + strategy.' },
      { key: 'sleep', textKey: 'suggestions.sleep', prompt: 'Sleep tips tonight? 3 concrete steps.' },
      { key: 'general', textKey: 'suggestions.general', prompt: 'Suggest a 5-min wellness routine.' },
    ],
    es: [
      { key: 'mood', textKey: 'suggestions.mood', prompt: 'Ayúdame a entender mis sentimientos hoy.' },
      { key: 'stress', textKey: 'suggestions.stress', prompt: 'Me siento estresado. Dame un plan rápido.' },
      { key: 'anxiety', textKey: 'suggestions.anxiety', prompt: 'Estoy preocupado. Hagamos respiración + estrategia.' },
      { key: 'sleep', textKey: 'suggestions.sleep', prompt: '¿Consejos para dormir esta noche? 3 pasos concretos.' },
      { key: 'general', textKey: 'suggestions.general', prompt: 'Sugiere una rutina de bienestar de 5 min.' },
    ],
    no: [
      { key: 'mood', textKey: 'suggestions.mood', prompt: 'Hjelp meg forstå følelsene mine i dag.' },
      { key: 'stress', textKey: 'suggestions.stress', prompt: 'Jeg føler stress. Gi meg en rask plan.' },
      { key: 'anxiety', textKey: 'suggestions.anxiety', prompt: 'Jeg er bekymret. La oss gjøre pust + strategi.' },
      { key: 'sleep', textKey: 'suggestions.sleep', prompt: 'Søvntips i kveld? 3 konkrete steg.' },
      { key: 'general', textKey: 'suggestions.general', prompt: 'Foreslå en 5-min wellness-rutine.' },
    ],
    da: [
      { key: 'mood', textKey: 'suggestions.mood', prompt: 'Hjælp mig med at forstå mine følelser i dag.' },
      { key: 'stress', textKey: 'suggestions.stress', prompt: 'Jeg føler stress. Giv mig en hurtig plan.' },
      { key: 'anxiety', textKey: 'suggestions.anxiety', prompt: 'Jeg er bekymret. Lad os lave vejrtrækning + strategi.' },
      { key: 'sleep', textKey: 'suggestions.sleep', prompt: 'Søvntips i aften? 3 konkrete trin.' },
      { key: 'general', textKey: 'suggestions.general', prompt: 'Foreslå en 5-min wellness-rutine.' },
    ],
    fi: [
      { key: 'mood', textKey: 'suggestions.mood', prompt: 'Auta minua ymmärtämään tunteita tänään.' },
      { key: 'stress', textKey: 'suggestions.stress', prompt: 'Tunnen stressiä. Anna minulle nopea suunnitelma.' },
      { key: 'anxiety', textKey: 'suggestions.anxiety', prompt: 'Olen huolissani. Tehdään hengitys + strategia.' },
      { key: 'sleep', textKey: 'suggestions.sleep', prompt: 'Unitiipejä tälle yölle? 3 konkreettista askelta.' },
      { key: 'general', textKey: 'suggestions.general', prompt: 'Ehdota 5 minuutin hyvinvointirutiinia.' },
    ],
  };
  
  return suggestions[language as keyof typeof suggestions] || suggestions.en;
};

export function SuggestionButtons({ onUse }: { onUse: (p: string) => void }) {
  const { t, i18n } = useTranslation('auri');
  const suggestions = getSuggestions(i18n.language);
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {suggestions.map(s => (
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