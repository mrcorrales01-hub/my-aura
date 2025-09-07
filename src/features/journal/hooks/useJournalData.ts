import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface JournalEntry {
  id: string;
  user_id: string;
  title?: string;
  content?: string;
  content_text?: string;
  tags?: string[];
  mood_tags?: string[];
  is_private?: boolean;
  created_at: string;
  updated_at?: string;
}

export const useJournalData = () => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  // Get recent entries
  const { data: recentEntries } = useQuery({
    queryKey: ['journal', 'recent', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('journal_entries' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return (data as any) as JournalEntry[];
    },
    enabled: !!user
  });

  // Get all entries
  const { data: allEntries } = useQuery({
    queryKey: ['journal', 'all', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('journal_entries' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data as any) as JournalEntry[];
    },
    enabled: !!user
  });

  return {
    recentEntries,
    allEntries
  };
};