import { supabase } from '@/integrations/supabase/client'
import { AURI_SYSTEM } from './systemPrompt'
import { openers } from './openers'
import { needsDiversify, createDiversityPrompt } from './antiRepeat'

const base = `https://rggohnwmajmrvxgfmimk.supabase.co/functions/v1`

let lastOpener = '';
let lastAssistantMessage = '';

export const localFallback = (text: string, lang: string): string => {
  // Detect intent
  const lowerText = text.toLowerCase();
  let intent = 'generic';
  if (lowerText.includes('stress') || lowerText.includes('orolig')) intent = 'stress';
  else if (lowerText.includes('sömn') || lowerText.includes('sleep')) intent = 'sleep';
  else if (lowerText.includes('motivation') || lowerText.includes('orka')) intent = 'motivation';
  else if (lowerText.includes('sorg') || lowerText.includes('grief')) intent = 'grief';

  // Pick opener that's different from last
  const availableOpeners = openers[intent] || openers.generic;
  let opener = availableOpeners[Math.floor(Math.random() * availableOpeners.length)];
  if (opener === lastOpener && availableOpeners.length > 1) {
    opener = availableOpeners.find(o => o !== lastOpener) || opener;
  }
  lastOpener = opener;

  // Generate varied steps
  const verbs = ['Testa', 'Pröva', 'Byt', 'Gör', 'Notera', 'Försök'];
  const steps = [
    `• ${verbs[0]} att ta tre djupa andetag nu`,
    `• ${verbs[1]} att identifiera en konkret sak du kan göra idag`,
    `• ${verbs[2]} ut till någon du litar på för stöd`
  ];

  const question = 'Vad känns som det första steget för dig?';
  
  return [opener, ...steps, question].join('\n');
};

export async function streamAuri(payload: { messages: any[], lang: string, activeFlow?: string, currentStep?: string }, onTok: (t: string) => void) {
  const { data } = await supabase.auth.getSession()
  const jwt = data.session?.access_token
  
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 25000) // 25s timeout
  
  let accumulatedResponse = '';
  
  try {
    // Prepare messages with system prompt and optional coach context
    const systemMessage = { role: 'system', content: AURI_SYSTEM(payload.lang) }
    const messagesWithSystem = [systemMessage, ...payload.messages]
    
    // Add coach context if provided
    const enhancedPayload = {
      ...payload,
      messages: messagesWithSystem,
      metadata: {
        active_flow: payload.activeFlow,
        current_step_title: payload.currentStep
      }
    };
    
    const res = await fetch(`${base}/auri-chat`, {
      method: 'POST',
      signal: ctrl.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt || ''}`,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnZ29obndtYWptcnZ4Z2ZtaW1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyOTU2ODUsImV4cCI6MjA2OTg3MTY4NX0.NXYFVDpcnbcCZSRI8sJHU90Hsw4CMIZIoN6GYj0N2q0'
      },
      body: JSON.stringify(enhancedPayload)
    })
    
    if (!res.ok) {
      console.warn('Auri API failed:', res.status, res.statusText);
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
      if (value) {
        const chunk = dec.decode(value);
        accumulatedResponse += chunk;
        onTok(chunk);
      }
    }
    
    // Check for diversity after complete response
    if (accumulatedResponse && needsDiversify(lastAssistantMessage, accumulatedResponse)) {
      console.log('Response needs diversity, regenerating...');
      
      // Create diversity prompt
      const userText = payload.messages[payload.messages.length - 1]?.content || '';
      const diversityPrompt = createDiversityPrompt(userText, payload.lang);
      
      // Try to get a more diverse response
      try {
        const diversityPayload = {
          ...payload,
          messages: [
            { role: 'system', content: AURI_SYSTEM(payload.lang) },
            { role: 'user', content: diversityPrompt }
          ]
        };
        
        const diversityRes = await fetch(`${base}/auri-chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt || ''}`,
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnZ29obndtYWptcnZ4Z2ZtaW1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyOTU2ODUsImV4cCI6MjA2OTg3MTY4NX0.NXYFVDpcnbcCZSRI8sJHU90Hsw4CMIZIoN6GYj0N2q0'
          },
          body: JSON.stringify(diversityPayload)
        });
        
        if (diversityRes.ok) {
          // Clear previous response and stream new one
          onTok('\n\n--- Diversified Response ---\n');
          const diversityReader = diversityRes.body!.getReader();
          let newResponse = '';
          
          while (true) {
            const { value, done } = await diversityReader.read();
            if (done) break;
            if (value) {
              const chunk = dec.decode(value);
              newResponse += chunk;
              onTok(chunk);
            }
          }
          
          accumulatedResponse = newResponse;
        }
      } catch (error) {
        console.error('Diversity regeneration failed:', error);
      }
    }
    
    // Store for next comparison
    lastAssistantMessage = accumulatedResponse;
    
  } catch (error) {
    console.error('Auri error:', error)
    const userText = payload.messages[payload.messages.length - 1]?.content || ''
    const fallbackResponse = localFallback(userText, payload.lang)
    onTok(fallbackResponse)
    lastAssistantMessage = fallbackResponse;
  } finally {
    clearTimeout(timer)
  }
}