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
      { sv: 'Effekt/biverkningar, konkret.', en: 'Effect/side effects, be specific.' },
      { sv: 'När märks det mest?', en: 'When most noticeable?' },
      { sv: 'Vad vill du testa: dos/tid/byte?', en: 'Try: dose/timing/switch?' }
    ]
  },
  {
    id: 'make-most-12',
    title: { sv: 'Få ut mest av 12 min', en: 'Make the most of 12 minutes' },
    steps: [
      { sv: 'Top 3 frågor: visa listan.', en: 'Top 3 questions: show list.' },
      { sv: 'Visa kort symtomtrend.', en: 'Show brief symptom trend.' },
      { sv: 'Bekräfta plan och uppföljning.', en: 'Confirm plan & follow-up.' }
    ]
  }
];