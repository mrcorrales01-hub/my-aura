import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/EmptyState';
import { useToast } from '@/hooks/use-toast';
import { useActivePlan, useTodayTasks, useToggleTask } from '../api/homeQueries';

export const TodayTasks = () => {
  const { t } = useTranslation('home');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: activePlan, isLoading: planLoading } = useActivePlan();
  const { data: tasks, isLoading: tasksLoading, error, refetch } = useTodayTasks(activePlan?.id);
  const toggleTask = useToggleTask();

  const isLoading = planLoading || tasksLoading;
  const completedCount = tasks?.filter(task => task.done).length || 0;
  const totalCount = tasks?.length || 0;

  const handleToggleTask = async (taskId: string, currentDone: boolean) => {
    try {
      await toggleTask.mutateAsync({ taskId, done: !currentDone });
      toast({
        title: currentDone ? t('tasks.taskMarkedIncomplete') : t('tasks.taskMarkedComplete'),
        description: !currentDone ? t('tasks.greatJob') : undefined,
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('tasks.toggleError'),
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            <Skeleton className="h-4 w-24" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-3 w-20" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{t('tasks.today')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-2">{t('error.failed')}</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              {t('error.retry')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!activePlan) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{t('tasks.today')}</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={CheckSquare}
            titleKey="tasks.noTasks"
            descriptionKey="tasks.emptyDescription"
            namespace="home"
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/plan')}
                className="gap-1"
              >
                <Plus className="h-3 w-3" />
                {t('tasks.createPlan')}
              </Button>
            }
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{t('tasks.today')}</CardTitle>
        <CardDescription>
          {totalCount > 0 
            ? t('tasks.completed', { count: completedCount, total: totalCount })
            : t('tasks.noTasks')
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!tasks || tasks.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              {t('tasks.noTasks')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Checkbox
                  checked={task.done}
                  onCheckedChange={() => handleToggleTask(task.id, task.done)}
                  disabled={toggleTask.isPending}
                  className="mt-0.5"
                  aria-label={`Toggle task: ${task.title}`}
                />
                <span 
                  className={`text-sm flex-1 ${
                    task.done 
                      ? 'line-through text-muted-foreground' 
                      : 'text-foreground'
                  }`}
                >
                  {task.title}
                </span>
              </div>
            ))}
            
            {tasks.length < 5 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/plan')}
                className="w-full mt-2 text-xs"
              >
                {t('journal.viewAll', { defaultValue: 'View all' })}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};