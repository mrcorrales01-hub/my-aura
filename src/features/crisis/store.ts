import { TriageResult, SafetyPlan, SafetyContact } from './types';
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

export function getTriage(): TriageResult | null {
  try {
    const stored = localStorage.getItem('aura.crisis.triage');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function saveTriage(result: TriageResult): void {
  try {
    localStorage.setItem('aura.crisis.triage', JSON.stringify(result));
    
    // Mirror to Supabase if available
    syncTriageToSupabase(result);
  } catch (error) {
    console.error('Failed to save triage result:', error);
  }
}

export function getPlan(): SafetyPlan | null {
  try {
    const stored = localStorage.getItem('aura.crisis.plan');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function savePlan(planData: Partial<SafetyPlan>): SafetyPlan {
  const existing = getPlan();
  
  const plan: SafetyPlan = {
    id: existing?.id || generateId(),
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lang: 'sv',
    signals: [],
    coping: [],
    people: [],
    places: [],
    reasons: [],
    removeMeans: [],
    professionals: [],
    checkinEveryMin: 60,
    remindersOn: false,
    ...existing,
    ...planData,
  };
  
  // Ensure share token exists
  if (!plan.shareToken) {
    plan.shareToken = generateShareToken();
  }
  
  try {
    localStorage.setItem('aura.crisis.plan', JSON.stringify(plan));
    
    // Mirror to Supabase if available
    syncPlanToSupabase(plan);
  } catch (error) {
    console.error('Failed to save safety plan:', error);
  }
  
  return plan;
}

export function getContactsDefault(): SafetyContact[] {
  try {
    const stored = localStorage.getItem('aura.crisis.contacts');
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Default Swedish contacts if Swedish locale
    const locale = navigator.language || 'en';
    if (locale.includes('sv') || locale.includes('SE')) {
      return [
        { name: '112 - Akutjournal', phone: '112' },
        { name: '1177 - Sjukvårdsrådgivning', phone: '1177' },
        { name: 'Mind Självmordslinjen', phone: '90101' },
        { name: 'Jourhavande präst', phone: '020-22 22 00' }
      ];
    }
    
    // Generic fallbacks
    return [
      { name: 'Emergency Services', phone: '112' },
      { name: 'Crisis Helpline', phone: '' }
    ];
  } catch {
    return [];
  }
}

export function getPlanByToken(token: string): SafetyPlan | null {
  // Search across all stored plans (this is a simplified version)
  // In a real implementation, you might want to search across multiple storage keys
  const plan = getPlan();
  if (plan?.shareToken === token) {
    return plan;
  }
  return null;
}

async function syncTriageToSupabase(result: TriageResult) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    await supabase.from('crisis_interactions').insert({
      user_id: user.id,
      crisis_level: result.level,
      action_taken: 'triage_assessment',
      notes: JSON.stringify(result.answers)
    });
  } catch (error) {
    console.error('Failed to sync triage to Supabase:', error);
  }
}

async function syncPlanToSupabase(plan: SafetyPlan) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    // Save to safety_networks for each contact
    for (const contact of [...plan.people, ...plan.professionals]) {
      if (contact.name) {
        await supabase.from('safety_networks').upsert({
          user_id: user.id,
          contact_name: contact.name,
          phone_number: contact.phone,
          email: contact.email,
          relationship: 'crisis_contact',
          emergency_contact: true,
          verification_status: 'pending'
        });
      }
    }
  } catch (error) {
    console.error('Failed to sync plan to Supabase:', error);
  }
}

export function addToJournal(plan: SafetyPlan) {
  return syncJournalEntry(plan);
}

async function syncJournalEntry(plan: SafetyPlan) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // Fallback to localStorage
      const journalEntries = JSON.parse(localStorage.getItem('aura.journal') || '[]');
      journalEntries.push({
        id: generateId(),
        title: 'Säkerhetsplan',
        content: createPlanMarkdown(plan),
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('aura.journal', JSON.stringify(journalEntries));
      return;
    }
    
    await supabase.from('journal_entries').insert({
      user_id: user.id,
      title: 'Säkerhetsplan',
      content: createPlanMarkdown(plan)
    });
  } catch (error) {
    console.error('Failed to sync journal entry:', error);
  }
}

function createPlanMarkdown(plan: SafetyPlan): string {
  return `# ${plan.name || 'Min säkerhetsplan'}

## Varningssignaler
${plan.signals.map(s => `- ${s}`).join('\n')}

## Copingstrategier
${plan.coping.map(c => `- ${c}`).join('\n')}

## Stödpersoner
${plan.people.map(p => `- ${p.name}${p.phone ? ` (${p.phone})` : ''}`).join('\n')}

## Trygga platser
${plan.places.map(p => `- ${p}`).join('\n')}

## Viktiga skäl
${plan.reasons.map(r => `- ${r}`).join('\n')}

*Skapad: ${new Date(plan.createdAt).toLocaleDateString('sv-SE')}*`;
}