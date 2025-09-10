export interface Step {
  sv: string;
  en: string;
}

export interface Scenario {
  id: string;
  title: {
    sv: string;
    en: string;
  };
  steps: Step[];
}

export const VISIT_SCENARIOS: Scenario[] = [
  {
    id: 'say-hard-thing',
    title: {
      sv: 'Säga det svåra',
      en: 'Say the hard thing'
    },
    steps: [
      {
        sv: 'Börja med varför du kom idag (1 mening).',
        en: 'Open with why you came (1 sentence).'
      },
      {
        sv: 'Säg det svåra rakt men vänligt.',
        en: 'Say the hard part plainly but kindly.'
      },
      {
        sv: 'Be om råd eller nästa steg.',
        en: 'Ask for guidance or next step.'
      }
    ]
  },
  {
    id: 'adjust-medication',
    title: {
      sv: 'Be om medicinändring',
      en: 'Ask to adjust medication'
    },
    steps: [
      {
        sv: 'Beskriv effekt och biverkningar (konkret).',
        en: 'Describe effect & side effects specifically.'
      },
      {
        sv: 'När på dygnet märks det mest?',
        en: 'When is it most noticeable?'
      },
      {
        sv: 'Vad vill du testa: dos, tid eller byta?',
        en: 'What do you want to try: dose, timing, or switch?'
      }
    ]
  },
  {
    id: 'use-12-min',
    title: {
      sv: 'Få ut mest av 12 min',
      en: 'Make the most of 12 minutes'
    },
    steps: [
      {
        sv: 'Top 3 frågor: visa listan.',
        en: 'Top 3 questions: show your list.'
      },
      {
        sv: 'Visa symptomgraf (kort).',
        en: 'Show symptom graph briefly.'
      },
      {
        sv: 'Checka att du förstått planen.',
        en: 'Confirm you understood the plan.'
      }
    ]
  }
];