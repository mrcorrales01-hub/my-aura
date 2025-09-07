import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Play, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useSuggestedExercise } from '../api/homeQueries';

export const ExerciseCard = () => {
  const { t } = useTranslation('home');
  const navigate = useNavigate();
  const { data: exercise, isLoading, error, refetch } = useSuggestedExercise();

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return t('exercises.duration', { minutes });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            <Skeleton className="h-4 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-8 w-24 mt-3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{t('exercises.suggested')}</CardTitle>
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

  if (!exercise) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{t('exercises.suggested')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Play className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-3">
              {t('exercises.noSuggestions')}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/exercises')}
            >
              {t('exercises.openAll')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{t('exercises.suggested')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-sm mb-1">{exercise.title}</h4>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {exercise.description}
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{formatDuration(exercise.duration_seconds)}</span>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => navigate(`/exercises/${exercise.id}`)}
              className="flex-1 gap-1"
            >
              <Play className="h-3 w-3" />
              {t('common:play', { defaultValue: 'Play' })}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/exercises')}
            >
              {t('exercises.openAll')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};