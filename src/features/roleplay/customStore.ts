const KEY = 'aura.roleplay.custom'

export type CustomRoleplay = {
  id: string
  name: string
  steps: string[]
  createdAt: string
  shareToken?: string
}

export function listCustom(): CustomRoleplay[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}

export function saveCustom(roleplay: Omit<CustomRoleplay, 'id' | 'createdAt'>): CustomRoleplay {
  const roleplays = listCustom()
  const newRoleplay: CustomRoleplay = {
    ...roleplay,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    shareToken: generateShareToken()
  }
  
  roleplays.push(newRoleplay)
  localStorage.setItem(KEY, JSON.stringify(roleplays))
  return newRoleplay
}

export function deleteCustom(id: string): void {
  const roleplays = listCustom().filter(r => r.id !== id)
  localStorage.setItem(KEY, JSON.stringify(roleplays))
}

function generateShareToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 24; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}