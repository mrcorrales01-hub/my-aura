import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Download, RotateCcw, Play, ArrowRight, CheckCircle } from 'lucide-react';
import { getAllScenarios, type RoleplayScenario, exportTranscript } from './index';
import { streamRoleplay } from '@/services/auri';
import { toast } from 'sonner';

interface RoleplayMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

type RoleplayState = 'idle' | 'inStep' | 'graded' | 'complete';

export default function RoleplayPage() {
  const { t, i18n } = useTranslation(['roleplay', 'common']);
  const [scenarios, setScenarios] = useState<RoleplayScenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<RoleplayScenario | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [state, setState] = useState<RoleplayState>('idle');
  const [transcript, setTranscript] = useState<RoleplayMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [stepScores, setStepScores] = useState<Record<number, number>>({});
  const [coachNotes, setCoachNotes] = useState<Record<number, string>>({});
  const [showHint, setShowHint] = useState(false);
  const [language, setLanguage] = useState(i18n.language);

  useEffect(() => {
    setScenarios(getAllScenarios());
  }, []);

  useEffect(() => {
    setLanguage(i18n.language);
  }, [i18n.language]);

  const resetRoleplay = () => {
    setSelectedScenario(null);
    setCurrentStep(1);
    setState('idle');
    setTranscript([]);
    setInput('');
    setStepScores({});
    setCoachNotes({});
    setShowHint(false);
    setStreamingText('');
  };

  const startRoleplay = (scenario: RoleplayScenario) => {
    setSelectedScenario(scenario);
    setState('inStep');
    const systemMessage: RoleplayMessage = {
      role: 'system',
      content: `Starting roleplay: ${scenario.title[language] || scenario.title.en}`,
      timestamp: new Date()
    };
    setTranscript([systemMessage]);
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedScenario || isStreaming) return;

    const userMessage: RoleplayMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setTranscript(prev => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);
    setStreamingText('');

    try {
      const stream = await streamRoleplay({
        scenarioId: selectedScenario.id,
        step: currentStep.toString(),
        transcript: JSON.stringify([...transcript, userMessage]),
        language: language
      });

      let fullResponse = '';
      let stepResult: any = null;

      for await (const chunk of stream.stream) {
        if (chunk.type === 'token') {
          fullResponse += chunk.content;
          setStreamingText(fullResponse);
        } else if (chunk.type === 'step_result') {
          stepResult = chunk;
        } else if (chunk.type === 'error') {
          throw new Error(chunk.error);
        }
      }

      const assistantMessage: RoleplayMessage = {
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date()
      };

      setTranscript(prev => [...prev, assistantMessage]);
      setStreamingText('');

      if (stepResult) {
        setStepScores(prev => ({ ...prev, [currentStep]: stepResult.stepScore }));
        setCoachNotes(prev => ({ ...prev, [currentStep]: stepResult.coachNote }));
        setState('graded');
      }
    } catch (error) {
      console.error('Roleplay error:', error);
      toast.error(t('common:error'));
    } finally {
      setIsStreaming(false);
    }
  };

  const nextStep = () => {
    if (!selectedScenario) return;
    
    if (currentStep < selectedScenario.steps.length) {
      setCurrentStep(prev => prev + 1);
      setState('inStep');
      setShowHint(false);
    } else {
      setState('complete');
    }
  };

  const exportTranscript = () => {
    const data = {
      scenario: selectedScenario?.title[language],
      timestamp: new Date().toISOString(),
      transcript: transcript.filter(m => m.role !== 'system'),
      scores: stepScores,
      notes: coachNotes
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roleplay-${selectedScenario?.id}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentStepData = selectedScenario?.steps.find(s => s.id === currentStep);
  const totalSteps = selectedScenario?.steps.length || 0;
  const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;
  const averageScore = Object.values(stepScores).length > 0 
    ? Object.values(stepScores).reduce((a, b) => a + b, 0) / Object.values(stepScores).length 
    : 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{t('title')}</h1>
        
        {selectedScenario && (
          <div className="flex items-center gap-4 mb-4">
            <Progress value={progress} className="flex-1" />
            <Badge variant="outline">
              {t('step', { current: currentStep, total: totalSteps })}
            </Badge>
            <Button variant="outline" size="sm" onClick={resetRoleplay}>
              <RotateCcw className="h-4 w-4 mr-2" />
              {t('reset')}
            </Button>
          </div>
        )}
      </div>

      {state === 'idle' && (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('selectScenario')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="mb-4">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sv">Svenska</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="no">Norsk</SelectItem>
                  <SelectItem value="da">Dansk</SelectItem>
                  <SelectItem value="fi">Suomi</SelectItem>
                </SelectContent>
              </Select>

              <div className="grid gap-4">
                {scenarios.map((scenario) => (
                  <Card key={scenario.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold mb-2">
                            {scenario.title[language] || scenario.title.en}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {t('roleplay:selectScenario')}
                          </p>
                          <Badge variant="secondary" className="mt-2">
                            {scenario.steps.length} {t('step', { current: scenario.steps.length, total: scenario.steps.length })}
                          </Badge>
                        </div>
                        <Button onClick={() => startRoleplay(scenario)}>
                          <Play className="h-4 w-4 mr-2" />
                          {t('start')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedScenario && state !== 'idle' && (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{selectedScenario.title[language] || selectedScenario.title.en}</span>
                {state === 'complete' && (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    {t('complete')}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentStepData && (
                <div className="mb-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">
                    {t('step', { current: currentStep, total: totalSteps })}
                  </h4>
                  <p className="text-sm">
                    {currentStepData.goal[language] || currentStepData.goal.en}
                  </p>
                  
                  {currentStepData.hints && (
                    <div className="mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowHint(!showHint)}
                      >
                        <Lightbulb className="h-4 w-4 mr-2" />
                        {showHint ? t('hideHint') : t('showHint')}
                      </Button>
                      
                      {showHint && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                          <ul className="list-disc list-inside">
                            {(currentStepData.hints[language] || currentStepData.hints.en || []).map((hint: string, idx: number) => (
                              <li key={idx}>{hint}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                {transcript.filter(m => m.role !== 'system').map((message, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground ml-8'
                        : 'bg-muted mr-8'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                ))}
                
                {streamingText && (
                  <div className="p-3 rounded-lg bg-muted mr-8">
                    <p className="text-sm">{streamingText}</p>
                    <div className="inline-block w-2 h-4 bg-current animate-pulse ml-1" />
                  </div>
                )}
              </div>

              {state === 'graded' && stepScores[currentStep] && (
                <div className="mb-4 p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{t('score')}</span>
                    <Badge variant="secondary">{stepScores[currentStep]}/5</Badge>
                  </div>
                  <p className="text-sm text-green-700">{coachNotes[currentStep]}</p>
                </div>
              )}

              {state === 'inStep' && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder={t('common:type_message')}
                    className="flex-1 px-3 py-2 border rounded-md"
                    disabled={isStreaming}
                  />
                  <Button onClick={sendMessage} disabled={!input.trim() || isStreaming}>
                    {isStreaming ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ArrowRight className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )}

              {state === 'graded' && (
                <div className="flex gap-2 mt-4">
                  {currentStep < totalSteps ? (
                    <Button onClick={nextStep} className="flex-1">
                      <ArrowRight className="h-4 w-4 mr-2" />
                      {t('next')}
                    </Button>
                  ) : (
                    <Button onClick={nextStep} className="flex-1">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {t('finish')}
                    </Button>
                  )}
                </div>
              )}

              {state === 'complete' && (
                <div className="text-center space-y-4">
                  <div className="p-6 bg-green-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-800 mb-2">
                      {t('wellDone')}
                    </h3>
                    <p className="text-green-700">
                      {t('finalScore', { score: averageScore.toFixed(1) })}
                    </p>
                  </div>
                  
                  <div className="flex gap-4">
                    <Button variant="outline" onClick={exportTranscript} className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      {t('exportTranscript')}
                    </Button>
                    <Button onClick={resetRoleplay} className="flex-1">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      {t('tryAgain')}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}