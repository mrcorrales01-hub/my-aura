import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Heart, Users, Sparkles, Smile, Brain, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding = ({ onComplete }: OnboardingProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [intention, setIntention] = useState('');
  const [aiTone, setAiTone] = useState('');
  const [auriTone, setAuriTone] = useState('soothing');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

  const intentions = [
    {
      id: 'stress',
      title: t('onboarding.intentions.stress'),
      description: t('onboarding.intentions.stressDesc'),
      icon: Heart,
      color: 'text-wellness-primary'
    },
    {
      id: 'relationships',
      title: t('onboarding.intentions.relationships'),
      description: t('onboarding.intentions.relationshipsDesc'),
      icon: Users,
      color: 'text-calm'
    },
    {
      id: 'selfcare',
      title: t('onboarding.intentions.selfcare'),
      description: t('onboarding.intentions.selfcareDesc'),
      icon: Sparkles,
      color: 'text-coral'
    },
    {
      id: 'communication',
      title: t('onboarding.intentions.communication'),
      description: t('onboarding.intentions.communicationDesc'),
      icon: MessageCircle,
      color: 'text-wellness-secondary'
    }
  ];

  const aiTones = [
    {
      id: 'empathetic',
      title: t('onboarding.tones.empathetic'),
      description: t('onboarding.tones.empatheticDesc'),
      icon: Smile,
      color: 'text-wellness-secondary'
    },
    {
      id: 'professional',
      title: t('onboarding.tones.professional'),
      description: t('onboarding.tones.professionalDesc'),
      icon: Brain,
      color: 'text-calm'
    },
    {
      id: 'gentle',
      title: t('onboarding.tones.gentle'),
      description: t('onboarding.tones.gentleDesc'),
      icon: MessageCircle,
      color: 'text-coral'
    }
  ];

  const auriTones = [
    { 
      id: 'soothing', 
      title: t('auri.personalities.soothing.name'), 
      description: t('auri.personalities.soothing.description') 
    },
    { 
      id: 'playful', 
      title: t('auri.personalities.playful.name'), 
      description: t('auri.personalities.playful.description') 
    },
    { 
      id: 'wise', 
      title: t('auri.personalities.wise.name'), 
      description: t('auri.personalities.wise.description') 
    },
    { 
      id: 'energetic', 
      title: t('auri.personalities.encouraging.name'), 
      description: t('auri.personalities.encouraging.description') 
    }
  ];

  const savePreferences = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          intention,
          ai_tone: aiTone,
          auri_tone: auriTone,
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: t('onboarding.welcome'),
        description: t('onboarding.preferencesSaved')
      });

      onComplete();
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: t('common.error'),
        description: t('onboarding.errorSaving'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    } else {
      savePreferences();
    }
  };

  const progress = ((currentStep + 1) / 3) * 100;

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4 md:p-6">
      <Card className="w-full max-w-2xl shadow-wellness backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-wellness-primary">{t('onboarding.title')}</CardTitle>
          <CardDescription>
            {t('onboarding.subtitle')}
          </CardDescription>
          <Progress value={progress} className="mt-4" />
          <p className="text-sm text-muted-foreground mt-2">{t('onboarding.step', { current: (currentStep + 1).toString(), total: '3' })}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentStep === 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-center">{t('onboarding.focusQuestion')}</h3>
              <div className="grid gap-4">
                {intentions.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Card
                      key={item.id}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-soft ${
                        intention === item.id ? 'ring-2 ring-wellness-primary bg-gradient-wellness' : ''
                      }`}
                      onClick={() => setIntention(item.id)}
                    >
                      <CardContent className="p-4 flex items-center space-x-4">
                        <Icon className={`h-8 w-8 ${item.color}`} />
                        <div>
                          <h4 className="font-medium">{item.title}</h4>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-center">{t('onboarding.communicationQuestion')}</h3>
              <div className="grid gap-4">
                {aiTones.map((tone) => {
                  const Icon = tone.icon;
                  return (
                    <Card
                      key={tone.id}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-soft ${
                        aiTone === tone.id ? 'ring-2 ring-wellness-primary bg-gradient-wellness' : ''
                      }`}
                      onClick={() => setAiTone(tone.id)}
                    >
                      <CardContent className="p-4 flex items-center space-x-4">
                        <Icon className={`h-8 w-8 ${tone.color}`} />
                        <div>
                          <h4 className="font-medium">{tone.title}</h4>
                          <p className="text-sm text-muted-foreground">{tone.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-center">{t('onboarding.auriQuestion')}</h3>
              <div className="grid gap-4">
                {auriTones.map((tone) => (
                  <Card
                    key={tone.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-soft ${
                      auriTone === tone.id ? 'ring-2 ring-wellness-primary bg-gradient-wellness' : ''
                    }`}
                    onClick={() => setAuriTone(tone.id)}
                  >
                    <CardContent className="p-4 text-center">
                      <h4 className="font-medium">{tone.title}</h4>
                      <p className="text-sm text-muted-foreground">{tone.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="order-2 sm:order-1"
            >
              {t('onboarding.previous')}
            </Button>
            {currentStep < 2 && (
              <Button
                variant="ghost"
                onClick={onComplete}
                className="order-3 sm:order-2 text-muted-foreground"
              >
                Skip for now
              </Button>
            )}
            <Button
              onClick={nextStep}
              disabled={
                (currentStep === 0 && !intention) ||
                (currentStep === 1 && !aiTone) ||
                loading
              }
              className="order-1 sm:order-3"
            >
              {currentStep === 2 ? (loading ? t('onboarding.saving') : t('onboarding.complete')) : t('onboarding.next')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;