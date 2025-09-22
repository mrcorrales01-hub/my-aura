import { supabase } from '@/integrations/supabase/client';

export type AssessmentType = 'phq9' | 'gad7';

export async function saveAssessment(type: AssessmentType, score: number, severity: string, answers: number[]) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  
  const payload = {
    user_id: session.user.id,
    assessment_type: type,
    questions_answers: { answers },
    total_score: score,
    severity_level: severity,
    ai_interpretation: null,
    recommendations: [],
    completed_at: new Date().toISOString()
  };
  
  const { error } = await supabase.from('self_assessments').insert(payload);
  if (error) throw error;
}

export async function fetchHistory(type: AssessmentType) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];
  
  const { data } = await supabase.from('self_assessments')
    .select('total_score, severity_level, completed_at')
    .eq('assessment_type', type)
    .eq('user_id', session.user.id)
    .order('completed_at', { ascending: false })
    .limit(24);
    
  return data || [];
}