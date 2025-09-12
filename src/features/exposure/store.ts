import { ExposurePlan, ExposureSession } from './types';
import { supabase } from '@/integrations/supabase/client';

const PLANS_KEY = 'aura.exposure.plans';
const SESSIONS_KEY = 'aura.exposure.sessions';

// Generate base62 24-char tokens for share links
function generateShareToken(): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < 24; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function listPlans(): ExposurePlan[] {
  try {
    const stored = localStorage.getItem(PLANS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function getPlan(id: string): ExposurePlan | null {
  const plans = listPlans();
  return plans.find(p => p.id === id) || null;
}

export function savePlan(plan: Partial<ExposurePlan>): ExposurePlan {
  const plans = listPlans();
  const now = new Date().toISOString();
  
  let savedPlan: ExposurePlan;
  
  if (plan.id) {
    // Update existing
    const index = plans.findIndex(p => p.id === plan.id);
    if (index !== -1) {
      savedPlan = { ...plans[index], ...plan, updatedAt: now } as ExposurePlan;
      plans[index] = savedPlan;
    } else {
      savedPlan = {
        id: plan.id,
        name: plan.name || '',
        situation: plan.situation || '',
        steps: plan.steps || [],
        createdAt: now,
        updatedAt: now,
        lang: 'sv',
        shareToken: generateShareToken(),
        ...plan
      } as ExposurePlan;
      plans.push(savedPlan);
    }
  } else {
    // Create new
    savedPlan = {
      id: crypto.randomUUID(),
      name: plan.name || '',
      situation: plan.situation || '',
      steps: plan.steps || [],
      createdAt: now,
      updatedAt: now,
      lang: 'sv',
      shareToken: generateShareToken(),
      ...plan
    } as ExposurePlan;
    plans.push(savedPlan);
  }
  
  localStorage.setItem(PLANS_KEY, JSON.stringify(plans));
  
  // Soft mirror to Supabase
  mirrorPlanToSupabase(savedPlan);
  
  return savedPlan;
}

export function deletePlan(id: string): void {
  const plans = listPlans().filter(p => p.id !== id);
  localStorage.setItem(PLANS_KEY, JSON.stringify(plans));
}

export function listSessions(): ExposureSession[] {
  try {
    const stored = localStorage.getItem(SESSIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function startSession(params: { planId: string; stepId: string; before: number }): ExposureSession {
  const sessions = listSessions();
  const session: ExposureSession = {
    id: crypto.randomUUID(),
    planId: params.planId,
    stepId: params.stepId,
    before: params.before,
    startedAt: new Date().toISOString()
  };
  
  sessions.push(session);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  
  return session;
}

export function endSession(params: { sessionId: string; after?: number; minutes?: number; notes?: string }): void {
  const sessions = listSessions();
  const index = sessions.findIndex(s => s.id === params.sessionId);
  
  if (index !== -1) {
    sessions[index] = {
      ...sessions[index],
      after: params.after,
      minutes: params.minutes,
      notes: params.notes,
      endedAt: new Date().toISOString()
    };
    
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    
    // Mirror to journal
    mirrorSessionToJournal(sessions[index]);
  }
}

export function getSessionsForPlan(planId: string): ExposureSession[] {
  return listSessions().filter(s => s.planId === planId);
}

// Soft Supabase mirroring (never throws)
async function mirrorPlanToSupabase(plan: ExposurePlan): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    
    // Try to insert/update in exercises as fallback storage
    await supabase.from('exercises').upsert({
      id: plan.id,
      slug: plan.id,
      title: { sv: plan.name, en: plan.name },
      description: { sv: plan.situation, en: plan.situation },
      duration_seconds: 300,
      tags: ['exposure']
    });
  } catch {
    // Silent fail
  }
}

async function mirrorSessionToJournal(session: ExposureSession): Promise<void> {
  try {
    const { data: { session: authSession } } = await supabase.auth.getSession();
    if (!authSession) return;
    
    const plan = getPlan(session.planId);
    if (!plan) return;
    
    const step = plan.steps.find(s => s.id === session.stepId);
    const title = `Exposure – ${plan.name}`;
    const content = `Step: ${step?.label || 'Unknown'}\nBefore: ${session.before}/10\nAfter: ${session.after || 'N/A'}/10\nDuration: ${session.minutes || 'N/A'} min\nNotes: ${session.notes || 'None'}`;
    
    await supabase.from('journal_entries').insert({
      user_id: authSession.user.id,
      title,
      content,
      mood_score: session.after || session.before
    });
  } catch {
    // Silent fail
  }
}