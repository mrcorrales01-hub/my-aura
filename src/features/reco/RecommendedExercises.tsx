import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Play, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/EmptyState';
import { BreathingRing } from '@/features/exercises/components/BreathingRing';
import { useToast } from '@/hooks/use-toast';
import { useRecommendedExercises, useLogExerciseSession } from './api';

const RecommendedExercises: React.FC = () => {
  const { t, i18n } = useTranslation(['exercises', 'common']);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: exercises, isLoading, error } = useRecommendedExercises();
  const logExerciseSession = useLogExerciseSession();

  const getLocalizedContent = (content: Record<string, string>) => {
    return content[i18n.language] || content['en'] || Object.values(content)[0] || '';
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.ceil(seconds / 60);
    return `${minutes} ${t('exercises:min')}`;
  };

  const handleStartExercise = async (exerciseId: string, slug: string) => {
    try {
      await logExerciseSession.mutateAsync(exerciseId);
      toast({
        title: t('exercises:started'),
        description: t('exercises:enjoy'),
      });
      // Navigate to exercise player
      navigate(`/exercises/${slug}`);
    } catch (error) {
      console.error('Failed to start exercise:', error);
      toast({
        title: t('common:error'),
        description: t('exercises:startError'),
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('exercises:suggested')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('exercises:suggested')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            {t('common:error')}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!exercises?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('exercises:suggested')}</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Play}
            titleKey="exercises.empty"
            descriptionKey="exercises.emptyDescription"
            namespace="exercises"
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/exercises')}
              >
                {t('exercises:browse')}
              </Button>
            }
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="w-5 h-5 text-primary" />
          {t('exercises:suggested')}
        </CardTitle>
        <CardDescription>
          {t('exercises:basedOnMood')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {exercises.map((exercise) => (
          <div
            key={exercise.id}
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm mb-1">
                {getLocalizedContent(exercise.title)}
              </h4>
              <p className="text-muted-foreground text-xs mb-2 line-clamp-2">
                {getLocalizedContent(exercise.description)}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {formatDuration(exercise.duration_seconds)}
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => handleStartExercise(exercise.id, exercise.slug)}
              disabled={logExerciseSession.isPending}
              className="ml-3 shrink-0"
            >
              {logExerciseSession.isPending ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Play className="w-3 h-3 mr-1" />
                  {t('exercises:start')}
                </>
              )}
            </Button>
          </div>
        ))}
        
        <div className="pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/exercises')}
            className="w-full text-muted-foreground hover:text-foreground"
          >
            {t('exercises:viewAll')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendedExercises;