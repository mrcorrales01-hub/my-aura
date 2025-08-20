import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAILifestylePlans } from '@/hooks/useAILifestylePlans';
import { useI18n } from '@/hooks/useI18n';
import { 
  Activity, 
  Target, 
  TrendingUp, 
  Moon, 
  Heart, 
  Zap,
  CheckCircle2,
  Clock,
  Award,
  Smartphone
} from 'lucide-react';

const AILifestylePlans: React.FC = () => {
  const { t } = useI18n();
  const {
    plans,
    activePlan,
    loading,
    planTemplates,
    createPlan,
    updateProgress,
    generateRecommendations,
    syncWearableData,
    getProgressStats
  } = useAILifestylePlans();

  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>([]);

  const focusAreaIcons = {
    sleep: Moon,
    diet: Heart,
    fitness: Activity,
    stress: Zap
  };

  const progressStats = getProgressStats();

  const handleCreatePlan = async () => {
    if (selectedFocusAreas.length === 0) return;
    
    await createPlan('daily', selectedFocusAreas, selectedTemplate);
    setSelectedTemplate('');
    setSelectedFocusAreas([]);
  };

  const handleCompleteActivity = async (activityId: string) => {
    if (!activePlan) return;

    const updatedProgress = {
      ...activePlan.progress_data,
      completion_rate: Math.min(100, (activePlan.progress_data?.completion_rate || 0) + 10),
      last_activity: activityId,
      completed_today: [...(activePlan.progress_data?.completed_today || []), activityId]
    };

    await updateProgress(activePlan.id, updatedProgress);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
          {t('lifestyle.title')}
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {t('lifestyle.subtitle')}
        </p>
      </div>

      {/* Active Plan Dashboard */}
      {activePlan && (
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="wellness-gradient text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">{t('lifestyle.progress')}</p>
                  <p className="text-2xl font-bold">{progressStats.completion}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-white/80" />
              </div>
              <Progress value={progressStats.completion} className="mt-4 bg-white/20" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Streak Days</p>
                  <p className="text-2xl font-bold">{progressStats.streak}</p>
                </div>
                <Clock className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Achievements</p>
                  <p className="text-2xl font-bold">{progressStats.achievements}</p>
                </div>
                <Award className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Active Plan Activities */}
      {activePlan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Today's Activities
            </CardTitle>
            <div className="flex gap-2">
              {activePlan.focus_areas.map((area) => {
                const Icon = focusAreaIcons[area as keyof typeof focusAreaIcons];
                return (
                  <Badge key={area} variant="secondary" className="gap-1">
                    {Icon && <Icon className="w-3 h-3" />}
                    {t(`lifestyle.${area}`)}
                  </Badge>
                );
              })}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {activePlan.plan_data?.schedule && Object.entries(activePlan.plan_data.schedule).map(([timeOfDay, activities]: [string, any]) => (
              <div key={timeOfDay} className="space-y-2">
                <h4 className="font-medium capitalize text-primary">{timeOfDay}</h4>
                <div className="grid gap-2">
                  {activities.map((activity: string, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm">{activity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCompleteActivity(`${timeOfDay}-${index}`)}
                        className="gap-1"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Complete
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => generateRecommendations(activePlan.id)}
                className="flex-1"
              >
                {t('lifestyle.aiRecommendations')}
              </Button>
              <Button
                variant="outline"
                onClick={() => syncWearableData(activePlan.id, {})}
                className="gap-2"
              >
                <Smartphone className="w-4 h-4" />
                {t('lifestyle.syncDevices')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Recommendations */}
      {activePlan?.ai_recommendations?.daily_tips && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              AI Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-primary">Daily Tips</h4>
              {activePlan.ai_recommendations.daily_tips.map((tip: string, index: number) => (
                <div key={index} className="p-3 bg-primary/5 rounded-lg border-l-4 border-primary">
                  <p className="text-sm">{tip}</p>
                </div>
              ))}
            </div>

            {activePlan.ai_recommendations.insights && (
              <div className="space-y-2">
                <h4 className="font-medium text-primary">Insights</h4>
                {activePlan.ai_recommendations.insights.map((insight: string, index: number) => (
                  <div key={index} className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm">{insight}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create New Plan */}
      {!activePlan && (
        <Card>
          <CardHeader>
            <CardTitle>{t('lifestyle.createPlan')}</CardTitle>
            <CardDescription>
              Select focus areas and a template to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <h4 className="font-medium">{t('lifestyle.focusAreas')}</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['sleep', 'diet', 'fitness', 'stress'].map((area) => {
                  const Icon = focusAreaIcons[area as keyof typeof focusAreaIcons];
                  const isSelected = selectedFocusAreas.includes(area);
                  
                  return (
                    <Button
                      key={area}
                      variant={isSelected ? "default" : "outline"}
                      className="gap-2 h-auto p-4 flex-col"
                      onClick={() => {
                        if (isSelected) {
                          setSelectedFocusAreas(prev => prev.filter(a => a !== area));
                        } else {
                          setSelectedFocusAreas(prev => [...prev, area]);
                        }
                      }}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs">{t(`lifestyle.${area}`)}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Plan Templates</h4>
              <div className="grid gap-3">
                {Object.entries(planTemplates).map(([key, template]) => (
                  <Card
                    key={key}
                    className={`cursor-pointer transition-colors ${
                      selectedTemplate === key ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedTemplate(selectedTemplate === key ? '' : key)}
                  >
                    <CardContent className="p-4">
                      <h5 className="font-medium">{template.title}</h5>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Button
              onClick={handleCreatePlan}
              disabled={selectedFocusAreas.length === 0}
              className="w-full"
            >
              {t('lifestyle.createPlan')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Previous Plans */}
      {plans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Plan History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {plans.slice(0, 3).map((plan) => (
                <div key={plan.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{plan.plan_data?.title || 'Lifestyle Plan'}</p>
                    <p className="text-sm text-muted-foreground">
                      Created {new Date(plan.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {plan.focus_areas.map((area) => (
                      <Badge key={area} variant="outline" className="text-xs">
                        {t(`lifestyle.${area}`)}
                      </Badge>
                    ))}
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

export default AILifestylePlans;