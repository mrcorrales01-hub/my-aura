import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

interface Plan {
  id: string;
  title: string;
  description?: string;
  category: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  target_date?: string;
  created_at: string;
  updated_at: string;
}

interface PlanTask {
  id: string;
  plan_id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export const usePlanData = () => {
  const { user } = useAuthContext();

  // Get active plans
  const { data: activePlans } = useQuery({
    queryKey: ['plans', 'active', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('plans' as any)
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data as any) as Plan[];
    },
    enabled: !!user
  });

  // Get completed tasks today
  const { data: completedTasksToday } = useQuery({
    queryKey: ['plan-tasks', 'completed-today', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      
      const today = new Date().toISOString().split('T')[0];
      const { count, error } = await supabase
        .from('plan_tasks' as any)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .gte('completed_at', today);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user
  });

  return {
    activePlans,
    completedTasksToday
  };
};