const KEY = 'aura.memory.notes'

export type Memory = {
  ts: string
  lang: string
  topics: string[]
  summary: string
}

export function addMemory(summary: string, lang = 'sv'): Memory {
  const topics = Array.from(
    summary.toLowerCase().matchAll(/\b(sömn|oro|ångest|panik|motivation|relation|arbete|studier)\b/g)
  ).map(m => m[1])
  
  const arr = getAll()
  const memory = {
    ts: new Date().toISOString(),
    lang,
    topics,
    summary
  }
  
  arr.unshift(memory)
  localStorage.setItem(KEY, JSON.stringify(arr.slice(0, 50)))
  return memory
}

export function getAll(): Memory[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}