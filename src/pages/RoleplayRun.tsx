import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, CheckCircle, Lightbulb } from 'lucide-react';
import { SCENARIOS } from '@/features/auri/roleplays/scenarios';

export default function RoleplayRun() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { i18n, t } = useTranslation(['roleplay', 'common']);
  
  const scenario = SCENARIOS.find(s => s.id === id);
  const [currentStep, setCurrentStep] = useState(0);
  const [showHint, setShowHint] = useState(false);

  if (!scenario) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Scenario not found</h2>
          <Button onClick={() => navigate('/roleplay')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to scenarios
          </Button>
        </Card>
      </div>
    );
  }

  const currentStepData = scenario.steps[currentStep];
  const isLastStep = currentStep === scenario.steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      navigate('/roleplay');
    } else {
      setCurrentStep(prev => prev + 1);
      setShowHint(false);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setShowHint(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl pb-24">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/roleplay')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('common:back')}
        </Button>
        
        <h1 className="text-2xl font-bold mb-2">
          {scenario.title[i18n.language] || scenario.title.en}
        </h1>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {t('step')} {currentStep + 1} / {scenario.steps.length}
          </Badge>
          <div className="flex-1 bg-muted rounded-full h-2">
            <div 
              className="bg-primary rounded-full h-2 transition-all duration-300"
              style={{ width: `${((currentStep + 1) / scenario.steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <Card className="p-6 mb-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">
                {currentStep + 1}
              </span>
              {t('hint')}
            </h3>
            <p className="text-lg">
              {currentStepData.goal[i18n.language] || currentStepData.goal.en}
            </p>
          </div>

          {currentStepData.hints && (
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHint(!showHint)}
                className="flex items-center gap-2"
              >
                <Lightbulb className="w-4 h-4" />
                {showHint ? t('hideHint', 'Hide Hint') : t('showHint', 'Show Hint')}
              </Button>
              
              {showHint && (
                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
                   {(() => {
                     const hints = currentStepData.hints?.[i18n.language] || currentStepData.hints?.en;
                     if (Array.isArray(hints)) {
                       return hints.map((hint: string, idx: number) => (
                         <p key={idx} className="mb-1 last:mb-0">• {hint}</p>
                       ));
                     } else if (typeof hints === 'string') {
                       return <p>• {hints}</p>;
                     } else {
                       return <p>• Practice this step at your own pace</p>;
                     }
                   })()}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      <div className="flex gap-3">
        {currentStep > 0 && (
          <Button variant="outline" onClick={handlePrev}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common:prev', 'Previous')}
          </Button>
        )}
        
        <Button onClick={handleNext} className="flex-1">
          {isLastStep ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              {t('finish')}
            </>
          ) : (
            <>
              <ArrowRight className="w-4 h-4 mr-2" />
              {t('next')}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}