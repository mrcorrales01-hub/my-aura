import { supabase } from '@/integrations/supabase/client';

export async function streamAuriResponse(
  payload: { messages: any[], lang: string, user_id?: string },
  onToken: (t: string) => void
) {
  const { data: { session } } = await supabase.auth.getSession();
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 30_000);

  const baseUrl = 'https://rggohnwmajmrvxgfmimk.supabase.co/functions/v1';
  
  try {
    const res = await fetch(`${baseUrl}/auri-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token ?? ''}`,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnZ29obndtYWptcnZ4Z2ZtaW1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyOTU2ODUsImV4cCI6MjA2OTg3MTY4NX0.NXYFVDpcnbcCZSRI8sJHU90Hsw4CMIZIoN6GYj0N2q0'
      },
      body: JSON.stringify({
        ...payload,
        user_id: session?.user?.id
      }),
      signal: ctrl.signal
    });

    if (!res.ok) {
      throw new Error(`auri-chat ${res.status}`);
    }
    
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      
      if (value) {
        const chunk = decoder.decode(value);
        onToken(chunk);
      }
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}