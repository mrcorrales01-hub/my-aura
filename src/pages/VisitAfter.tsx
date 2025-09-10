import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, CheckSquare, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VisitAction {
  id: string;
  title: string;
  due_date: string | null;
  done: boolean;
}

const VisitAfter = () => {
  const { t } = useTranslation(['visit', 'common']);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [summary, setSummary] = useState('');
  const [actions, setActions] = useState<VisitAction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadActions();
  }, []);

  const loadActions = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('visit_actions')
        .select('id, title, due_date, done')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActions(data || []);
    } catch (error) {
      console.error('Error loading actions:', error);
    }
  };

  const generateActions = async () => {
    if (!summary.trim()) {
      toast({
        title: t('common:error'),
        description: 'Please enter what was decided first',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Use Auri to extract actionable items
      const systemPrompt = `Extract 3 actionable items from this visit summary. Return as JSON array of objects with "title" and "suggested_days" (number of days from now). Be specific and actionable.

Visit summary: ${summary}

Format: [{"title": "specific action", "suggested_days": 7}, ...]`;

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auri-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: systemPrompt }],
          lang: 'en'
        })
      });

      let result = '';
      const reader = response.body?.getReader();
      
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          result += new TextDecoder().decode(value);
        }
      }

      // Try to extract JSON from response
      const jsonMatch = result.match(/\[(.*?)\]/s);
      let parsedActions: any[] = [];
      
      if (jsonMatch) {
        try {
          parsedActions = JSON.parse(jsonMatch[0]);
        } catch {
          // Fallback: create simple actions
          parsedActions = [
            { title: "Schedule follow-up appointment", suggested_days: 14 },
            { title: "Start prescribed treatment plan", suggested_days: 1 },
            { title: "Monitor symptoms and progress", suggested_days: 7 }
          ];
        }
      }

      // Save actions to database
      const actionsToInsert = parsedActions.map((action: any) => ({
        user_id: session.user.id,
        title: action.title,
        due_date: action.suggested_days ? 
          new Date(Date.now() + action.suggested_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : 
          null,
        done: false
      }));

      const { error } = await supabase
        .from('visit_actions')
        .insert(actionsToInsert);

      if (error) throw error;

      await loadActions();
      
      toast({
        title: 'Actions created',
        description: 'Follow-up actions have been generated'
      });

    } catch (error) {
      console.error('Error generating actions:', error);
      toast({
        title: t('common:error'),
        description: 'Failed to generate actions',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAction = async (actionId: string, done: boolean) => {
    try {
      const { error } = await supabase
        .from('visit_actions')
        .update({ done })
        .eq('id', actionId);

      if (error) throw error;
      
      setActions(prev => 
        prev.map(action => 
          action.id === actionId ? { ...action, done } : action
        )
      );
    } catch (error) {
      console.error('Error updating action:', error);
      toast({
        title: t('common:error'),
        description: 'Failed to update action',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/visit')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CheckSquare className="h-6 w-6" />
          {t('visit:afterVisit')}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>What was decided?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Summarize what was discussed and decided during your visit..."
            className="min-h-[120px]"
          />
          <Button 
            onClick={generateActions}
            disabled={isLoading || !summary.trim()}
          >
            {isLoading ? 'Creating Actions...' : 'Create Action Items'}
          </Button>
        </CardContent>
      </Card>

      {actions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {t('visit:actions')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {actions.map((action) => (
                <div key={action.id} className="flex items-start gap-3 p-3 rounded-lg border">
                  <Checkbox
                    checked={action.done}
                    onCheckedChange={(checked) => toggleAction(action.id, !!checked)}
                  />
                  <div className="flex-1">
                    <p className={`font-medium ${action.done ? 'line-through text-muted-foreground' : ''}`}>
                      {action.title}
                    </p>
                    {action.due_date && (
                      <p className="text-sm text-muted-foreground">
                        Due: {new Date(action.due_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VisitAfter;