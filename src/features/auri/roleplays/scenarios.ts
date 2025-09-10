export type Step = { 
  goal: Record<string, string>; 
  hints?: Record<string, string>; 
};

export type Scenario = { 
  id: string; 
  title: Record<string, string>; 
  steps: Step[]; 
};

export const SCENARIOS: Scenario[] = [
  {
    id: 'boundary-setting',
    title: { 
      sv: 'Sätta gränser', 
      en: 'Setting Boundaries',
      es: 'Establecer Límites',
      no: 'Sette grenser',
      da: 'Sætte grænser',
      fi: 'Rajojen asettaminen'
    },
    steps: [
      { 
        goal: { 
          sv: 'Identifiera situationen där du behöver sätta gränser', 
          en: 'Identify situations where you need to set boundaries',
          es: 'Identifica situaciones donde necesitas establecer límites',
          no: 'Identifiser situasjoner der du trenger å sette grenser',
          da: 'Identificer situationer hvor du har brug for at sætte grænser',
          fi: 'Tunnista tilanteet, joissa sinun on asetettava rajoja'
        } 
      },
      { 
        goal: { 
          sv: 'Formulera tydliga gränser med "jag"-meddelanden', 
          en: 'Formulate clear boundaries using "I" statements',
          es: 'Formula límites claros usando declaraciones "Yo"',
          no: 'Formuler tydelige grenser ved hjelp av "jeg"-utsagn',
          da: 'Formuler tydelige grænser ved hjælp af "jeg"-udsagn',
          fi: 'Muotoile selkeät rajat käyttämällä "minä"-lauseita'
        } 
      },
      { 
        goal: { 
          sv: 'Kom överens om nästa steg tillsammans', 
          en: 'Agree on next steps together',
          es: 'Acordar los próximos pasos juntos',
          no: 'Bli enige om neste steg sammen',
          da: 'Bliv enige om næste skridt sammen',
          fi: 'Sopia seuraavista vaiheista yhdessä'
        } 
      }
    ]
  },
  {
    id: 'panic-grounding',
    title: { 
      sv: 'Hantera panik med grounding', 
      en: 'Managing Panic with Grounding',
      es: 'Manejar el Pánico con Técnicas de Conexión',
      no: 'Håndtere panikk med grounding',
      da: 'Håndtere panik med grounding',
      fi: 'Paniikkikohtausten hallinta maadoituksella'
    },
    steps: [
      { 
        goal: { 
          sv: 'Andas långsamt och djupt (2 varv)', 
          en: 'Breathe slowly and deeply (2 rounds)',
          es: 'Respira lenta y profundamente (2 rondas)',
          no: 'Pust sakte og dypt (2 runder)',
          da: 'Ånd langsomt og dybt (2 runder)',
          fi: 'Hengitä hitaasti ja syvään (2 kierrosta)'
        } 
      },
      { 
        goal: { 
          sv: 'Använd 5-4-3-2-1 teknik för att notera dina sinnen', 
          en: 'Use 5-4-3-2-1 technique to notice your senses',
          es: 'Usa la técnica 5-4-3-2-1 para notar tus sentidos',
          no: 'Bruk 5-4-3-2-1 teknikk for å merke sansene dine',
          da: 'Brug 5-4-3-2-1 teknik til at mærke dine sanser',
          fi: 'Käytä 5-4-3-2-1 tekniikkaa havainnoidaksesi aistejasi'
        } 
      }
    ]
  },
  {
    id: 'productive-disagreement',
    title: { 
      sv: 'Konstruktiv oenighet', 
      en: 'Productive Disagreement',
      es: 'Desacuerdo Productivo',
      no: 'Produktiv uenighet',
      da: 'Produktiv uenighed',
      fi: 'Rakentava erimielisyys'
    },
    steps: [
      { 
        goal: { 
          sv: 'Sammanfatta den andres poäng noggrant', 
          en: "Summarize the other person's point accurately",
          es: 'Resume el punto de la otra persona con precisión',
          no: 'Sammenfatt den andre personens poeng nøyaktig',
          da: 'Sammenfat den anden persons pointe præcist',
          fi: 'Tiivistä toisen henkilön näkökulma tarkasti'
        } 
      },
      { 
        goal: { 
          sv: 'Dela din ståndpunkt lugnt och respektfullt', 
          en: 'Share your viewpoint calmly and respectfully',
          es: 'Comparte tu punto de vista con calma y respeto',
          no: 'Del ditt synspunkt rolig og respektfullt',
          da: 'Del dit synspunkt roligt og respektfuldt',
          fi: 'Jaa näkemyksesi rauhallisesti ja kunnioittavasti'
        } 
      },
      { 
        goal: { 
          sv: 'Föreslå en gemensam väg framåt', 
          en: 'Propose a joint path forward',
          es: 'Propón un camino conjunto hacia adelante',
          no: 'Foreslå en felles vei fremover',
          da: 'Foreslå en fælles vej fremad',
          fi: 'Ehdota yhteistä tietä eteenpäin'
        } 
      }
    ]
  }
];

export const listFor = (lng: string) => 
  SCENARIOS.map(s => ({ 
    id: s.id, 
    title: s.title[lng] || s.title.en || s.id,
    scenario: s
  }));