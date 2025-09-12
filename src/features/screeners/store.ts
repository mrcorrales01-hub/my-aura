import { ScreenerId } from './items';

export type ScreenerResult = {
  date: string;
  id: ScreenerId;
  score: number;
  severity: string;
  answers: number[];
};

const STORAGE_KEY = 'aura.screener_results';

export function getResults(): ScreenerResult[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveResult(entry: ScreenerResult) {
  try {
    const results = getResults();
    results.push(entry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
    
    // Optional Supabase sync
    saveToSupabase(entry).catch(console.warn);
  } catch (e) {
    console.warn('Failed to save screener result:', e);
  }
}

async function saveToSupabase(entry: ScreenerResult) {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      await supabase.from('self_assessments').insert({
        assessment_type: entry.id,
        total_score: entry.score,
        severity_level: entry.severity,
        completed_at: entry.date,
        user_id: session.user.id
      });
    }
  } catch (e) {
    console.warn('Supabase sync failed:', e);
  }
}

export function getLatestResult(screenerId: ScreenerId): ScreenerResult | null {
  const results = getResults().filter(r => r.id === screenerId);
  return results.length ? results[results.length - 1] : null;
}