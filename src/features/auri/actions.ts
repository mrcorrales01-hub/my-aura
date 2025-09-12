export type AuriAction =
  | { type: 'nav', to: string, label?: string }
  | { type: 'start_exercise', id: 'breath_478' | 'ground_54321' | 'note_1line', label?: string }
  | { type: 'add_plan', title: string }
  | { type: 'log_journal', title: string, content: string }
  | { type: 'open_roleplay', id: string }

export type AuriPlan = {
  text: string
  bullets: string[]
  question: string
  actions: AuriAction[]
  quickReplies?: string[]
}

const MAP: { test: RegExp; act: AuriAction }[] = [
  { test: /sömn|somna|sleep/i, act: { type: 'start_exercise', id: 'breath_478', label: '4-7-8' } },
  { test: /oro|ångest|panik|anxiety/i, act: { type: 'start_exercise', id: 'ground_54321', label: '5-4-3-2-1' } },
  { test: /besök|doktor|läkare|visit/i, act: { type: 'nav', to: '/besok', label: 'Besök' } },
  { test: /mål|plan|habit|vana/i, act: { type: 'add_plan', title: 'Ett mikrosteg/dag (2-min start)' } },
]

export function planFromText(answer: string, userText: string): AuriPlan {
  // Extract bullets (• or -) and a last question mark
  const bullets = Array.from(answer.matchAll(/[•\-]\s*(.+)/g)).map(m => m[1]).slice(0, 3)
  const question = (answer.split('\n').reverse().find(s => s.trim().endsWith('?')) || 'Vad känns möjligt att börja med?').trim()
  const acts: AuriAction[] = []
  
  for (const rule of MAP) {
    if (rule.test.test(userText) || rule.test.test(answer)) {
      acts.push(rule.act)
    }
  }
  
  // default journal
  acts.push({ type: 'log_journal', title: 'Auri-samtal', content: `Fråga: ${userText}\nSvar: ${answer}` })
  
  return {
    text: answer,
    bullets,
    question,
    actions: dedupeActs(acts),
    quickReplies: makeQR(userText)
  }
}

function makeQR(userText: string): string[] {
  if (/sömn|sleep/i.test(userText)) return ['Har du fler sömntips?', 'Hur minskar jag skärmtid i kväll?']
  if (/oro|ångest|anxiety|panik/i.test(userText)) return ['Fler konkreta grounding-idéer?', 'Hur planerar jag ett oro-fönster?']
  return ['Ge mig nästa 3 steg', 'Har du en 60-sek övning?']
}

function dedupeActs(list: AuriAction[]): AuriAction[] {
  const seen = new Set<string>()
  const out: AuriAction[] = []
  for (const a of list) {
    const k = JSON.stringify(a)
    if (!seen.has(k)) {
      seen.add(k)
      out.push(a)
    }
  }
  return out
}