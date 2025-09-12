export type AgendaItem = { id: string; text: string; ts: string }

const KEY = 'aura.auri.agenda'

export function addAgenda(items: string[]): AgendaItem[] {
  const arr = getAgenda()
  const now = new Date().toISOString()
  
  items.filter(Boolean).forEach(t => 
    arr.unshift({ id: crypto.randomUUID(), text: t, ts: now })
  )
  
  localStorage.setItem(KEY, JSON.stringify(arr.slice(0, 20)))
  return arr
}

export function getAgenda(): AgendaItem[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}