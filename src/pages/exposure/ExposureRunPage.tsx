import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Play, Square, Download, Share, BookOpen, Calendar } from 'lucide-react';
import { getPlan, startSession, endSession, getSessionsForPlan } from '@/features/exposure/store';
import { ExposureSession } from '@/features/exposure/types';
import { exportExposurePDF } from '@/features/exposure/pdf';
import { useToast } from '@/hooks/use-toast';

const ExposureRunPage = () => {
  const { t } = useTranslation('exposure');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [plan, setPlan] = useState(getPlan(id!));
  const [selectedStepId, setSelectedStepId] = useState<string>('');
  const [currentSession, setCurrentSession] = useState<ExposureSession | null>(null);
  const [beforeSUDS, setBeforeSUDS] = useState<number>(5);
  const [afterSUDS, setAfterSUDS] = useState<number>(5);
  const [minutes, setMinutes] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [timer, setTimer] = useState<number>(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  if (!plan) {
    return (
      <div className="container mx-auto px-4 py-8 pb-24">
        <Card>
          <CardContent className="py-8 text-center">
            <p>Plan hittades inte</p>
            <Button onClick={() => navigate('/exposure')}>
              Tillbaka till stegar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleStartSession = () => {
    if (!selectedStepId) return;
    
    const session = startSession({
      planId: plan.id,
      stepId: selectedStepId,
      before: beforeSUDS
    });
    
    setCurrentSession(session);
    setIsRunning(true);
    setTimer(0);
  };

  const handleEndSession = () => {
    if (!currentSession) return;
    
    const sessionMinutes = Math.floor(timer / 60);
    setMinutes(sessionMinutes);
    
    endSession({
      sessionId: currentSession.id,
      after: afterSUDS,
      minutes: sessionMinutes,
      notes
    });
    
    setIsRunning(false);
    setCurrentSession(null);
    
    toast({
      title: t('completed'),
      description: t('addedJournal')
    });
  };

  const handleExportPDF = () => {
    if (!currentSession) return;
    
    const step = plan.steps.find(s => s.id === selectedStepId);
    exportExposurePDF({
      plan,
      step: step!,
      session: {
        ...currentSession,
        after: afterSUDS,
        minutes,
        notes
      }
    });
  };

  const handleShare = () => {
    if (plan.shareToken) {
      const url = `${window.location.origin}/exposure/share/${plan.shareToken}`;
      navigator.clipboard.writeText(url);
      toast({
        title: "Länk kopierad",
        description: "Delbar länk har kopierats till urklipp"
      });
    }
  };

  const renderCurve = (before: number, after: number) => {
    const width = 200;
    const height = 60;
    const startY = height - (before / 10) * height;
    const endY = height - (after / 10) * height;
    
    return (
      <svg width={width} height={height} className="border rounded">
        <path
          d={`M 20 ${startY} Q 100 ${Math.min(startY, endY) - 10} 180 ${endY}`}
          stroke="#3b82f6"
          strokeWidth="2"
          fill="none"
        />
        <circle cx="20" cy={startY} r="3" fill="#3b82f6" />
        <circle cx="180" cy={endY} r="3" fill="#3b82f6" />
        <text x="10" y={startY - 5} fontSize="12" fill="#666">{before}</text>
        <text x="185" y={endY - 5} fontSize="12" fill="#666">{after}</text>
      </svg>
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const auriQuickReplies = [
    "Hur trappar jag nästa steg?",
    "Vad gör jag om rädslan inte går ned?"
  ];

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{plan.name}</h1>
        <p className="text-muted-foreground">{plan.situation}</p>
        
        <div className="flex flex-wrap gap-2 mt-4">
          {auriQuickReplies.map((reply, i) => (
            <Button 
              key={i}
              variant="outline" 
              size="sm"
              onClick={() => navigate('/chat', { state: { prefill: reply } })}
            >
              {reply}
            </Button>
          ))}
        </div>
      </div>

      {!currentSession ? (
        <Card>
          <CardHeader>
            <CardTitle>Välj ett steg att öva</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {plan.steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedStepId === step.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedStepId(step.id)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">Steg {index + 1}: {step.label}</div>
                    </div>
                    <Badge variant="outline">
                      {step.difficulty}/10
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            
            {selectedStepId && (
              <div className="space-y-4 pt-4 border-t">
                <div>
                  <Label>{t('beforeSUDS')}</Label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={beforeSUDS}
                      onChange={(e) => setBeforeSUDS(parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="w-8 text-center">{beforeSUDS}</span>
                  </div>
                </div>
                
                <Button onClick={handleStartSession} className="w-full">
                  <Play className="w-4 h-4 mr-2" />
                  {t('startSession')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Session pågår
                <div className="text-2xl font-mono">
                  {formatTime(timer)}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="text-lg mb-4">
                  {plan.steps.find(s => s.id === selectedStepId)?.label}
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                  Före-intensitet: {beforeSUDS}/10
                </div>
                
                <Button 
                  onClick={() => setIsRunning(!isRunning)}
                  variant={isRunning ? "destructive" : "default"}
                  size="lg"
                >
                  {isRunning ? <Square className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  {isRunning ? 'Pausa' : 'Fortsätt'}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Avsluta session</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>{t('afterSUDS')}</Label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={afterSUDS}
                    onChange={(e) => setAfterSUDS(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="w-8 text-center">{afterSUDS}</span>
                </div>
              </div>
              
              <div>
                <Label>{t('notes')}</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Hur gick det? Vad lärde du dig?"
                  rows={3}
                />
              </div>
              
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-2">{t('curve')}</div>
                {renderCurve(beforeSUDS, afterSUDS)}
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleEndSession} className="flex-1">
                  <Square className="w-4 h-4 mr-2" />
                  Avsluta
                </Button>
                <Button onClick={handleExportPDF} variant="outline">
                  <Download className="w-4 h-4" />
                </Button>
                <Button onClick={handleShare} variant="outline">
                  <Share className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ExposureRunPage;