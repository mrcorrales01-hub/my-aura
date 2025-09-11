import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { safeT } from '@/lib/i18n/index';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SCRIPTS } from '@/features/roleplay/scripts';

export default function RoleplayRunner() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const st = safeT(t);
  
  const [currentStep, setCurrentStep] = useState(0);
  const scenario = SCRIPTS.find(s => s.id === id);
  
  if (!scenario) {
    return (
      <div className="p-4">
        <p>{st('roleplay.noScripts', 'Scenario not found')}</p>
        <Button onClick={() => navigate('/roleplay')}>
          {st('common.back', 'Back')}
        </Button>
      </div>
    );
  }
  
  const title = scenario.title[i18n.language as keyof typeof scenario.title] || scenario.title.en;
  const currentStepText = scenario.steps[currentStep]?.[i18n.language as keyof typeof scenario.steps[0]] || 
                          scenario.steps[currentStep]?.en;
  
  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <div className="text-center">
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground">
          {st('common.step', 'Steg')} {currentStep + 1} / {scenario.steps.length}
        </p>
      </div>
      
      <Card className="p-6">
        <p className="text-center text-lg">{currentStepText}</p>
      </Card>
      
      <div className="flex gap-2">
        {currentStep > 0 && (
          <Button 
            variant="outline"
            onClick={() => setCurrentStep(currentStep - 1)}
          >
            {st('roleplay.prev', 'Tillbaka')}
          </Button>
        )}
        
        <div className="flex-1" />
        
        {currentStep < scenario.steps.length - 1 ? (
          <Button onClick={() => setCurrentStep(currentStep + 1)}>
            {st('roleplay.next', 'Nästa')}
          </Button>
        ) : (
          <Button onClick={() => navigate('/roleplay')}>
            {st('roleplay.finish', 'Avsluta')}
          </Button>
        )}
      </div>
    </div>
  );
}