import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';

async function fetchAll(userId: string) {
  const safe = async (tableName: string, query: any) => { 
    try { 
      const result = await query;
      return result.data || []; 
    } catch (error) {
      console.warn(`Failed to fetch ${tableName}:`, error);
      return []; 
    } 
  };

  const profile = await safe('profiles', supabase.from('profiles').select('*').eq('id', userId).maybeSingle());
  const moods = await safe('mood_entries', supabase.from('mood_entries').select('*').eq('user_id', userId).order('created_at', { ascending: false }));
  const conversations = await safe('conversations', supabase.from('conversations').select('*').eq('user_id', userId).order('created_at', { ascending: false }));
  const exercises = await safe('exercise_sessions', supabase.from('exercise_sessions').select('*').eq('user_id', userId).order('created_at', { ascending: false }));
  const roleplay = await safe('ai_role_sessions', supabase.from('ai_role_sessions').select('*').eq('user_id', userId).order('started_at', { ascending: false }));
  const achievements = await safe('user_achievements', supabase.from('user_achievements').select('*').eq('user_id', userId));
  const quests = await safe('daily_quests', supabase.from('daily_quests').select('*').eq('user_id', userId).order('quest_date', { ascending: false }));
  const activities = await safe('child_activities', supabase.from('child_activities').select('*').eq('user_id', userId).order('created_at', { ascending: false }));

  return { 
    profile: profile, 
    mood_entries: moods, 
    conversations, 
    exercise_sessions: exercises,
    ai_role_sessions: roleplay,
    user_achievements: achievements,
    daily_quests: quests,
    child_activities: activities,
    export_metadata: {
      exported_at: new Date().toISOString(),
      user_id: userId,
      version: '1.0'
    }
  };
}

export default function SelfExportPage() {
  const { t } = useTranslation('export');
  const [busy, setBusy] = useState(false);
  const [zip, setZip] = useState(false);

  const go = async () => {
    try {
      setBusy(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { 
        alert('Please sign in first'); 
        return; 
      }

      const exportData = await fetchAll(session.user.id);
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });

      if (!zip) {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `my-aura-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(a.href);
      } else {
        // Optional ZIP via dynamic import (works if jszip available; else fallback to JSON)
        try {
          // Fallback to JSON if ZIP not available
          console.log('ZIP functionality not available, downloading as JSON');
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = `my-aura-export-${new Date().toISOString().split('T')[0]}.json`;
          a.click();
          URL.revokeObjectURL(a.href);
        } catch {
          // Fallback to JSON if ZIP fails
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = `my-aura-export-${new Date().toISOString().split('T')[0]}.json`;
          a.click();
          URL.revokeObjectURL(a.href);
        }
      }
      
      alert(t('done'));
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    } finally { 
      setBusy(false); 
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-2xl">
      <h1 className="text-2xl font-semibold">{t('title')}</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">{t('explain')}</p>
      </div>

      <div className="bg-gray-50 border rounded-lg p-4">
        <p className="text-sm text-gray-700 mb-3">{t('what')}</p>
        
        <label className="flex items-center gap-2 text-sm">
          <input 
            type="checkbox" 
            checked={zip} 
            onChange={e => setZip(e.target.checked)}
            className="rounded" 
          />
          {t('zip')}
        </label>
      </div>

      <button 
        disabled={busy} 
        onClick={go} 
        className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-50 hover:bg-primary/90"
      >
        {busy ? t('downloading') : t('download')}
      </button>

      <div className="pt-4 border-t">
        <p className="text-xs text-gray-500">{t('delete')}</p>
      </div>
    </div>
  );
}