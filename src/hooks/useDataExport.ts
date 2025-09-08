import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/contexts/AuthContext';

export const useDataExport = () => {
  const { t } = useTranslation(['settings']);
  const { toast } = useToast();
  const { user } = useAuthContext();
  const [isExporting, setIsExporting] = useState(false);

  const exportUserData = async () => {
    if (!user) {
      toast({
        title: t('settings.exportError'),
        description: t('settings.notAuthenticated'),
        variant: 'destructive'
      });
      return;
    }

    setIsExporting(true);

    try {
      // Fetch all user data
      const [moodsResult, journalResult, exerciseSessionsResult, messagesResult] = await Promise.all([
        supabase.from('mood_entries').select('*').eq('user_id', user.id),
        supabase.from('journal_entries').select('*').eq('user_id', user.id),
        supabase.from('exercise_sessions').select('*').eq('user_id', user.id),
        supabase.from('messages').select('*').eq('user_id', user.id)
      ]);

      // Check for errors
      const errors = [moodsResult.error, journalResult.error, exerciseSessionsResult.error, messagesResult.error].filter(Boolean);
      if (errors.length > 0) {
        throw new Error('Failed to fetch some data');
      }

      // Assemble export data
      const exportData = {
        exportedAt: new Date().toISOString(),
        userId: user.id,
        userEmail: user.email,
        datasets: {
          moods: moodsResult.data || [],
          journalEntries: journalResult.data || [],
          exerciseSessions: exerciseSessionsResult.data || [],
          messages: messagesResult.data || []
        }
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `aura-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: t('settings.exportSuccess'),
        description: t('settings.exportDescription')
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: t('settings.exportError'),
        description: t('settings.exportFailed'),
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportUserData,
    isExporting
  };
};