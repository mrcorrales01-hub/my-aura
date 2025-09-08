import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Play, Pause, RotateCcw, CheckCircle, ArrowLeft, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useExerciseBySlug, useLogExerciseSession } from '@/features/reco/api';

const ExercisePlayer: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(['exercises', 'common']);
  const { data: exercise, isLoading, error } = useExerciseBySlug(slug || '');
  const logExerciseSession = useLogExerciseSession();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const getLocalizedContent = (content: Record<string, string>) => {
    return content?.[i18n.language] || content?.['en'] || Object.values(content || {})[0] || '';
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const parseSteps = (description: string) => {
    return description.split(/\n|\./).filter(step => step.trim().length > 0);
  };

  const handleStart = () => {
    if (!exercise) return;
    
    setTimeLeft(exercise.duration_seconds);
    setIsPlaying(true);
    setHasStarted(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setTimeLeft(exercise?.duration_seconds || 0);
    setIsCompleted(false);
  };

  const handleComplete = async () => {
    if (!exercise) return;
    
    setIsCompleted(true);
    setIsPlaying(false);
    
    try {
      await logExerciseSession.mutateAsync(exercise.id);
    } catch (error) {
      console.error('Failed to log exercise completion:', error);
    }
  };

  // Timer effect
  useEffect(() => {
    if (!isPlaying || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsPlaying(false);
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, timeLeft]);

  // Set initial time when exercise loads
  useEffect(() => {
    if (exercise && !hasStarted) {
      setTimeLeft(exercise.duration_seconds);
    }
  }, [exercise, hasStarted]);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="w-8 h-8" />
          <Skeleton className="w-32 h-6" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="w-3/4 h-8" />
            <Skeleton className="w-full h-4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="w-full h-32" />
            <Skeleton className="w-full h-12" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !exercise) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('common:back')}
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {t('exercises:notFound')}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = hasStarted 
    ? ((exercise.duration_seconds - timeLeft) / exercise.duration_seconds) * 100 
    : 0;
  
  const steps = parseSteps(getLocalizedContent(exercise.description));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        {t('common:back')}
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isCompleted && <CheckCircle className="w-6 h-6 text-green-500" />}
            {getLocalizedContent(exercise.title)}
          </CardTitle>
          <CardDescription className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {Math.ceil(exercise.duration_seconds / 60)} {t('exercises:min')}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Timer Display */}
          <div className="text-center space-y-4">
            <div className="text-4xl font-mono font-bold">
              {formatTime(timeLeft)}
            </div>
            
            {hasStarted && (
              <Progress value={progress} className="w-full" />
            )}
          </div>

          {/* Exercise Steps */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              {t('exercises:steps')}
            </h3>
            <div className="space-y-2">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.trim()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-2 justify-center pt-4">
            {!hasStarted ? (
              <Button onClick={handleStart} size="lg">
                <Play className="w-4 h-4 mr-2" />
                {t('exercises:start')}
              </Button>
            ) : (
              <>
                <Button
                  onClick={isPlaying ? handlePause : () => setIsPlaying(true)}
                  disabled={isCompleted}
                  size="lg"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      {t('exercises:pause')}
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      {t('exercises:resume')}
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={isCompleted}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {t('exercises:reset')}
                </Button>

                {timeLeft === 0 && !isCompleted && (
                  <Button
                    onClick={handleComplete}
                    variant="default"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {t('exercises:finish')}
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Completion Message */}
          {isCompleted && (
            <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-green-700 dark:text-green-300 font-medium">
                {t('exercises:completed')}
              </p>
              <p className="text-green-600 dark:text-green-400 text-sm mt-1">
                {t('exercises:wellDone')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExercisePlayer;