import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, FileDown } from 'lucide-react';
import { PHQ9, GAD7, scorePHQ9, scoreGAD7, type ScreenerId, type ScreenerItem } from '@/features/screeners/items';
import { saveResult } from '@/features/screeners/store';
import { toast } from 'sonner';
import { createScreenerPdf } from '@/features/screeners/pdf';

type ScreenerState = {
  active: ScreenerId | null;
  answers: Record<string, number>;
  result: { score: number; severity: string } | null;
};

export default function ScreenerHubPage() {
  const { t, i18n } = useTranslation(['screeners', 'common']);
  const [state, setState] = useState<ScreenerState>({
    active: null,
    answers: {},
    result: null
  });

  const lang = i18n.language as 'sv' | 'en';
  
  const screeners = {
    phq9: { items: PHQ9, scorer: scorePHQ9, title: t('phq9') },
    gad7: { items: GAD7, scorer: scoreGAD7, title: t('gad7') }
  };

  const startScreener = (id: ScreenerId) => {
    setState({ active: id, answers: {}, result: null });
  };

  const setAnswer = (itemId: string, value: number) => {
    setState(prev => ({
      ...prev,
      answers: { ...prev.answers, [itemId]: value }
    }));
  };

  const submitScreener = () => {
    if (!state.active) return;
    
    const screener = screeners[state.active];
    const answers = screener.items.map(item => state.answers[item.id] || 0);
    const result = screener.scorer(answers);
    
    setState(prev => ({ ...prev, result }));
    
    // Save result
    const entry = {
      date: new Date().toISOString(),
      id: state.active!,
      score: result.score,
      severity: result.severity,
      answers
    };
    
    saveResult(entry);
    toast.success(t('common:saved', 'Sparat!'));
  };

  const exportPDF = () => {
    if (!state.active || !state.result) return;
    
    const screener = screeners[state.active];
    const answers = screener.items.map(item => state.answers[item.id] || 0);
    
    createScreenerPdf({
      id: state.active,
      result: state.result,
      answers,
      name: 'User', // Could get from user profile
      lang: lang
    });
    
    toast.success(t('common:exported', 'Exporterat!'));
  };

  const reset = () => {
    setState({ active: null, answers: {}, result: null });
  };

  const choiceLabels = [
    t('notAtAll'),
    t('severalDays'), 
    t('moreThanHalf'),
    t('nearlyEvery')
  ];

  if (state.active) {
    const screener = screeners[state.active];
    const isComplete = screener.items.every(item => state.answers[item.id] !== undefined);
    const hasP9Response = state.active === 'phq9' && state.answers['p9'] > 0;
    
    return (
      <div className="space-y-6 p-4 pb-24">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{screener.title}</h1>
          <Button variant="outline" onClick={reset}>Tillbaka</Button>
        </div>
        
        {state.result ? (
          <Card>
            <CardHeader>
              <CardTitle>{t('yourScore')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-2xl font-bold">
                {state.result.score} - {state.result.severity}
              </div>
              
              {hasP9Response && (
                <Alert className="border-red-500">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {t('safetyWarning')}
                    <Button className="ml-2" variant="destructive" size="sm">
                      {t('getCrisisHelp')}
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="flex gap-2">
                <Button onClick={exportPDF}>
                  <FileDown className="w-4 h-4 mr-2" />
                  {t('exportPdf')}
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground">{t('disclaimer')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {screener.items.map((item, index) => (
              <Card key={item.id}>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <p className="font-medium">{index + 1}. {item[lang]}</p>
                    <RadioGroup 
                      value={state.answers[item.id]?.toString()} 
                      onValueChange={(value) => setAnswer(item.id, parseInt(value))}
                    >
                      {choiceLabels.map((label, i) => (
                        <div key={i} className="flex items-center space-x-2">
                          <RadioGroupItem value={i.toString()} id={`${item.id}-${i}`} />
                          <Label htmlFor={`${item.id}-${i}`}>{i} - {label}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <Button 
              onClick={submitScreener} 
              disabled={!isComplete}
              className="w-full"
            >
              {t('submit')}
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 pb-24">
      <h1 className="text-2xl font-semibold">{t('title')}</h1>
      
      <div className="grid gap-4">
        {Object.entries(screeners).map(([id, screener]) => (
          <Card key={id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => startScreener(id as ScreenerId)}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {screener.title}
                <Button>{t('start')}</Button>
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
      
      <p className="text-sm text-muted-foreground">{t('disclaimer')}</p>
    </div>
  );
}