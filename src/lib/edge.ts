import { supabase } from '@/integrations/supabase/client';

export async function callEdge(fn: string, body: any) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  
  const res = await fetch(`https://rggohnwmajmrvxgfmimk.supabase.co/functions/v1/${fn}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body ?? {})
  });
  
  const text = await res.text();
  let json: any = null;
  try { 
    json = JSON.parse(text); 
  } catch {}
  
  if (!res.ok) {
    console.warn(`[edge:${fn}] ${res.status}`, text);
    throw new Error(json?.message || text || `Edge function ${fn} failed`);
  }
  
  return json ?? text;
}
