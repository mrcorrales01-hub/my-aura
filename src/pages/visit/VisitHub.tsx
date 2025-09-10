import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { FileText, Users, CheckSquare, Stethoscope, Plus, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  addSymptomLog, 
  getSymptomLogs, 
  getVisitActions, 
  toggleAction,
  type SymptomLog,
  type VisitAction
} from '@/lib/store/visitRepo';
import { requireSub, hasVisitPack } from '@/lib/subscription';

const symptomTags = ['pain', 'sleep', 'anxiety', 'mood', 'focus', 'other'];

const VisitHub = () => {
  const { t } = useTranslation(['visit', 'common']);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [intensity, setIntensity] = useState([5]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [isLogging, setIsLogging] = useState(false);
  
  const [recentLogs, setRecentLogs] = useState<SymptomLog[]>([]);
  const [upcomingActions, setUpcomingActions] = useState<VisitAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [logs, actions] = await Promise.all([
        getSymptomLogs(7),
        getVisitActions(true)
      ]);
      setRecentLogs(logs);
      setUpcomingActions(actions);
    } catch (error) {
      console.error('Error loading visit data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleLogSymptom = async () => {
    if (selectedTags.length === 0) {
      toast({
        title: t('common:error'),
        description: 'Please select at least one tag',
        variant: 'destructive'
      });
      return;
    }

    setIsLogging(true);
    try {
      await addSymptomLog({
        intensity: intensity[0],
        tags: selectedTags,
        note: note.trim() || undefined
      });

      // Reset form
      setIntensity([5]);
      setSelectedTags([]);
      setNote('');
      
      // Reload logs
      const newLogs = await getSymptomLogs(7);
      setRecentLogs(newLogs);
      
      toast({
        title: t('visit:symptomLog'),
        description: 'Symptom logged successfully'
      });
    } catch (error) {
      console.error('Error logging symptom:', error);
      toast({
        title: t('common:error'),
        description: 'Failed to log symptom',
        variant: 'destructive'
      });
    } finally {
      setIsLogging(false);
    }
  };

  const handleToggleAction = async (actionId: string, done: boolean) => {
    try {
      await toggleAction(actionId, done);
      setUpcomingActions(prev => 
        prev.map(action => 
          action.id === actionId ? { ...action, done } : action
        )
      );
    } catch (error) {
      console.error('Error toggling action:', error);
      toast({
        title: t('common:error'),
        description: 'Failed to update action',
        variant: 'destructive'
      });
    }
  };

  if (!hasVisitPack() && requireSub) {
    return (
      <div className="container max-w-4xl mx-auto py-6">
        <Card>
          <CardContent className="text-center py-8">
            <Stethoscope className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">{t('visit:title')}</h2>
            <p className="text-muted-foreground mb-4">
              Upgrade to access the Doctor Visit pack with symptom tracking, 
              AI-generated questions, and visit preparation tools.
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => navigate('/pricing')} className="mr-2">
                {t('pricing:upgrade')}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => localStorage.setItem('aura.plan', 'plus')}
              >
                Try once
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Stethoscope className="h-8 w-8" />
          {t('visit:title')}
        </h1>
        <p className="text-muted-foreground">
          Prepare, practice, and follow up on your doctor visits
        </p>
      </div>

      {/* Main Features */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              {t('visit:prepare')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Create questions and prepare for your appointment
            </p>
            <Button onClick={() => navigate('/visit/prepare')} className="w-full">
              {t('visit:start')}
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5" />
              {t('visit:practice')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Practice difficult conversations
            </p>
            <Button onClick={() => navigate('/visit/practice')} className="w-full">
              {t('visit:practiceScenarios')}
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckSquare className="h-5 w-5" />
              {t('visit:after')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Track actions and follow-ups
            </p>
            <Button onClick={() => navigate('/visit/after')} className="w-full">
              {t('visit:actions')}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Symptom Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {t('visit:symptomLog')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              {t('visit:intensity')} ({intensity[0]}/10)
            </label>
            <Slider
              value={intensity}
              onValueChange={setIntensity}
              max={10}
              min={0}
              step={1}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">{t('visit:tags')}</label>
            <div className="flex flex-wrap gap-2">
              {symptomTags.map(tag => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag)}
                >
                  {t(`visit:${tag}` as any, tag)}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">{t('visit:note')}</label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional notes about your symptoms..."
              className="min-h-[80px]"
            />
          </div>

          <Button
            onClick={handleLogSymptom}
            disabled={isLogging || selectedTags.length === 0}
            className="w-full"
          >
            {isLogging ? 'Logging...' : 'Log Symptom'}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Symptoms */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Symptoms (7 days)</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center text-muted-foreground">Loading...</div>
            ) : recentLogs.length > 0 ? (
              <div className="space-y-3">
                {recentLogs.slice(0, 5).map(log => (
                  <div key={log.id} className="flex items-center gap-3 p-2 rounded border">
                    <Badge variant="outline">{log.intensity}/10</Badge>
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-1">
                        {log.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {t(`visit:${tag}` as any, tag)}
                          </Badge>
                        ))}
                      </div>
                      {log.note && (
                        <p className="text-xs text-muted-foreground mt-1">{log.note}</p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                {t('visit:noSymptoms')}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5" />
              {t('visit:upcoming')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center text-muted-foreground">Loading...</div>
            ) : upcomingActions.length > 0 ? (
              <div className="space-y-3">
                {upcomingActions.slice(0, 5).map(action => (
                  <div key={action.id} className="flex items-start gap-3 p-2 rounded border">
                    <input
                      type="checkbox"
                      checked={action.done}
                      onChange={(e) => handleToggleAction(action.id, e.target.checked)}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <p className={`font-medium ${action.done ? 'line-through text-muted-foreground' : ''}`}>
                        {action.title}
                      </p>
                      {action.dueDate && (
                        <p className="text-xs text-muted-foreground">
                          Due: {new Date(action.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                No upcoming actions
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VisitHub;