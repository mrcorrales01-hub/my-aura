import { supabase } from '@/integrations/supabase/client';

const base = `https://rggohnwmajmrvxgfmimk.supabase.co/functions/v1`;

export async function streamAuriResponse(
  payload: { messages: any[], lang: string },
  onToken: (t: string) => void
) {
  const { data: { session } } = await supabase.auth.getSession();
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 30_000); // 30s safety

  try {
    const res = await fetch(`${base}/auri-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token ?? ''}`,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnZ29obndtYWptcnZ4Z2ZtaW1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyOTU2ODUsImV4cCI6MjA2OTg3MTY4NX0.NXYFVDpcnbcCZSRI8sJHU90Hsw4CMIZIoN6GYj0N2q0'
      },
      body: JSON.stringify(payload),
      signal: ctrl.signal
    });

    if (!res.ok) throw new Error(`auri-chat ${res.status}`);
    
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let done = false;
    
    while (!done) {
      const { value, done: d } = await reader.read();
      done = d;
      if (value) {
        onToken(decoder.decode(value));
      }
    }
  } finally {
    clearTimeout(t);
  }
}