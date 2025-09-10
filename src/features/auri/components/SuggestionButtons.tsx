import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Heart, Brain, Moon, Zap, Target } from 'lucide-react'
import { motion } from 'framer-motion'

const getSuggestions = (language: string) => {
  const suggestions = {
    sv: [
      { key: 'mood', icon: Heart, prompt: 'Jag känner mig lite nere idag och behöver stöd med mitt mående' },
      { key: 'stress', icon: Brain, prompt: 'Jag är stressad och behöver hjälp att minska stressen' },
      { key: 'anxiety', icon: Zap, prompt: 'Jag känner oro och ångest, kan du hjälpa mig hantera detta?' },
      { key: 'sleep', icon: Moon, prompt: 'Jag har problem med sömnen och vill förbättra min sömnkvalitet' },
      { key: 'general', icon: Target, prompt: 'Jag vill skapa en daglig välmåenderutin för bättre hälsa' }
    ],
    en: [
      { key: 'mood', icon: Heart, prompt: 'I\'m feeling a bit down today and need support with my mood' },
      { key: 'stress', icon: Brain, prompt: 'I\'m stressed and need help reducing stress levels' },
      { key: 'anxiety', icon: Zap, prompt: 'I\'m feeling anxious and worried, can you help me manage this?' },
      { key: 'sleep', icon: Moon, prompt: 'I\'m having trouble sleeping and want to improve my sleep quality' },
      { key: 'general', icon: Target, prompt: 'I want to create a daily wellness routine for better health' }
    ],
    es: [
      { key: 'mood', icon: Heart, prompt: 'Me siento un poco decaído hoy y necesito apoyo con mi estado de ánimo' },
      { key: 'stress', icon: Brain, prompt: 'Estoy estresado y necesito ayuda para reducir el estrés' },
      { key: 'anxiety', icon: Zap, prompt: 'Me siento ansioso y preocupado, ¿puedes ayudarme a manejar esto?' },
      { key: 'sleep', icon: Moon, prompt: 'Tengo problemas para dormir y quiero mejorar mi calidad de sueño' },
      { key: 'general', icon: Target, prompt: 'Quiero crear una rutina diaria de bienestar para mejor salud' }
    ],
    no: [
      { key: 'mood', icon: Heart, prompt: 'Jeg føler meg litt nede i dag og trenger støtte med humøret mitt' },
      { key: 'stress', icon: Brain, prompt: 'Jeg er stresset og trenger hjelp til å redusere stress' },
      { key: 'anxiety', icon: Zap, prompt: 'Jeg føler angst og bekymring, kan du hjelpe meg håndtere dette?' },
      { key: 'sleep', icon: Moon, prompt: 'Jeg har problemer med søvn og vil forbedre sovekvaliteten min' },
      { key: 'general', icon: Target, prompt: 'Jeg vil lage en daglig wellness-rutine for bedre helse' }
    ],
    da: [
      { key: 'mood', icon: Heart, prompt: 'Jeg føler mig lidt ked af det i dag og har brug for støtte til mit humør' },
      { key: 'stress', icon: Brain, prompt: 'Jeg er stresset og har brug for hjælp til at reducere stress' },
      { key: 'anxiety', icon: Zap, prompt: 'Jeg føler angst og bekymring, kan du hjælpe mig med at håndtere dette?' },
      { key: 'sleep', icon: Moon, prompt: 'Jeg har problemer med søvn og vil forbedre min søvnkvalitet' },
      { key: 'general', icon: Target, prompt: 'Jeg vil skabe en daglig wellness-rutine for bedre sundhed' }
    ],
    fi: [
      { key: 'mood', icon: Heart, prompt: 'Tunnen oloni hieman alakuloinen tänään ja tarvitsen tukea mielialalleni' },
      { key: 'stress', icon: Brain, prompt: 'Olen stressaantunut ja tarvitsen apua stressin vähentämiseen' },
      { key: 'anxiety', icon: Zap, prompt: 'Tunnen ahdistusta ja huolta, voitko auttaa minua hallitsemaan tätä?' },
      { key: 'sleep', icon: Moon, prompt: 'Minulla on unongelmia ja haluan parantaa unen laatuani' },
      { key: 'general', icon: Target, prompt: 'Haluan luoda päivittäisen hyvinvointirutiinin parempaa terveyttä varten' }
    ]
  };
  
  return suggestions[language] || suggestions.en;
};

interface SuggestionButtonsProps {
  onUse: (prompt: string) => void;
}

export function SuggestionButtons({ onUse }: SuggestionButtonsProps) {
  const { i18n, t } = useTranslation('auri');
  const suggestions = getSuggestions(i18n.language);

  return (
    <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
      {suggestions.map((suggestion, index) => {
        const Icon = suggestion.icon;
        return (
          <motion.div
            key={suggestion.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUse(suggestion.prompt)}
              className="w-full justify-start gap-2 h-auto p-3"
            >
              <Icon className="w-4 h-4 text-primary" />
              <span className="text-xs">{t(`suggestions.${suggestion.key}`)}</span>
            </Button>
          </motion.div>
        );
      })}
    </div>
  );
}