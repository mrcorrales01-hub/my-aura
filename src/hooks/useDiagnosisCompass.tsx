import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Assessment {
  id: string;
  user_id: string;
  assessment_type: 'phq9' | 'gad7' | 'pcl5' | 'aces' | 'custom';
  assessment_data: any;
  score?: number;
  severity_level?: string;
  recommendations: string[];
  completed_at: string;
  created_at: string;
}

// Temporary interface until database types are regenerated
interface DiagnosisCompassAssessment {
  id: string;
  user_id: string;
  assessment_type: string;
  assessment_data: any;
  score?: number;
  severity_level?: string;
  recommendations: string[];
  completed_at: string;
  created_at: string;
}

export const useDiagnosisCompass = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(false);

  const assessmentTypes = {
    phq9: {
      name: 'Depression Screening (PHQ-9)',
      description: 'Evaluates symptoms of depression over the past 2 weeks',
      questions: [
        'Little interest or pleasure in doing things',
        'Feeling down, depressed, or hopeless',
        'Trouble falling or staying asleep, or sleeping too much',
        'Feeling tired or having little energy',
        'Poor appetite or overeating',
        'Feeling bad about yourself or that you are a failure',
        'Trouble concentrating on things',
        'Moving or speaking slowly, or being fidgety/restless',
        'Thoughts that you would be better off dead or hurting yourself'
      ],
      scoring: {
        0: 'Not at all',
        1: 'Several days',
        2: 'More than half the days',
        3: 'Nearly every day'
      }
    },
    gad7: {
      name: 'Anxiety Screening (GAD-7)',
      description: 'Measures anxiety levels over the past 2 weeks',
      questions: [
        'Feeling nervous, anxious, or on edge',
        'Not being able to stop or control worrying',
        'Worrying too much about different things',
        'Trouble relaxing',
        'Being so restless that it is hard to sit still',
        'Becoming easily annoyed or irritable',
        'Feeling afraid, as if something awful might happen'
      ],
      scoring: {
        0: 'Not at all',
        1: 'Several days',
        2: 'More than half the days',
        3: 'Nearly every day'
      }
    }
  };

  useEffect(() => {
    if (user) {
      fetchAssessments();
    }
  }, [user]);

  const fetchAssessments = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('diagnosis_compass_assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      setAssessments(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch assessments',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateScore = (type: string, responses: number[]) => {
    const total = responses.reduce((sum, score) => sum + score, 0);
    
    let severity = 'Unknown';
    let recommendations: string[] = [];

    if (type === 'phq9') {
      if (total <= 4) {
        severity = 'Minimal';
        recommendations = ['Continue self-care practices', 'Monitor mood regularly'];
      } else if (total <= 9) {
        severity = 'Mild';
        recommendations = ['Consider lifestyle changes', 'Regular exercise and sleep', 'Talk to Auri for support'];
      } else if (total <= 14) {
        severity = 'Moderate';
        recommendations = ['Consider professional counseling', 'Book a therapist session', 'Daily mood tracking'];
      } else if (total <= 19) {
        severity = 'Moderately Severe';
        recommendations = ['Seek professional help', 'Book therapy session immediately', 'Contact support network'];
      } else {
        severity = 'Severe';
        recommendations = ['Seek immediate professional help', 'Contact crisis hotline if needed', 'Book emergency therapy session'];
      }
    } else if (type === 'gad7') {
      if (total <= 4) {
        severity = 'Minimal';
        recommendations = ['Practice relaxation techniques', 'Maintain healthy routines'];
      } else if (total <= 9) {
        severity = 'Mild';
        recommendations = ['Try breathing exercises', 'Regular physical activity', 'Mindfulness practice'];
      } else if (total <= 14) {
        severity = 'Moderate';
        recommendations = ['Consider therapy', 'Daily anxiety management', 'Professional consultation'];
      } else {
        severity = 'Severe';
        recommendations = ['Seek professional help immediately', 'Book therapy session', 'Consider medical evaluation'];
      }
    }

    return { total, severity, recommendations };
  };

  const submitAssessment = async (type: string, responses: number[]) => {
    if (!user) return;

    const { total, severity, recommendations } = calculateScore(type, responses);

    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('diagnosis_compass_assessments')
        .insert({
          user_id: user.id,
          assessment_type: type,
          assessment_data: { responses },
          score: total,
          severity_level: severity,
          recommendations,
          completed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      await fetchAssessments();
      
      toast({
        title: 'Assessment Completed',
        description: `Your ${type.toUpperCase()} score is ${total}. Severity: ${severity}`
      });

      return data;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to submit assessment',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getLatestAssessment = (type: string) => {
    return assessments.find(a => a.assessment_type === type);
  };

  const getAssessmentTrend = (type: string) => {
    const typeAssessments = assessments
      .filter(a => a.assessment_type === type)
      .slice(0, 5);

    if (typeAssessments.length < 2) return 'insufficient_data';

    const latest = typeAssessments[0].score || 0;
    const previous = typeAssessments[1].score || 0;

    if (latest < previous) return 'improving';
    if (latest > previous) return 'worsening';
    return 'stable';
  };

  return {
    assessments,
    loading,
    assessmentTypes,
    fetchAssessments,
    submitAssessment,
    calculateScore,
    getLatestAssessment,
    getAssessmentTrend
  };
};