import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';
import { ExposurePlan, ExposureStep } from '@/features/exposure/types';
import { savePlan, getPlan } from '@/features/exposure/store';

const ExposureNewPage = () => {
  const { t } = useTranslation('exposure');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [situation, setSituation] = useState('');
  const [steps, setSteps] = useState<ExposureStep[]>([]);

  useEffect(() => {
    if (editId) {
      const existing = getPlan(editId);
      if (existing) {
        setName(existing.name);
        setSituation(existing.situation);
        setSteps(existing.steps);
        setStep(2);
      }
    }
  }, [editId]);

  const addStep = () => {
    if (steps.length < 5) {
      setSteps([...steps, {
        id: crypto.randomUUID(),
        label: '',
        difficulty: Math.max(1, (steps[steps.length - 1]?.difficulty || 0) + 1)
      }]);
    }
  };

  const updateStep = (index: number, field: keyof ExposureStep, value: string | number) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], [field]: value };
    setSteps(updated);
  };

  const removeStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
    }
  };

  const handleSave = () => {
    const plan: Partial<ExposurePlan> = {
      id: editId || undefined,
      name,
      situation,
      steps,
      lang: 'sv'
    };
    
    const saved = savePlan(plan);
    navigate(`/exposure/run/${saved.id}`);
  };

  const isNotAscending = steps.some((step, i) => 
    i > 0 && step.difficulty <= steps[i - 1].difficulty
  );

  if (step === 1) {
    return (
      <div className="container mx-auto px-4 py-8 pb-24">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Steg 1: Grundinfo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">{t('name')}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="t.ex. 'Sociala situationer'"
              />
            </div>
            
            <div>
              <Label htmlFor="situation">{t('situation')}</Label>
              <Textarea
                id="situation"
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                placeholder="Beskriv situationen du vill öva på..."
                rows={3}
              />
            </div>
            
            <Button 
              onClick={() => setStep(2)}
              disabled={!name.trim() || !situation.trim()}
              className="w-full"
            >
              Nästa: Lägg till steg
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Steg 2: Bygg din stege (5 steg)</CardTitle>
          {isNotAscending && (
            <div className="flex items-center gap-2 text-amber-600 text-sm">
              <AlertTriangle className="w-4 h-4" />
              Stegen bör ha stigande svårighetsgrad
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <Label>Steg {index + 1}</Label>
                {steps.length > 1 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeStep(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              <div className="space-y-2">
                <Input
                  value={step.label}
                  onChange={(e) => updateStep(index, 'label', e.target.value)}
                  placeholder="Beskriv detta steg..."
                />
                
                <div>
                  <Label>{t('difficulty')} ({step.difficulty})</Label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={step.difficulty}
                    onChange={(e) => updateStep(index, 'difficulty', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          ))}
          
          {steps.length < 5 && (
            <Button onClick={addStep} variant="outline" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              {t('addStep')}
            </Button>
          )}
          
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => setStep(1)}>
              Tillbaka
            </Button>
            <Button 
              onClick={handleSave}
              disabled={steps.length === 0 || steps.some(s => !s.label.trim())}
              className="flex-1"
            >
              {t('save')} & {t('startSession')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExposureNewPage;