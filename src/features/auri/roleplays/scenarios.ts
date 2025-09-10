export type Step = { goal: Record<string, string>; hints?: Record<string, string> }
export type Scenario = { id: string; title: Record<string, string>; steps: Step[] }

export const SCENARIOS: Scenario[] = [
  {
    id: 'boundary-setting',
    title: { sv: 'Sätta gränser', en: 'Boundary Setting' },
    steps: [
      { goal: { sv: 'Beskriv situationen lugnt.', en: 'Describe the situation calmly.' } },
      { goal: { sv: 'Säg vad du behöver.', en: 'State what you need.' } },
      { goal: { sv: 'Kom överens om nästa steg.', en: 'Agree the next step.' } }
    ]
  },
  {
    id: 'panic-grounding',
    title: { sv: 'Oro → Grounding 5-4-3-2-1', en: 'Anxiety → Grounding' },
    steps: [
      { goal: { sv: 'Andas långsamt in/ut (2 varv).', en: 'Slow inhale/exhale twice.' } },
      { goal: { sv: '5-4-3-2-1: notera sinnesintryck.', en: '5-4-3-2-1 senses check.' } }
    ]
  },
  {
    id: 'productive-disagreement',
    title: { sv: 'Konstruktiv oenighet', en: 'Productive Disagreement' },
    steps: [
      { goal: { sv: 'Sammanfatta den andres poäng.', en: "Summarize the other's point." } },
      { goal: { sv: 'Dela din ståndpunkt lugnt.', en: 'Share your view calmly.' } },
      { goal: { sv: 'Föreslå gemensam lösning.', en: 'Propose a joint next step.' } }
    ]
  }
]

export const listFor = (lng: string) => SCENARIOS.map(s => ({ 
  id: s.id, 
  title: s.title[lng] || s.title.en || s.id,
  scenario: s
}))