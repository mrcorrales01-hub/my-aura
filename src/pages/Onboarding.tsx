import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, Target, Clock, CheckCircle } from 'lucide-react';

interface OnboardingData {
  language: string;
  intention: string;
  dailyTime: string;
}

const Onboarding: React.FC = () => {
  const { t, i18n } = useTranslation(['common', 'onboarding']);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    language: i18n.language,
    intention: '',
    dailyTime: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'sv', name: 'Svenska' },
    { code: 'es', name: 'Español' },
    { code: 'no', name: 'Norsk' },
    { code: 'da', name: 'Dansk' },
    { code: 'fi', name: 'Suomi' }
  ];

  const intentions = [
    { 
      id: 'emotional-wellbeing', 
      icon: Heart, 
      title: t('onboarding.intentions.emotional.title'),
      description: t('onboarding.intentions.emotional.description')
    },
    { 
      id: 'relationships', 
      icon: Target, 
      title: t('onboarding.intentions.relationships.title'),
      description: t('onboarding.intentions.relationships.description')
    },
    { 
      id: 'confidence', 
      icon: CheckCircle, 
      title: t('onboarding.intentions.confidence.title'),
      description: t('onboarding.intentions.confidence.description')
    }
  ];

  const dailyTimes = [
    { id: 'morning', time: '08:00', label: t('onboarding.times.morning') },
    { id: 'midday', time: '12:00', label: t('onboarding.times.midday') },
    { id: 'evening', time: '18:00', label: t('onboarding.times.evening') },
    { id: 'night', time: '21:00', label: t('onboarding.times.night') }
  ];

  const handleLanguageChange = (languageCode: string) => {
    setData({ ...data, language: languageCode });
    i18n.changeLanguage(languageCode);
  };

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Save user preferences
      const { error: prefsError } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          language_preference: data.language,
          daily_reminder_time: data.dailyTime,
          primary_intention: data.intention,
          onboarding_completed: true
        }, {
          onConflict: 'user_id'
        });

      if (prefsError) throw prefsError;

      // Create initial plan based on intention
      const planTasks = getInitialTasks(data.intention);
      
      if (planTasks.length > 0) {
        const { error: planError } = await supabase
          .from('plan_tasks')
          .insert(
            planTasks.map(task => ({
              user_id: user.id,
              title: task.title,
              description: task.description,
              category: 'wellbeing',
              priority: 'medium' as const,
              due_date: new Date().toISOString().split('T')[0]
            }))
          );

        if (planError) throw planError;
      }

      toast({
        title: t('onboarding.complete.title'),
        description: t('onboarding.complete.description'),
      });

      navigate('/', { replace: true });
    } catch (error) {
      console.error('Onboarding error:', error);
      toast({
        title: t('common.error'),
        description: t('onboarding.error'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInitialTasks = (intention: string) => {
    const taskMap: Record<string, Array<{ title: string; description: string }>> = {
      'emotional-wellbeing': [
        { 
          title: t('onboarding.tasks.emotional.mood.title'), 
          description: t('onboarding.tasks.emotional.mood.description') 
        },
        { 
          title: t('onboarding.tasks.emotional.breathing.title'), 
          description: t('onboarding.tasks.emotional.breathing.description') 
        }
      ],
      'relationships': [
        { 
          title: t('onboarding.tasks.relationships.communication.title'), 
          description: t('onboarding.tasks.relationships.communication.description') 
        },
        { 
          title: t('onboarding.tasks.relationships.boundary.title'), 
          description: t('onboarding.tasks.relationships.boundary.description') 
        }
      ],
      'confidence': [
        { 
          title: t('onboarding.tasks.confidence.journal.title'), 
          description: t('onboarding.tasks.confidence.journal.description') 
        },
        { 
          title: t('onboarding.tasks.confidence.affirmation.title'), 
          description: t('onboarding.tasks.confidence.affirmation.description') 
        }
      ]
    };

    return taskMap[intention] || [];
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <Card className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">{t('onboarding.language.title')}</h2>
              <p className="text-muted-foreground">{t('onboarding.language.description')}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {languages.map((language) => (
                <Button
                  key={language.code}
                  variant={data.language === language.code ? 'default' : 'outline'}
                  onClick={() => handleLanguageChange(language.code)}
                  className="h-auto p-4"
                >
                  <div className="text-center">
                    <div className="font-medium">{language.name}</div>
                  </div>
                </Button>
              ))}
            </div>
          </Card>
        );

      case 1:
        return (
          <Card className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">{t('onboarding.intention.title')}</h2>
              <p className="text-muted-foreground">{t('onboarding.intention.description')}</p>
            </div>
            
            <div className="space-y-3">
              {intentions.map((intention) => {
                const IconComponent = intention.icon;
                return (
                  <Button
                    key={intention.id}
                    variant={data.intention === intention.id ? 'default' : 'outline'}
                    onClick={() => setData({ ...data, intention: intention.id })}
                    className="w-full h-auto p-4 text-left"
                  >
                    <div className="flex items-start space-x-3">
                      <IconComponent className="w-6 h-6 mt-1 flex-shrink-0" />
                      <div>
                        <div className="font-medium">{intention.title}</div>
                        <div className="text-sm opacity-80">{intention.description}</div>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </Card>
        );

      case 2:
        return (
          <Card className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">{t('onboarding.time.title')}</h2>
              <p className="text-muted-foreground">{t('onboarding.time.description')}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {dailyTimes.map((timeOption) => (
                <Button
                  key={timeOption.id}
                  variant={data.dailyTime === timeOption.time ? 'default' : 'outline'}
                  onClick={() => setData({ ...data, dailyTime: timeOption.time })}
                  className="h-auto p-4"
                >
                  <div className="text-center">
                    <Clock className="w-5 h-5 mx-auto mb-2" />
                    <div className="font-medium">{timeOption.label}</div>
                    <div className="text-sm opacity-80">{timeOption.time}</div>
                  </div>
                </Button>
              ))}
            </div>
          </Card>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return data.language !== '';
      case 1: return data.intention !== '';
      case 2: return data.dailyTime !== '';
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-md mx-auto pt-20">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              {t('onboarding.step')} {currentStep + 1} {t('onboarding.of')} 3
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(((currentStep + 1) / 3) * 100)}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${((currentStep + 1) / 3) * 100}%` }}
            />
          </div>
        </div>

        {renderStep()}

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            {t('common.back')}
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!canProceed() || isLoading}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : null}
            {currentStep === 2 ? t('onboarding.complete.button') : t('common.next')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;