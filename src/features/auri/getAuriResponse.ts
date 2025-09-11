import { supabase } from '@/integrations/supabase/client'
import { AURI_SYSTEM, localFallback } from './systemPrompt'

const base = `https://rggohnwmajmrvxgfmimk.supabase.co/functions/v1`

export async function streamAuri(payload: { messages: any[], lang: string }, onTok: (t: string) => void) {
  const { data } = await supabase.auth.getSession()
  const jwt = data.session?.access_token
  
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 25000) // 25s timeout
  
  try {
    // Prepare messages with system prompt
    const systemMessage = { role: 'system', content: AURI_SYSTEM(payload.lang) }
    const messagesWithSystem = [systemMessage, ...payload.messages]
    
    const res = await fetch(`${base}/auri-chat`, {
      method: 'POST',
      signal: ctrl.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt || ''}`,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnZ29obndtYWptcnZ4Z2ZtaW1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyOTU2ODUsImV4cCI6MjA2OTg3MTY4NX0.NXYFVDpcnbcCZSRI8sJHU90Hsw4CMIZIoN6GYj0N2q0'
      },
      body: JSON.stringify({ ...payload, messages: messagesWithSystem })
    })
    
    if (!res.ok) {
      // If failed, use local fallback
      const userText = payload.messages[payload.messages.length - 1]?.content || ''
      const fallbackResponse = localFallback(userText, payload.lang)
      onTok(fallbackResponse)
      return
    }
    
    const reader = res.body!.getReader()
    const dec = new TextDecoder()
    
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      if (value) onTok(dec.decode(value))
    }
  } catch (error) {
    // Fallback on any error
    console.error('Auri error:', error)
    const userText = payload.messages[payload.messages.length - 1]?.content || ''
    const fallbackResponse = localFallback(userText, payload.lang)
    onTok(fallbackResponse)
  } finally {
    clearTimeout(timer)
  }
}