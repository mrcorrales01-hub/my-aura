import { supabase } from '@/integrations/supabase/client';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export interface SymptomLog {
  id: string;
  userId?: string;
  intensity: number;
  tags: string[];
  note?: string;
  createdAt: string;
}

export interface VisitPrep {
  id: string;
  userId?: string;
  createdAt: string;
  concerns?: string;
  topQuestions: string[];
  sbar?: Record<string, unknown>;
  phq9?: number;
  gad7?: number;
}

export interface VisitAction {
  id: string;
  userId?: string;
  title: string;
  dueDate?: string;
  done: boolean;
  createdAt: string;
}

// Generate UUID for offline mode
const generateId = () => crypto.randomUUID();

// Check if Supabase is available
const isSupabaseAvailable = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return !!user;
  } catch {
    return false;
  }
};

// Supabase operations
const supabaseOps = {
  async getSymptomLogs(lastDays: number): Promise<SymptomLog[]> {
    const cutoff = dayjs().subtract(lastDays, 'day').utc().toISOString();
    const { data, error } = await supabase
      .from('symptom_logs')
      .select('*')
      .gte('created_at', cutoff)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map(row => ({
      id: row.id,
      userId: row.user_id || undefined,
      intensity: row.intensity || 0,
      tags: row.tags || [],
      note: row.note || undefined,
      createdAt: row.created_at
    }));
  },

  async addSymptomLog(input: Omit<SymptomLog, 'id' | 'createdAt'>): Promise<SymptomLog> {
    const { data: { user } } = await supabase.auth.getUser();
    const now = dayjs.utc().toISOString();
    
    const { data, error } = await supabase
      .from('symptom_logs')
      .insert({
        user_id: user?.id,
        intensity: input.intensity,
        tags: input.tags,
        note: input.note,
        created_at: now
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      userId: data.user_id || undefined,
      intensity: data.intensity,
      tags: data.tags || [],
      note: data.note || undefined,
      createdAt: data.created_at
    };
  },

  async getVisitPrepLatest(): Promise<VisitPrep | undefined> {
    const { data, error } = await supabase
      .from('visit_preps')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error) throw error;
    if (!data) return undefined;
    
    return {
      id: data.id,
      userId: data.user_id || undefined,
      createdAt: data.created_at,
      concerns: data.concerns || undefined,
      topQuestions: data.top_questions || [],
      sbar: (data.sbar as Record<string, unknown>) || undefined,
      phq9: (data.sbar as any)?.phq9 || undefined,
      gad7: (data.sbar as any)?.gad7 || undefined
    };
  },

  async saveVisitPrep(p: Partial<VisitPrep>): Promise<VisitPrep> {
    const { data: { user } } = await supabase.auth.getUser();
    const now = dayjs.utc().toISOString();
    
    // Store phq9/gad7 in sbar for now since they may not be columns yet
    const sbarData = { ...(p.sbar || {}) };
    if (p.phq9 !== undefined) sbarData.phq9 = p.phq9;
    if (p.gad7 !== undefined) sbarData.gad7 = p.gad7;
    
    const { data, error } = await supabase
      .from('visit_preps')
      .upsert({
        user_id: user?.id,
        concerns: p.concerns,
        top_questions: p.topQuestions || [],
        sbar: sbarData as any
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      userId: data.user_id || undefined,
      createdAt: data.created_at,
      concerns: data.concerns || undefined,
      topQuestions: data.top_questions || [],
      sbar: (data.sbar as Record<string, unknown>) || undefined,
      phq9: (data.sbar as any)?.phq9 || undefined,
      gad7: (data.sbar as any)?.gad7 || undefined
    };
  },

  async getVisitActions(upcomingOnly = false): Promise<VisitAction[]> {
    let query = supabase
      .from('visit_actions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (upcomingOnly) {
      const today = dayjs().utc().format('YYYY-MM-DD');
      const weekFromNow = dayjs().add(7, 'day').utc().format('YYYY-MM-DD');
      query = query
        .gte('due_date', today)
        .lte('due_date', weekFromNow)
        .eq('done', false);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    return (data || []).map(row => ({
      id: row.id,
      userId: row.user_id || undefined,
      title: row.title,
      dueDate: row.due_date || undefined,
      done: row.done || false,
      createdAt: row.created_at
    }));
  },

  async addVisitAction(a: Omit<VisitAction, 'id' | 'createdAt' | 'done'>): Promise<VisitAction> {
    const { data: { user } } = await supabase.auth.getUser();
    const now = dayjs.utc().toISOString();
    
    const { data, error } = await supabase
      .from('visit_actions')
      .insert({
        user_id: user?.id,
        title: a.title,
        due_date: a.dueDate,
        done: false,
        created_at: now
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      userId: data.user_id || undefined,
      title: data.title,
      dueDate: data.due_date || undefined,
      done: data.done || false,
      createdAt: data.created_at
    };
  },

  async toggleAction(id: string, done: boolean): Promise<void> {
    const { error } = await supabase
      .from('visit_actions')
      .update({ done })
      .eq('id', id);
    
    if (error) throw error;
  }
};

// LocalStorage operations
const localStorageOps = {
  async getSymptomLogs(lastDays: number): Promise<SymptomLog[]> {
    const stored = localStorage.getItem('aura.symptom_logs');
    const logs: SymptomLog[] = stored ? JSON.parse(stored) : [];
    const cutoff = dayjs().subtract(lastDays, 'day').utc().toISOString();
    
    return logs
      .filter(log => log.createdAt >= cutoff)
      .sort((a, b) => dayjs(b.createdAt).diff(dayjs(a.createdAt)));
  },

  async addSymptomLog(input: Omit<SymptomLog, 'id' | 'createdAt'>): Promise<SymptomLog> {
    const stored = localStorage.getItem('aura.symptom_logs');
    const logs: SymptomLog[] = stored ? JSON.parse(stored) : [];
    
    const newLog: SymptomLog = {
      id: generateId(),
      ...input,
      createdAt: dayjs.utc().toISOString()
    };
    
    logs.unshift(newLog);
    
    // Keep only last 100 entries
    if (logs.length > 100) {
      logs.splice(100);
    }
    
    localStorage.setItem('aura.symptom_logs', JSON.stringify(logs));
    return newLog;
  },

  async getVisitPrepLatest(): Promise<VisitPrep | undefined> {
    const stored = localStorage.getItem('aura.visit_preps');
    const preps: VisitPrep[] = stored ? JSON.parse(stored) : [];
    return preps.sort((a, b) => dayjs(b.createdAt).diff(dayjs(a.createdAt)))[0];
  },

  async saveVisitPrep(p: Partial<VisitPrep>): Promise<VisitPrep> {
    const stored = localStorage.getItem('aura.visit_preps');
    const preps: VisitPrep[] = stored ? JSON.parse(stored) : [];
    
    const now = dayjs.utc().toISOString();
    const prep: VisitPrep = {
      id: p.id || generateId(),
      userId: undefined,
      createdAt: p.createdAt || now,
      concerns: p.concerns,
      topQuestions: p.topQuestions || [],
      sbar: p.sbar,
      phq9: p.phq9,
      gad7: p.gad7
    };
    
    // Update existing or add new
    const existingIndex = preps.findIndex(existing => existing.id === prep.id);
    if (existingIndex >= 0) {
      preps[existingIndex] = prep;
    } else {
      preps.unshift(prep);
    }
    
    // Keep only last 10 entries
    if (preps.length > 10) {
      preps.splice(10);
    }
    
    localStorage.setItem('aura.visit_preps', JSON.stringify(preps));
    return prep;
  },

  async getVisitActions(upcomingOnly = false): Promise<VisitAction[]> {
    const stored = localStorage.getItem('aura.visit_actions');
    const actions: VisitAction[] = stored ? JSON.parse(stored) : [];
    
    if (upcomingOnly) {
      const today = dayjs().utc().format('YYYY-MM-DD');
      const weekFromNow = dayjs().add(7, 'day').utc().format('YYYY-MM-DD');
      
      return actions
        .filter(action => 
          !action.done && 
          action.dueDate && 
          action.dueDate >= today && 
          action.dueDate <= weekFromNow
        )
        .sort((a, b) => dayjs(a.dueDate).diff(dayjs(b.dueDate)));
    }
    
    return actions.sort((a, b) => dayjs(b.createdAt).diff(dayjs(a.createdAt)));
  },

  async addVisitAction(a: Omit<VisitAction, 'id' | 'createdAt' | 'done'>): Promise<VisitAction> {
    const stored = localStorage.getItem('aura.visit_actions');
    const actions: VisitAction[] = stored ? JSON.parse(stored) : [];
    
    const newAction: VisitAction = {
      id: generateId(),
      ...a,
      done: false,
      createdAt: dayjs.utc().toISOString()
    };
    
    actions.unshift(newAction);
    
    // Keep only last 50 entries
    if (actions.length > 50) {
      actions.splice(50);
    }
    
    localStorage.setItem('aura.visit_actions', JSON.stringify(actions));
    return newAction;
  },

  async toggleAction(id: string, done: boolean): Promise<void> {
    const stored = localStorage.getItem('aura.visit_actions');
    const actions: VisitAction[] = stored ? JSON.parse(stored) : [];
    
    const actionIndex = actions.findIndex(action => action.id === id);
    if (actionIndex >= 0) {
      actions[actionIndex].done = done;
      localStorage.setItem('aura.visit_actions', JSON.stringify(actions));
    }
  }
};

// Public API - automatically falls back to localStorage
export async function getSymptomLogs(lastDays: number): Promise<SymptomLog[]> {
  try {
    if (await isSupabaseAvailable()) {
      return await supabaseOps.getSymptomLogs(lastDays);
    }
  } catch (error) {
    console.warn('Supabase unavailable, using localStorage:', error);
  }
  return localStorageOps.getSymptomLogs(lastDays);
}

export async function addSymptomLog(input: Omit<SymptomLog, 'id' | 'createdAt'>): Promise<SymptomLog> {
  try {
    if (await isSupabaseAvailable()) {
      return await supabaseOps.addSymptomLog(input);
    }
  } catch (error) {
    console.warn('Supabase unavailable, using localStorage:', error);
  }
  return localStorageOps.addSymptomLog(input);
}

export async function getVisitPrepLatest(): Promise<VisitPrep | undefined> {
  try {
    if (await isSupabaseAvailable()) {
      return await supabaseOps.getVisitPrepLatest();
    }
  } catch (error) {
    console.warn('Supabase unavailable, using localStorage:', error);
  }
  return localStorageOps.getVisitPrepLatest();
}

export async function saveVisitPrep(p: Partial<VisitPrep>): Promise<VisitPrep> {
  try {
    if (await isSupabaseAvailable()) {
      return await supabaseOps.saveVisitPrep(p);
    }
  } catch (error) {
    console.warn('Supabase unavailable, using localStorage:', error);
  }
  return localStorageOps.saveVisitPrep(p);
}

export async function getVisitActions(upcomingOnly = false): Promise<VisitAction[]> {
  try {
    if (await isSupabaseAvailable()) {
      return await supabaseOps.getVisitActions(upcomingOnly);
    }
  } catch (error) {
    console.warn('Supabase unavailable, using localStorage:', error);
  }
  return localStorageOps.getVisitActions(upcomingOnly);
}

export async function addVisitAction(a: Omit<VisitAction, 'id' | 'createdAt' | 'done'>): Promise<VisitAction> {
  try {
    if (await isSupabaseAvailable()) {
      return await supabaseOps.addVisitAction(a);
    }
  } catch (error) {
    console.warn('Supabase unavailable, using localStorage:', error);
  }
  return localStorageOps.addVisitAction(a);
}

export async function toggleAction(id: string, done: boolean): Promise<void> {
  try {
    if (await isSupabaseAvailable()) {
      return await supabaseOps.toggleAction(id, done);
    }
  } catch (error) {
    console.warn('Supabase unavailable, using localStorage:', error);
  }
  return localStorageOps.toggleAction(id, done);
}
