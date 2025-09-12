import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Clock, Play, RotateCcw, CheckCircle, Plus, BookOpen, Download } from 'lucide-react';
import { FLOWS, type CoachFlow, type CoachFlowId } from '@/features/coach/flows';
import { getRun, upsertRun, completeRun, logToJournal } from '@/features/coach/state';
import { getSmartPlan, addGoalToSmartPlan } from '@/features/plan/smartPlan';
import { useToast } from '@/hooks/use-toast';

const BreathingTimer = ({ breath, onComplete }: { breath: any; onComplete: () => void }) => {
  const { t } = useTranslation('coach');
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in');
  const [cyclesLeft, setCyclesLeft] = useState(breath.cycles);
  const [progress, setProgress] = useState(0);
  const [phaseTime, setPhaseTime] = useState(0);

  useEffect(() => {
    if (cyclesLeft <= 0) {
      onComplete();
      return;
    }

    const phaseDuration = phase === 'in' ? breath.in : phase === 'hold' ? breath.hold : breath.out;
    
    const interval = setInterval(() => {
      setPhaseTime(prev => {
        const next = prev + 0.1;
        setProgress((next / phaseDuration) * 100);
        
        if (next >= phaseDuration) {
          if (phase === 'in') {
            setPhase('hold');
          } else if (phase === 'hold') {
            setPhase('out');
          } else {
            setPhase('in');
            setCyclesLeft(c => c - 1);
          }
          return 0;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [phase, cyclesLeft, breath]);

  const phaseText = phase === 'in' ? t('breatheIn') : phase === 'hold' ? t('hold') : t('breatheOut');

  return (
    <div className="flex flex-col items-center space-y-4 py-8">
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="56"
            stroke="hsl(var(--border))"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx="64"
            cy="64"
            r="56"
            stroke="hsl(var(--primary))"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={`${2 * Math.PI * 56}`}
            strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
            className="transition-all duration-100 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-semibold text-primary">{Math.ceil(phaseTime)}</div>
          <div className="text-sm text-muted-foreground">{phaseText}</div>
        </div>
      </div>
      
      <div className="text-center">
        <div className="text-lg font-medium">{t('cycles')}: {cyclesLeft} {t('remaining')}</div>
        <Progress value={((breath.cycles - cyclesLeft) / breath.cycles) * 100} className="w-48 mt-2" />
      </div>
    </div>
  );
};

const FlowRunner = ({ flow, onClose }: { flow: CoachFlow; onClose: () => void }) => {
  const { t, i18n } = useTranslation('coach');
  const { toast } = useToast();
  const lang = i18n.language.startsWith('sv') ? 'sv' : 'en';
  
  const [run, setRun] = useState(() => getRun(flow.id) || {
    flowId: flow.id,
    stepIndex: 0,
    startedAt: new Date().toISOString(),
    completed: false
  });

  const currentStep = flow.steps[run.stepIndex];
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
  const [showCompletion, setShowCompletion] = useState(false);

  const saveRun = (updates: Partial<typeof run>) => {
    const newRun = { ...run, ...updates };
    setRun(newRun);
    upsertRun(newRun);
  };

  const nextStep = () => {
    if (run.stepIndex < flow.steps.length - 1) {
      const newIndex = run.stepIndex + 1;
      saveRun({ stepIndex: newIndex });
      setCheckedItems(new Set());
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (run.stepIndex > 0) {
      const newIndex = run.stepIndex - 1;
      saveRun({ stepIndex: newIndex });
      setCheckedItems(new Set());
    }
  };

  const handleComplete = async () => {
    await completeRun(flow.id);
    setShowCompletion(true);
  };

  const addToPlan = () => {
    const suggestion = lang === 'sv' ? flow.planSuggestionSv : flow.planSuggestionEn;
    addGoalToSmartPlan(suggestion);
    toast({ title: t('addedToPlan') });
  };

  const saveToJournal = async () => {
    const title = flow.title[lang];
    const content = flow.steps.map((step, i) => 
      `${i + 1}. ${step.title[lang]}`
    ).join('\n');
    
    await logToJournal(flow.id, title, content);
    toast({ title: t('logged') });
  };

  const exportPdf = () => {
    // Simple PDF export using jsPDF
    import('jspdf').then(({ default: jsPDF }) => {
      const doc = new jsPDF();
      doc.text(`Coach: ${flow.title[lang]}`, 20, 20);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 30);
      doc.text(`Duration: ${flow.estMinutes} minutes`, 20, 40);
      
      let y = 60;
      flow.steps.forEach((step, i) => {
        doc.text(`${i + 1}. ${step.title[lang]}`, 20, y);
        y += 10;
      });
      
      doc.save(`coach-${flow.id}-${new Date().toISOString().split('T')[0]}.pdf`);
    });
  };

  if (showCompletion) {
    return (
      <div className="max-w-md mx-auto p-6 space-y-6">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold">{t('complete')}</h2>
          <p className="text-muted-foreground mt-2">{flow.title[lang]}</p>
        </div>
        
        <div className="space-y-3">
          <Button onClick={addToPlan} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            {t('addToPlan')}
          </Button>
          
          <Button onClick={saveToJournal} variant="outline" className="w-full">
            <BookOpen className="h-4 w-4 mr-2" />
            {t('logToJournal')}
          </Button>
          
          <Button onClick={exportPdf} variant="outline" className="w-full">
            <Download className="h-4 w-4 mr-2" />
            {t('exportPdf')}
          </Button>
        </div>
        
        <Button onClick={onClose} className="w-full">
          {t('done')}
        </Button>
        
        <p className="text-xs text-muted-foreground text-center">
          {t('disclaimer')}
        </p>
      </div>
    );
  }

  const canContinue = currentStep.kind !== 'checklist' || checkedItems.size > 0;

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <div className="text-center">
        <Badge variant="outline" className="mb-2">
          {t('step', { n: run.stepIndex + 1, t: flow.steps.length })}
        </Badge>
        <h2 className="text-xl font-bold">{currentStep.title[lang]}</h2>
      </div>

      <Progress value={((run.stepIndex + 1) / flow.steps.length) * 100} />

      <div className="space-y-4">
        {currentStep.kind === 'read' && (
          <div className="space-y-4">
            <p className="text-muted-foreground">{currentStep.body?.[lang]}</p>
          </div>
        )}

        {currentStep.kind === 'action' && (
          <div className="space-y-4">
            <p className="text-muted-foreground">{currentStep.body?.[lang]}</p>
          </div>
        )}

        {currentStep.kind === 'checklist' && currentStep.items && (
          <div className="space-y-3">
            {currentStep.items[lang]?.map((item, index) => (
              <div key={index} className="flex items-start space-x-3">
                <Checkbox
                  checked={checkedItems.has(index)}
                  onCheckedChange={(checked) => {
                    const newSet = new Set(checkedItems);
                    if (checked) {
                      newSet.add(index);
                    } else {
                      newSet.delete(index);
                    }
                    setCheckedItems(newSet);
                  }}
                />
                <span className="text-sm leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        )}

        {currentStep.kind === 'breath' && currentStep.breath && (
          <BreathingTimer
            breath={currentStep.breath}
            onComplete={() => setCheckedItems(new Set([0]))} // Mark as completable
          />
        )}
      </div>

      <div className="flex space-x-3">
        <Button
          onClick={prevStep}
          disabled={run.stepIndex === 0}
          variant="outline"
          className="flex-1"
        >
          {t('back')}
        </Button>
        
        <Button
          onClick={nextStep}
          disabled={!canContinue}
          className="flex-1"
        >
          {run.stepIndex === flow.steps.length - 1 ? t('done') : t('next')}
        </Button>
      </div>
    </div>
  );
};

export default function CoachHubPage() {
  const { t, i18n } = useTranslation('coach');
  const [searchParams] = useSearchParams();
  const [activeFlowId, setActiveFlowId] = useState<CoachFlowId | null>(
    searchParams.get('flow') as CoachFlowId || null
  );
  
  const lang = i18n.language.startsWith('sv') ? 'sv' : 'en';
  const activeFlow = activeFlowId ? FLOWS.find(f => f.id === activeFlowId) : null;

  if (activeFlow) {
    return <FlowRunner flow={activeFlow} onClose={() => setActiveFlowId(null)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">{t('title')}</h1>
            <p className="text-muted-foreground">{t('subtitle')}</p>
          </div>

          <div className="space-y-4">
            {FLOWS.map((flow) => {
              const run = getRun(flow.id);
              const isInProgress = run && !run.completed;
              
              return (
                <Card key={flow.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{flow.title[lang]}</CardTitle>
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        {flow.estMinutes} min
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => setActiveFlowId(flow.id)}
                      className="w-full"
                      variant={isInProgress ? "default" : "outline"}
                    >
                      {isInProgress ? (
                        <>
                          <RotateCcw className="h-4 w-4 mr-2" />
                          {t('resume')}
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          {t('start')}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <p className="text-xs text-muted-foreground text-center">
            {t('disclaimer')}
          </p>
        </div>
      </div>
    </div>
  );
}