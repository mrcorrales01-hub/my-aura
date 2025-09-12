import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  AlertTriangle, 
  ArrowLeft, 
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Phone
} from 'lucide-react';
import { TriageResult } from '@/features/crisis/types';
import { saveTriage } from '@/features/crisis/store';

const questions = [
  'dangerNow',
  'havePlan', 
  'accessMeans',
  'underInfluence',
  'alone'
] as const;

export default function CrisisTriagePage() {
  const { t } = useTranslation('crisis');
  const navigate = useNavigate();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [result, setResult] = useState<TriageResult | null>(null);

  const handleAnswer = (answer: boolean) => {
    const questionKey = questions[currentQuestion];
    const newAnswers = { ...answers, [questionKey]: answer };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate result
      const triageResult = calculateRisk(newAnswers);
      setResult(triageResult);
      saveTriage(triageResult);
    }
  };

  const calculateRisk = (answerData: Record<string, boolean>): TriageResult => {
    const { dangerNow, havePlan, accessMeans, underInfluence, alone } = answerData;
    
    let level: 'red' | 'amber' | 'green' = 'green';
    
    // Red level - highest risk
    if (dangerNow || havePlan || (accessMeans && (underInfluence || alone))) {
      level = 'red';
    }
    // Amber level - moderate risk  
    else if (accessMeans || underInfluence || alone) {
      level = 'amber';
    }
    
    return {
      ts: new Date().toISOString(),
      answers: {
        dangerNow: dangerNow || false,
        havePlan: havePlan || false,
        accessMeans: accessMeans || false,
        underInfluence: underInfluence || false,
        alone: alone || false
      },
      level
    };
  };

  const goBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else {
      navigate('/crisis');
    }
  };

  const getResultContent = () => {
    if (!result) return null;

    const { level } = result;
    
    const config = {
      red: {
        icon: <AlertTriangle className="h-8 w-8 text-red-600" />,
        title: t('high'),
        message: t('redBanner'),
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800',
        buttons: [
          { 
            label: t('callNow'), 
            action: () => window.open('tel:112', '_self'),
            variant: 'default' as const,
            className: 'bg-red-600 hover:bg-red-700'
          },
          { 
            label: t('call1177'), 
            action: () => window.open('tel:1177', '_self'),
            variant: 'outline' as const
          },
          { 
            label: t('resources'), 
            action: () => navigate('/crisis/help'),
            variant: 'outline' as const
          }
        ],
        auriPrompt: 'Hjälp mig hålla mig säker just nu'
      },
      amber: {
        icon: <AlertCircle className="h-8 w-8 text-amber-600" />,
        title: t('moderate'),
        message: t('amberBanner'),
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        textColor: 'text-amber-800',
        buttons: [
          { 
            label: t('plan'), 
            action: () => navigate('/crisis/plan'),
            variant: 'default' as const
          },
          { 
            label: t('resources'), 
            action: () => navigate('/crisis/help'),
            variant: 'outline' as const
          }
        ],
        auriPrompt: 'Ge 3 steg för att öka min trygghet idag'
      },
      green: {
        icon: <CheckCircle className="h-8 w-8 text-green-600" />,
        title: t('low'),
        message: t('greenBanner'),
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-800',
        buttons: [
          { 
            label: t('createPlan'), 
            action: () => navigate('/crisis/plan'),
            variant: 'default' as const
          }
        ],
        auriPrompt: 'Hur bygger jag en buffertplan den här veckan?'
      }
    };

    const { icon, title, message, bgColor, borderColor, textColor, buttons, auriPrompt } = config[level];

    return (
      <div className="space-y-6">
        <Card className={`${bgColor} ${borderColor}`}>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                {icon}
              </div>
              
              <div>
                <h3 className={`text-lg font-semibold ${textColor}`}>
                  {t('riskLevel')}: {title}
                </h3>
                <p className={`text-sm mt-2 ${textColor}`}>
                  {message}
                </p>
              </div>
              
              <div className="space-y-2">
                {buttons.map((button, index) => (
                  <Button
                    key={index}
                    onClick={button.action}
                    variant={button.variant}
                    className={`w-full ${button.className || ''}`}
                    size="lg"
                  >
                    {button.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Auri Quick Prompt */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <h4 className="font-medium">Fråga Auri</h4>
              <Button
                variant="outline"
                className="w-full justify-start text-left h-auto py-3"
                onClick={() => {
                  // Navigate to chat with pre-filled prompt
                  navigate(`/chat?prompt=${encodeURIComponent(auriPrompt)}`);
                }}
              >
                "{auriPrompt}"
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (result) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto space-y-6">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigate('/crisis')}
                variant="outline"
                size="sm"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-xl font-bold">Resultat</h1>
            </div>

            {getResultContent()}
            
            <p className="text-xs text-muted-foreground text-center">
              {t('disclaimer')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center space-x-4">
            <Button
              onClick={goBack}
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">{t('triageQuestions')}</h1>
              <p className="text-sm text-muted-foreground">
                Fråga {currentQuestion + 1} av {questions.length}
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t(questions[currentQuestion])}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <RadioGroup>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => handleAnswer(true)}
                        className="flex-1 h-12"
                        variant="outline"
                      >
                        {t('yes')}
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => handleAnswer(false)}
                        className="flex-1 h-12"
                        variant="outline"
                      >
                        {t('no')}
                      </Button>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground text-center">
            {t('disclaimer')}
          </p>
        </div>
      </div>
    </div>
  );
}