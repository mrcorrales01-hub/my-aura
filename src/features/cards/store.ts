import { supabase } from '@/integrations/supabase/client';

const LOGS_KEY = 'aura.cards.logs';

export type CardLog = {
  id: string;
  cardId: string;
  timestamp: string;
  note?: string;
}

export function addLog(cardId: string, note?: string): CardLog {
  const logs = listLogs();
  const log: CardLog = {
    id: crypto.randomUUID(),
    cardId,
    timestamp: new Date().toISOString(),
    note
  };
  
  logs.push(log);
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  
  // Soft mirror to Supabase
  mirrorToSupabase(log);
  
  return log;
}

export function listLogs(): CardLog[] {
  try {
    const stored = localStorage.getItem(LOGS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Soft Supabase mirroring
async function mirrorToSupabase(log: CardLog): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    
    // Mirror to exercise_sessions
    await supabase.from('exercise_sessions').insert({
      user_id: session.user.id,
      exercise_id: log.cardId,
      completed_at: log.timestamp
    });
  } catch {
    // Silent fail
  }
}