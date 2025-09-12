import { VisitBundle } from './types';
import { supabase } from '@/integrations/supabase/client';

function generateId(): string {
  return crypto.randomUUID();
}

function generateShareToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 24; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function getStorageKey(userId?: string): string {
  return `aura.visit.${userId || 'anon'}`;
}

function getBundles(userId?: string): VisitBundle[] {
  try {
    const stored = localStorage.getItem(getStorageKey(userId));
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveBundles(bundles: VisitBundle[], userId?: string) {
  try {
    // Keep only latest 5
    const latest = bundles.slice(-5);
    localStorage.setItem(getStorageKey(userId), JSON.stringify(latest));
  } catch (error) {
    console.error('Failed to save visit bundles:', error);
  }
}

export function getLatest(userId?: string): VisitBundle | null {
  const bundles = getBundles(userId);
  return bundles.length > 0 ? bundles[bundles.length - 1] : null;
}

export function upsert(bundle: Partial<VisitBundle>, userId?: string): VisitBundle {
  const bundles = getBundles(userId);
  
  let existingBundle: VisitBundle;
  const existingIndex = bundles.findIndex(b => b.id === bundle.id);
  
  if (existingIndex >= 0) {
    // Update existing
    existingBundle = {
      ...bundles[existingIndex],
      ...bundle,
      updatedAt: new Date().toISOString()
    };
    bundles[existingIndex] = existingBundle;
  } else {
    // Create new
    existingBundle = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lang: 'sv',
      ...bundle
    } as VisitBundle;
    bundles.push(existingBundle);
  }
  
  // Ensure share token exists
  if (!existingBundle.shareToken) {
    existingBundle.shareToken = generateShareToken();
  }
  
  saveBundles(bundles, userId);
  
  // Mirror to Supabase if available
  syncToSupabase(existingBundle, userId);
  
  return existingBundle;
}

export function byToken(token: string): VisitBundle | null {
  // Search across all stored bundles (anonymous and user-specific)
  const keys = Object.keys(localStorage).filter(key => key.startsWith('aura.visit.'));
  
  for (const key of keys) {
    try {
      const bundles = JSON.parse(localStorage.getItem(key) || '[]');
      const bundle = bundles.find((b: VisitBundle) => b.shareToken === token);
      if (bundle) return bundle;
    } catch {
      continue;
    }
  }
  
  return null;
}

export function deleteLatest(userId?: string) {
  const bundles = getBundles(userId);
  if (bundles.length > 0) {
    bundles.pop();
    saveBundles(bundles, userId);
  }
}

async function syncToSupabase(bundle: VisitBundle, userId?: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    // Mirror to self_assessments
    const overallSeverity = bundle.scores ? 
      ['green', 'amber', 'red'][Math.max(
        bundle.scores.sleep?.severity === 'red' ? 2 : bundle.scores.sleep?.severity === 'amber' ? 1 : 0,
        bundle.scores.gad7?.severity === 'red' ? 2 : bundle.scores.gad7?.severity === 'amber' ? 1 : 0,
        bundle.scores.phq9?.severity === 'red' ? 2 : bundle.scores.phq9?.severity === 'amber' ? 1 : 0
      )] : 'green';
      
    await supabase.from('self_assessments').upsert({
      user_id: user.id,
      assessment_type: 'visit_bundle',
      total_score: (bundle.scores?.sleep?.score || 0) + 
                   (bundle.scores?.gad7?.score || 0) + 
                   (bundle.scores?.phq9?.score || 0),
      severity_level: overallSeverity,
      completed_at: bundle.updatedAt,
      questions_answers: {
        sleep: bundle.sleep,
        gad7: bundle.gad7,
        phq9: bundle.phq9,
        scores: bundle.scores
      }
    });
  } catch (error) {
    console.error('Failed to sync to Supabase:', error);
  }
}

export function addToJournal(bundle: VisitBundle) {
  return syncJournalEntry(bundle);
}

async function syncJournalEntry(bundle: VisitBundle) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const content = `# Besök – sammanfattning

## Poängsummering
${bundle.scores?.sleep ? `- **Sömn**: ${bundle.scores.sleep.score} (${bundle.scores.sleep.severity})` : ''}
${bundle.scores?.gad7 ? `- **Ångest (GAD-7)**: ${bundle.scores.gad7.score} (${bundle.scores.gad7.severity})` : ''}
${bundle.scores?.phq9 ? `- **Nedstämdhet (PHQ-9)**: ${bundle.scores.phq9.score} (${bundle.scores.phq9.severity})` : ''}

${bundle.notes ? `## Mina anteckningar\n${bundle.notes}` : ''}

*Skapad: ${new Date(bundle.createdAt).toLocaleDateString('sv-SE')}*`;

    await supabase.from('journal_entries').insert({
      user_id: user.id,
      title: 'Besök – sammanfattning',
      content
    });
  } catch (error) {
    console.error('Failed to sync journal entry:', error);
  }
}
