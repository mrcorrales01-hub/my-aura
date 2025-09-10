import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Users, Play, CheckCircle } from 'lucide-react';
import { VISIT_SCENARIOS } from '@/features/visit/roleplays/scenarios';

const VisitPractice = () => {
  const { t, i18n } = useTranslation(['visit', 'roleplay', 'common']);
  const navigate = useNavigate();
  
  const [selectedScenario, setSelectedScenario] = useState<typeof VISIT_SCENARIOS[0] | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [userNote, setUserNote] = useState('');
  const [isRunnerOpen, setIsRunnerOpen] = useState(false);

  const currentLang = i18n.language as 'sv' | 'en';

  const startScenario = (scenario: typeof VISIT_SCENARIOS[0]) => {
    setSelectedScenario(scenario);
    setCurrentStep(0);
    setUserNote('');
    setIsRunnerOpen(true);
  };

  const nextStep = () => {
    if (selectedScenario && currentStep < selectedScenario.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Finish scenario
      setIsRunnerOpen(false);
      setSelectedScenario(null);
      setCurrentStep(0);
      setUserNote('');
    }
  };

  const finishScenario = () => {
    setIsRunnerOpen(false);
    setSelectedScenario(null);
    setCurrentStep(0);
    setUserNote('');
  };

  return (
    <div className="container max-w-2xl mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/visit')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6" />
          {t('visit:practice')}
        </h1>
      </div>

      <div className="text-center">
        <p className="text-muted-foreground">
          {t('visit:practiceScenarios')} - Practice difficult conversations in a safe environment
        </p>
      </div>

      <div className="space-y-4">
        {VISIT_SCENARIOS.map((scenario) => (
          <Card key={scenario.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{scenario.title[currentLang] || scenario.title.en}</span>
                <Play className="h-5 w-5 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {scenario.steps.length} steps to practice this conversation
                </p>
                
                <div className="space-y-2">
                  {scenario.steps.map((step, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-xs bg-muted rounded-full w-5 h-5 flex items-center justify-center font-medium">
                        {index + 1}
                      </span>
                      <p className="text-sm">{step[currentLang] || step.en}</p>
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={() => startScenario(scenario)}
                  className="w-full"
                >
                  {t('visit:start')}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Practice Runner Modal */}
      <Dialog open={isRunnerOpen} onOpenChange={setIsRunnerOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedScenario?.title[currentLang] || selectedScenario?.title.en}
            </DialogTitle>
          </DialogHeader>
          
          {selectedScenario && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-2">
                  Step {currentStep + 1} of {selectedScenario.steps.length}
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${((currentStep + 1) / selectedScenario.steps.length) * 100}%` }}
                  />
                </div>
              </div>

              <Card>
                <CardContent className="pt-4">
                  <p className="text-sm font-medium">
                    {selectedScenario.steps[currentStep][currentLang] || selectedScenario.steps[currentStep].en}
                  </p>
                </CardContent>
              </Card>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Vad vill du säga med dina ord?
                </label>
                <Textarea
                  value={userNote}
                  onChange={(e) => setUserNote(e.target.value)}
                  placeholder="Write your thoughts or practice what you'd say..."
                  className="min-h-[80px]"
                />
              </div>

              <div className="flex gap-2">
                {currentStep < selectedScenario.steps.length - 1 ? (
                  <Button onClick={nextStep} className="flex-1">
                    Next Step
                  </Button>
                ) : (
                  <Button onClick={finishScenario} className="flex-1">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Finish Practice
                  </Button>
                )}
                <Button variant="outline" onClick={finishScenario}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VisitPractice;