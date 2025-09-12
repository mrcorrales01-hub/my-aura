import { CoachFlowId } from './flows';
import { supabase } from '@/integrations/supabase/client';

export type CoachRun = {
  flowId: CoachFlowId;
  stepIndex: number;
  startedAt: string;
  completed: boolean;
  journalNote?: string;
};

const getStorageKey = (userId?: string) => `aura.coach.runs.${userId || 'anon'}`;

export const getRun = (flowId: CoachFlowId): CoachRun | null => {
  try {
    const runs = JSON.parse(localStorage.getItem(getStorageKey()) || '{}');
    return runs[flowId] || null;
  } catch {
    return null;
  }
};

export const upsertRun = (patch: Partial<CoachRun> & { flowId: CoachFlowId }) => {
  try {
    const key = getStorageKey();
    const runs = JSON.parse(localStorage.getItem(key) || '{}');
    const existing = runs[patch.flowId] || {};
    
    runs[patch.flowId] = { ...existing, ...patch };
    localStorage.setItem(key, JSON.stringify(runs));
    
    return runs[patch.flowId];
  } catch (error) {
    console.error('Failed to save coach run:', error);
    return null;
  }
};

export const completeRun = async (flowId: CoachFlowId) => {
  const run = upsertRun({ flowId, completed: true });
  
  // Optional Supabase sync
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user && run) {
      const duration = Math.round((Date.now() - new Date(run.startedAt).getTime()) / 1000);
      
      await supabase.from('exercise_sessions').insert({
        user_id: user.id,
        exercise_id: flowId,
        duration_seconds: duration,
        metadata: { stepIndex: run.stepIndex }
      });
    }
  } catch (error) {
    console.error('Failed to sync to Supabase:', error);
  }
  
  return run;
};

export const lastCompleted = (flowId: CoachFlowId) => {
  const run = getRun(flowId);
  if (!run?.completed) return null;
  
  return {
    date: run.startedAt,
    stepsDone: run.stepIndex + 1
  };
};

export const logToJournal = async (flowId: CoachFlowId, title: string, content: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('journal_entries').insert({
        user_id: user.id,
        title: `Coach: ${title}`,
        content
      });
    }
  } catch (error) {
    console.error('Failed to log to journal:', error);
  }
};