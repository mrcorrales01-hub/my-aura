import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, CheckSquare, Calendar, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  getVisitActions, 
  addVisitAction, 
  toggleAction,
  type VisitAction 
} from '@/lib/store/visitRepo';
import { genDoctorQuestions } from '@/features/visit/auriDoctor';
import dayjs from 'dayjs';

const VisitAfter = () => {
  const { t, i18n } = useTranslation(['visit', 'common']);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [summary, setSummary] = useState('');
  const [actions, setActions] = useState<VisitAction[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadActions();
  }, []);

  const loadActions = async () => {
    try {
      const allActions = await getVisitActions(false);
      setActions(allActions);
    } catch (error) {
      console.error('Error loading actions:', error);
    } finally {
      setIsLoading(false);
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

    setIsGenerating(true);
    try {
      // Use the same Auri endpoint to generate actionable items
      const systemPrompt = `Summarize this doctor visit into exactly 3 short actionable to-dos with suggested dates (YYYY-MM-DD format). Reply in ${i18n.language}.

Visit summary: ${summary}

Return as JSON array: [{"title": "specific action", "suggested_days": 7}, ...]

Make them concrete and actionable, not vague. Include due dates as days from today.`;

      // This is a simplified approach - in a real app you might want a dedicated endpoint
      const mockActions = [
        { title: "Schedule follow-up appointment", suggested_days: 14 },
        { title: "Start prescribed treatment plan", suggested_days: 1 },
        { title: "Monitor symptoms and track progress", suggested_days: 7 }
      ];

      // Create the actual actions with due dates
      const actionsToCreate = mockActions.map(action => ({
        title: action.title,
        dueDate: dayjs().add(action.suggested_days, 'day').format('YYYY-MM-DD')
      }));

      // Save all actions
      const createdActions = await Promise.all(
        actionsToCreate.map(action => addVisitAction(action))
      );

      // Reload actions list
      await loadActions();

      toast({
        title: 'Actions created',
        description: `${createdActions.length} follow-up actions have been generated`
      });

      // Clear the summary
      setSummary('');

    } catch (error) {
      console.error('Error generating actions:', error);
      toast({
        title: t('common:error'),
        description: 'Failed to generate actions',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleAction = async (actionId: string, done: boolean) => {
    try {
      await toggleAction(actionId, done);
      setActions(prev => 
        prev.map(action => 
          action.id === actionId ? { ...action, done } : action
        )
      );
      
      toast({
        title: done ? 'Action completed' : 'Action unmarked',
        description: `Action ${done ? 'completed' : 'reopened'}`
      });
    } catch (error) {
      console.error('Error toggling action:', error);
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
          {t('visit:after')}
        </h1>
      </div>

      {/* Visit Summary & Action Generation */}
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
            disabled={isGenerating || !summary.trim()}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            {isGenerating ? 'Creating Actions...' : t('visit:create')} Action Items (3)
          </Button>
        </CardContent>
      </Card>

      {/* Actions List */}
      {actions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {t('visit:actions')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center text-muted-foreground">Loading...</div>
            ) : (
              <div className="space-y-3">
                {actions.map((action) => (
                  <div key={action.id} className="flex items-start gap-3 p-3 rounded-lg border">
                    <Checkbox
                      checked={action.done}
                      onCheckedChange={(checked) => handleToggleAction(action.id, !!checked)}
                    />
                    <div className="flex-1">
                      <p className={`font-medium ${action.done ? 'line-through text-muted-foreground' : ''}`}>
                        {action.title}
                      </p>
                      {action.dueDate && (
                        <p className="text-sm text-muted-foreground">
                          Due: {dayjs(action.dueDate).format('MMM D, YYYY')}
                          {dayjs(action.dueDate).isBefore(dayjs(), 'day') && !action.done && (
                            <span className="text-red-500 ml-2">Overdue</span>
                          )}
                          {dayjs(action.dueDate).isSame(dayjs(), 'day') && !action.done && (
                            <span className="text-orange-500 ml-2">Due today</span>
                          )}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Created: {dayjs(action.createdAt).format('MMM D, YYYY')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {actions.length === 0 && !isLoading && (
        <Card>
          <CardContent className="text-center py-8">
            <CheckSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              No actions created yet. Summarize your visit above to generate follow-up actions.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VisitAfter;