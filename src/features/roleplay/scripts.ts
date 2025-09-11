export type Step = { sv: string; en: string }
export type Scenario = { id: string; title: { sv: string; en: string }; steps: Step[] }

export const SCRIPTS: Scenario[] = [
  {
    id: 'say-hard-thing',
    title: { sv: 'Säga det svåra', en: 'Say the hard thing' },
    steps: [
      { sv: 'Säg varför du kom idag (1 mening).', en: 'Say why you came (1 sentence).' },
      { sv: 'Säg det svåra rakt men vänligt.', en: 'Say the hard part plainly but kindly.' },
      { sv: 'Be om nästa steg.', en: 'Ask for next step.' }
    ]
  },
  {
    id: 'adjust-medication',
    title: { sv: 'Be om medicinändring', en: 'Ask to adjust medication' },
    steps: [
      { sv: 'Beskriv effekt/biverkningar kort.', en: 'Describe effect/side effects briefly.' },
      { sv: 'När märks det mest?', en: 'When most noticeable?' },
      { sv: 'Föreslå dos/tid/byte.', en: 'Propose dose/timing/switch.' }
    ]
  },
  {
    id: 'make-most-12',
    title: { sv: 'Få ut mest av 12 min', en: 'Make the most of 12 minutes' },
    steps: [
      { sv: 'Lista dina topp 3 frågor.', en: 'List your top 3 questions.' },
      { sv: 'Visa symtomtrend i en mening.', en: 'Show a one-line symptom trend.' },
      { sv: 'Kom överens om uppföljning.', en: 'Agree on follow-up.' }
    ]
  }
];