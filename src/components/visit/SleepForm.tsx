import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Moon, ArrowLeft, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { SleepAnswers } from '@/features/visit/types';
import { getLatest, upsert } from '@/features/visit/store';
import { scoreSleep } from '@/features/visit/scoring';
import { useToast } from '@/hooks/use-toast';

export default function SleepForm() {
  const { t } = useTranslation('visit');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [answers, setAnswers] = useState<SleepAnswers>({
    troubleFalling: 0,
    awakenings: 0,
    sleepHours: 7,
    sleepLatencyMin: 15,
    caffeineAfter15: false,
    snoringOrApnea: false,
    notes: ''
  });
  
  useEffect(() => {
    const bundle = getLatest(user?.id);
    if (bundle?.sleep) {
      setAnswers(bundle.sleep);
    }
  }, [user?.id]);
  
  const score = scoreSleep(answers);
  
  const handleSave = () => {
    const bundle = getLatest(user?.id);
    upsert({
      ...bundle,
      sleep: answers,
      scores: {
        ...bundle?.scores,
        sleep: score
      }
    }, user?.id);
    
    toast({ title: t('save') });
    navigate('/visit');
  };
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'red': return 'bg-red-100 text-red-800 border-red-200';
      case 'amber': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'green': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const quickPrompts = [
    t('quickAsk') + ': "Varför vaknar jag på natten?"',
    t('quickAsk') + ': "Hur korta insomningstiden?"'
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => navigate('/visit')}
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-3">
              <Moon className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">{t('sectionSleep')}</h1>
            </div>
          </div>

          {/* Score Badge */}
          <Badge className={`${getSeverityColor(score.severity)} text-sm px-3 py-1`}>
            {t('score')}: {score.score} ({score.severity})
          </Badge>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Sömnmönster</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Trouble Falling Asleep */}
              <div className="space-y-3">
                <Label>{t('sleep.troubleFalling')}</Label>
                <RadioGroup
                  value={answers.troubleFalling.toString()}
                  onValueChange={(value) => setAnswers(prev => ({ ...prev, troubleFalling: parseInt(value) as 0|1|2|3 }))}
                >
                  {[
                    { value: '0', label: t('sleep.never') },
                    { value: '1', label: t('sleep.rarely') },
                    { value: '2', label: t('sleep.often') },
                    { value: '3', label: t('sleep.almostNightly') }
                  ].map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={`trouble-${option.value}`} />
                      <Label htmlFor={`trouble-${option.value}`}>{option.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Night Awakenings */}
              <div className="space-y-3">
                <Label>{t('sleep.awakenings')}</Label>
                <RadioGroup
                  value={answers.awakenings.toString()}
                  onValueChange={(value) => setAnswers(prev => ({ ...prev, awakenings: parseInt(value) as 0|1|2|3 }))}
                >
                  {[
                    { value: '0', label: t('sleep.never') },
                    { value: '1', label: t('sleep.rarely') },
                    { value: '2', label: t('sleep.often') },
                    { value: '3', label: t('sleep.almostNightly') }
                  ].map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={`awake-${option.value}`} />
                      <Label htmlFor={`awake-${option.value}`}>{option.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Sleep Hours */}
              <div className="space-y-3">
                <Label>{t('sleep.sleepHours')}: {answers.sleepHours}h</Label>
                <Input
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  value={answers.sleepHours}
                  onChange={(e) => setAnswers(prev => ({ ...prev, sleepHours: parseFloat(e.target.value) || 0 }))}
                />
              </div>

              {/* Sleep Latency */}
              <div className="space-y-3">
                <Label>{t('sleep.sleepLatency')}: {answers.sleepLatencyMin} min</Label>
                <Slider
                  value={[answers.sleepLatencyMin]}
                  onValueChange={([value]) => setAnswers(prev => ({ ...prev, sleepLatencyMin: value }))}
                  max={120}
                  step={5}
                  className="w-full"
                />
              </div>

              {/* Caffeine After 3 PM */}
              <div className="flex items-center justify-between">
                <Label>{t('sleep.caffeineAfter15')}</Label>
                <Switch
                  checked={answers.caffeineAfter15}
                  onCheckedChange={(checked) => setAnswers(prev => ({ ...prev, caffeineAfter15: checked }))}
                />
              </div>

              {/* Snoring or Apnea */}
              <div className="flex items-center justify-between">
                <Label>{t('sleep.snoringOrApnea')}</Label>
                <Switch
                  checked={answers.snoringOrApnea}
                  onCheckedChange={(checked) => setAnswers(prev => ({ ...prev, snoringOrApnea: checked }))}
                />
              </div>

              {/* Notes */}
              <div className="space-y-3">
                <Label>{t('sleep.notes')}</Label>
                <Textarea
                  value={answers.notes}
                  onChange={(e) => setAnswers(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Ytterligare information om din sömn..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Prompts */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                {quickPrompts.map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-left h-auto py-2"
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button onClick={handleSave} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {t('save')}
            </Button>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground text-center">
            {t('disclaimer')}
          </p>
        </div>
      </div>
    </div>
  );
}