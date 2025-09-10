import { supabase } from '@/integrations/supabase/client'

const base = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`

export async function streamAuri(payload: { messages: any[], lang: string }, onTok: (t: string) => void) {
  const { data: { session } } = await supabase.auth.getSession()
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 30000)
  
  try {
    const res = await fetch(`${base}/auri-chat`, {
      method: 'POST',
      signal: ctrl.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token ?? ''}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
      },
      body: JSON.stringify(payload)
    })
    
    if (!res.ok) throw new Error(`auri ${res.status}`)
    
    const reader = res.body!.getReader()
    const dec = new TextDecoder()
    
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      if (value) onTok(dec.decode(value))
    }
  } finally {
    clearTimeout(timer)
  }
}