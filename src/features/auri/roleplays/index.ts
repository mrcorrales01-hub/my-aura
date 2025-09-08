// Roleplay system types and loader

export interface RoleplayStep {
  id: number;
  goal: Record<string, string>; // Localized goals
  hints: Record<string, string[]>; // Localized hints
  rubric: string; // Scoring rubric for AI
}

export interface RoleplayScenario {
  id: string;
  title: Record<string, string>; // Localized titles
  persona: string; // AI persona description
  languageStyle: string; // AI language style instructions
  steps: RoleplayStep[];
}

export interface RoleplayState {
  scenarioId: string | null;
  currentStep: number;
  stepScores: number[];
  transcript: Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }>;
  coachNotes: string[];
  isComplete: boolean;
  language: string;
}

export interface RoleplayStepResult {
  stream: string;
  stepScore: number;
  coachNote: string;
  nextStep: number | null;
  finished: boolean;
}

// Load scenario by ID and language
export const getScenario = (scenarioId: string): RoleplayScenario | null => {
  const scenarios = getAllScenarios();
  return scenarios.find(s => s.id === scenarioId) || null;
};

// Get all available scenarios
export const getAllScenarios = (): RoleplayScenario[] => {
  return [
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
      persona: 'You are Auri, a supportive wellness coach helping someone practice setting healthy boundaries. You are empathetic, encouraging, and provide realistic scenarios.',
      languageStyle: 'Simple, warm, 2–3 sentences per turn. Ask open-ended questions to guide reflection.',
      steps: [
        {
          id: 1,
          goal: {
            sv: 'Identifiera situationen där gränser behövs',
            en: 'Identify the situation where boundaries are needed',
            es: 'Identificar la situación donde se necesitan límites',
            no: 'Identifiser situasjonen der grenser trengs',
            da: 'Identificer situationen hvor grænser er nødvendige',
            fi: 'Tunnista tilanne jossa rajoja tarvitaan'
          },
          hints: {
            sv: ['Fråga om specifika exempel', 'Utforska känslor kring situationen'],
            en: ['Ask for specific examples', 'Explore feelings about the situation'],
            es: ['Pide ejemplos específicos', 'Explora sentimientos sobre la situación'],
            no: ['Spør om spesifikke eksempler', 'Utforsk følelser rundt situasjonen'],
            da: ['Spørg om specifikke eksempler', 'Udforsk følelser omkring situationen'],
            fi: ['Kysy konkreettisia esimerkkejä', 'Tutki tunteita tilanteesta']
          },
          rubric: 'Score 0-5 based on clarity of situation identification, emotional awareness, and specificity of examples provided.'
        },
        {
          id: 2,
          goal: {
            sv: 'Formulera tydliga gränser',
            en: 'Formulate clear boundaries',
            es: 'Formular límites claros',
            no: 'Formuler klare grenser',
            da: 'Formuler klare grænser',
            fi: 'Muotoile selkeät rajat'
          },
          hints: {
            sv: ['Använd "jag"-meddelanden', 'Var specifik och tydlig'],
            en: ['Use "I" statements', 'Be specific and clear'],
            es: ['Usa declaraciones "yo"', 'Sé específico y claro'],
            no: ['Bruk "jeg"-utsagn', 'Vær spesifikk og tydelig'],
            da: ['Brug "jeg"-udsagn', 'Vær specifik og klar'],
            fi: ['Käytä "minä"-lauseita', 'Ole tarkka ja selkeä']
          },
          rubric: 'Score 0-5 based on clarity of boundary statement, use of assertive language, and appropriateness to the situation.'
        },
        {
          id: 3,
          goal: {
            sv: 'Öva på att kommunicera gränser respektfullt',
            en: 'Practice communicating boundaries respectfully',
            es: 'Practicar comunicar límites respetuosamente',
            no: 'Øv på å kommunisere grenser respektfullt',
            da: 'Øv dig i at kommunikere grænser respektfuldt',
            fi: 'Harjoittele rajojen kunnioittavaa viestintää'
          },
          hints: {
            sv: ['Håll lugn och bestämd ton', 'Förklara dina behov'],
            en: ['Maintain calm and firm tone', 'Explain your needs'],
            es: ['Mantén un tono calmado y firme', 'Explica tus necesidades'],
            no: ['Hold rolig og bestemt tone', 'Forklar dine behov'],
            da: ['Hold rolig og bestemt tone', 'Forklar dine behov'],
            fi: ['Pidä rauhallinen ja päättäväinen sävy', 'Selitä tarpeesi']
          },
          rubric: 'Score 0-5 based on tone appropriateness, respect for others, clarity of communication, and confidence in delivery.'
        }
      ]
    },
    {
      id: 'conflict-resolution',
      title: {
        sv: 'Konfliktlösning',
        en: 'Conflict Resolution',
        es: 'Resolución de Conflictos',
        no: 'Konfliktløsning',
        da: 'Konfliktløsning',
        fi: 'Konfliktinratkaisu'
      },
      persona: 'You are Auri, helping someone navigate and resolve interpersonal conflicts constructively. You emphasize empathy, active listening, and finding win-win solutions.',
      languageStyle: 'Calm, balanced, thoughtful responses. Guide the user through structured conflict resolution steps.',
      steps: [
        {
          id: 1,
          goal: {
            sv: 'Förstå konflikten från alla perspektiv',
            en: 'Understand the conflict from all perspectives',
            es: 'Entender el conflicto desde todas las perspectivas',
            no: 'Forstå konflikten fra alle perspektiver',
            da: 'Forstå konflikten fra alle perspektiver',
            fi: 'Ymmärrä konflikti kaikista näkökulmista'
          },
          hints: {
            sv: ['Lyssna aktivt på alla parter', 'Identifiera kärnfrågan'],
            en: ['Listen actively to all parties', 'Identify the core issue'],
            es: ['Escucha activamente a todas las partes', 'Identifica el problema central'],
            no: ['Lytt aktivt til alle parter', 'Identifiser kjerneproblemet'],
            da: ['Lyt aktivt til alle parter', 'Identificer kerneproblemet'],
            fi: ['Kuuntele aktiivisesti kaikkia osapuolia', 'Tunnista ydinasia']
          },
          rubric: 'Score 0-5 based on ability to see multiple perspectives, identify root causes, and demonstrate empathy.'
        },
        {
          id: 2,
          goal: {
            sv: 'Hitta gemensam grund',
            en: 'Find common ground',
            es: 'Encontrar terreno común',
            no: 'Finn felles grunn',
            da: 'Find fælles grundlag',
            fi: 'Löydä yhteinen pohja'
          },
          hints: {
            sv: ['Fokusera på delade värden', 'Sök ömsesidiga fördelar'],
            en: ['Focus on shared values', 'Look for mutual benefits'],
            es: ['Enfócate en valores compartidos', 'Busca beneficios mutuos'],
            no: ['Fokuser på delte verdier', 'Se etter gjensidig nytte'],
            da: ['Fokuser på delte værdier', 'Se efter gensidige fordele'],
            fi: ['Keskity yhteisiin arvoihin', 'Etsi molemminpuolisia etuja']
          },
          rubric: 'Score 0-5 based on creativity in finding commonalities, focus on shared goals, and collaborative approach.'
        }
      ]
    },
    {
      id: 'public-speaking-anxiety',
      title: {
        sv: 'Hantera talångest',
        en: 'Managing Public Speaking Anxiety',
        es: 'Manejar la Ansiedad de Hablar en Público',
        no: 'Håndtere taleangst',
        da: 'Håndtere taleangst',
        fi: 'Esiintymisahdistuksen hallinta'
      },
      persona: 'You are Auri, a compassionate coach helping someone overcome public speaking anxiety. You provide practical techniques and emotional support.',
      languageStyle: 'Reassuring, practical, encouraging. Break down anxiety management into manageable steps.',
      steps: [
        {
          id: 1,
          goal: {
            sv: 'Identifiera specifika rädslor och utlösare',
            en: 'Identify specific fears and triggers',
            es: 'Identificar miedos específicos y desencadenantes',
            no: 'Identifiser spesifikke frykter og utløsere',
            da: 'Identificer specifikke frygt og udløsere',
            fi: 'Tunnista erityiset pelot ja laukaisimet'
          },
          hints: {
            sv: ['Vad är det värsta som kan hända?', 'Vilka fysiska symptom märker du?'],
            en: ['What\'s the worst that could happen?', 'What physical symptoms do you notice?'],
            es: ['¿Qué es lo peor que podría pasar?', '¿Qué síntomas físicos notas?'],
            no: ['Hva er det verste som kan skje?', 'Hvilke fysiske symptomer legger du merke til?'],
            da: ['Hvad er det værste der kan ske?', 'Hvilke fysiske symptomer bemærker du?'],
            fi: ['Mikä on pahinta mitä voi tapahtua?', 'Mitä fyysisiä oireita huomaat?']
          },
          rubric: 'Score 0-5 based on self-awareness of anxiety triggers, honesty about fears, and understanding of physical responses.'
        }
      ]
    }
  ];
};

// Calculate final score for a completed roleplay
export const calculateFinalScore = (stepScores: number[]): number => {
  if (stepScores.length === 0) return 0;
  return Math.round((stepScores.reduce((sum, score) => sum + score, 0) / stepScores.length) * 10) / 10;
};

// Export transcript as JSON
export const exportTranscript = (state: RoleplayState, scenario: RoleplayScenario): string => {
  const exportData = {
    scenario: {
      id: state.scenarioId,
      title: scenario.title[state.language] || scenario.title.en,
    },
    language: state.language,
    completed: state.isComplete,
    finalScore: state.isComplete ? calculateFinalScore(state.stepScores) : null,
    steps: state.stepScores.map((score, index) => ({
      step: index + 1,
      score,
      coachNote: state.coachNotes[index] || ''
    })),
    transcript: state.transcript.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp.toISOString()
    })),
    exportedAt: new Date().toISOString()
  };

  return JSON.stringify(exportData, null, 2);
};