import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslation } from 'react-i18next';
import { getSmartPlan, updateGoal, type SmartGoal } from '@/features/plan/smartPlan';
import { Target, RefreshCw } from 'lucide-react';

export function SmartPlanCard() {
  const { t } = useTranslation('home');
  const [plan, setPlan] = React.useState(getSmartPlan());
  
  const handleToggle = (goalId: string, done: boolean) => {
    updateGoal(goalId, done);
    setPlan(getSmartPlan());
  };
  
  const regeneratePlan = () => {
    // Clear current week's plan to force regeneration
    const currentWeek = plan.week;
    localStorage.removeItem(`aura.smartPlan.${currentWeek}`);
    setPlan(getSmartPlan());
  };
  
  const completedCount = plan.goals.filter(g => g.done).length;
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">{t('smartPlan')}</CardTitle>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={regeneratePlan}
            className="h-8 px-2"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {completedCount}/{plan.goals.length} klara denna vecka
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {plan.goals.map((goal) => (
          <div key={goal.id} className="flex items-center space-x-3">
            <Checkbox
              id={goal.id}
              checked={goal.done}
              onCheckedChange={(checked) => handleToggle(goal.id, !!checked)}
            />
            <label 
              htmlFor={goal.id} 
              className={`text-sm cursor-pointer flex-1 ${
                goal.done ? 'line-through text-muted-foreground' : ''
              }`}
            >
              {goal.title}
            </label>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}