import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

export interface AILifestylePlan {
  id: string;
  user_id: string;
  plan_type: 'daily' | 'weekly' | 'monthly';
  focus_areas: string[];
  plan_data: any;
  ai_recommendations: any;
  progress_data: any;
  wearable_sync_data: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface LifestylePlanTemplates {
  [key: string]: {
    title: string;
    description: string;
    schedule: any;
    goals: string[];
  };
}

export const useAILifestylePlans = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [plans, setPlans] = useState<AILifestylePlan[]>([]);
  const [activePlan, setActivePlan] = useState<AILifestylePlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [wearableData, setWearableData] = useState<any>({});

  const planTemplates: LifestylePlanTemplates = {
    stress_relief: {
      title: 'Stress Relief Plan',
      description: 'Daily practices to reduce stress and promote calm',
      schedule: {
        morning: ['5-minute meditation', 'Gratitude journaling'],
        afternoon: ['Deep breathing break', 'Short walk'],
        evening: ['Relaxation music', 'Progressive muscle relaxation']
      },
      goals: ['Reduce stress levels', 'Improve sleep quality', 'Increase mindfulness']
    },
    sleep_optimization: {
      title: 'Sleep Optimization',
      description: 'Improve sleep quality and establish healthy patterns',
      schedule: {
        morning: ['Consistent wake time', 'Natural light exposure'],
        afternoon: ['Limit caffeine after 2pm', 'Light exercise'],
        evening: ['No screens 1 hour before bed', 'Relaxation routine']
      },
      goals: ['7-9 hours quality sleep', 'Consistent sleep schedule', 'Reduced sleep anxiety']
    },
    anxiety_management: {
      title: 'Anxiety Management',
      description: 'Tools and techniques to manage anxiety symptoms',
      schedule: {
        morning: ['Anxiety check-in', 'Breathing exercise'],
        afternoon: ['Mindfulness break', 'Positive affirmations'],
        evening: ['Worry journal', 'Calm activity']
      },
      goals: ['Recognize anxiety triggers', 'Use coping strategies', 'Reduce overall anxiety']
    }
  };

  useEffect(() => {
    if (user) {
      fetchPlans();
    }
  }, [user]);

  const fetchPlans = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_lifestyle_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPlans(data as AILifestylePlan[] || []);
      const active = data?.find(plan => plan.is_active);
      setActivePlan(active as AILifestylePlan || null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch lifestyle plans',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createPlan = async (
    planType: 'daily' | 'weekly' | 'monthly',
    focusAreas: string[],
    templateKey?: string
  ) => {
    if (!user) return;

    setLoading(true);
    try {
      // Deactivate existing plans
      await supabase
        .from('ai_lifestyle_plans')
        .update({ is_active: false })
        .eq('user_id', user.id);

      const template = templateKey ? planTemplates[templateKey] : null;
      const planData = template || {
        title: 'Custom Lifestyle Plan',
        description: 'Personalized wellness routine',
        schedule: {},
        goals: []
      };

      const { data, error } = await supabase
        .from('ai_lifestyle_plans')
        .insert({
          user_id: user.id,
          plan_type: planType,
          focus_areas: focusAreas,
          plan_data: planData,
          ai_recommendations: {},
          progress_data: { completion_rate: 0, streaks: {}, achievements: [] },
          wearable_sync_data: {},
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      setActivePlan(data as AILifestylePlan);
      await fetchPlans();
      
      toast({
        title: 'Success',
        description: 'Lifestyle plan created successfully!'
      });

      return data;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to create lifestyle plan',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (planId: string, progressData: any) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('ai_lifestyle_plans')
        .update({ 
          progress_data: progressData,
          updated_at: new Date().toISOString()
        })
        .eq('id', planId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchPlans();
      
      toast({
        title: 'Progress Updated',
        description: 'Your progress has been saved!'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to update progress',
        variant: 'destructive'
      });
    }
  };

  const generateRecommendations = async (planId: string) => {
    if (!user) return;

    setLoading(true);
    try {
      const plan = plans.find(p => p.id === planId);
      if (!plan) return;

      // Simulate AI recommendation generation
      const recommendations = {
        daily_tips: [
          'Consider adding a 10-minute morning walk to boost energy',
          'Try the 4-7-8 breathing technique before meals',
          'Set a consistent bedtime to improve sleep quality'
        ],
        adjustments: [
          'Increase meditation time by 2 minutes this week',
          'Add one extra gratitude item to your journal',
          'Try a new relaxation technique tonight'
        ],
        insights: [
          'Your stress levels are highest between 2-4 PM',
          'You complete 85% more activities when paired with music',
          'Morning activities have the highest success rate'
        ],
        generated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('ai_lifestyle_plans')
        .update({ 
          ai_recommendations: recommendations,
          updated_at: new Date().toISOString()
        })
        .eq('id', planId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchPlans();
      
      toast({
        title: 'Recommendations Generated',
        description: 'AI has analyzed your progress and generated new recommendations!'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to generate recommendations',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const syncWearableData = async (planId: string, deviceData: any) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('ai_lifestyle_plans')
        .update({ 
          wearable_sync_data: deviceData,
          updated_at: new Date().toISOString()
        })
        .eq('id', planId)
        .eq('user_id', user.id);

      if (error) throw error;

      setWearableData(deviceData);
      await fetchPlans();
      
      toast({
        title: 'Wearable Data Synced',
        description: 'Your device data has been integrated with your plan!'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to sync wearable data',
        variant: 'destructive'
      });
    }
  };

  const getProgressStats = () => {
    if (!activePlan?.progress_data) return { completion: 0, streak: 0, achievements: 0 };

    return {
      completion: activePlan.progress_data.completion_rate || 0,
      streak: Object.keys(activePlan.progress_data.streaks || {}).length,
      achievements: activePlan.progress_data.achievements?.length || 0
    };
  };

  return {
    plans,
    activePlan,
    loading,
    wearableData,
    planTemplates,
    fetchPlans,
    createPlan,
    updateProgress,
    generateRecommendations,
    syncWearableData,
    getProgressStats
  };
};