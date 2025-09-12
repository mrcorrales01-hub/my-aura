import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Moon, 
  Heart, 
  Brain, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  FileText,
  Share2
} from 'lucide-react';
import { getDisplayName } from '@/lib/profileName';
import { getLatest, upsert } from '@/features/visit/store';
import { scoreSleep, scoreGAD7, scorePHQ9, getOverallFlag } from '@/features/visit/scoring';
import { useNavigate } from 'react-router-dom';
import { VisitBundle } from '@/features/visit/types';

export default function VisitHubPage() {
  const { t } = useTranslation('visit');
  const { t: tHome } = useTranslation('home');
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const bundle = getLatest(user?.id);
  
  const getCompletionStatus = (section: 'sleep' | 'gad7' | 'phq9') => {
    if (!bundle || !bundle[section]) {
      return { status: 'notStarted', score: null, severity: null };
    }
    
    const data = bundle[section];
    let isComplete = false;
    let score = null;
    let severity = null;
    
    if (section === 'sleep' && data && !Array.isArray(data)) {
      const sleepData = data as any;
      isComplete = typeof sleepData.troubleFalling === 'number' && 
                   typeof sleepData.awakenings === 'number' &&
                   typeof sleepData.sleepHours === 'number';
      if (isComplete) {
        const result = scoreSleep(sleepData);
        score = result.score;
        severity = result.severity;
      }
    } else if (section === 'gad7' && Array.isArray(data) && data.length === 7) {
      isComplete = data.every(val => typeof val === 'number');
      if (isComplete) {
        const result = scoreGAD7(data as any);
        score = result.score;
        severity = result.severity;
      }
    } else if (section === 'phq9' && Array.isArray(data) && data.length === 9) {
      isComplete = data.every(val => typeof val === 'number');
      if (isComplete) {
        const result = scorePHQ9(data as any);
        score = result.score;
        severity = result.severity;
      }
    }
    
    return {
      status: isComplete ? 'completed' : 'inProgress',
      score,
      severity
    };
  };
  
  const sleepStatus = getCompletionStatus('sleep');
  const gad7Status = getCompletionStatus('gad7');
  const phq9Status = getCompletionStatus('phq9');
  
  const sections = [
    {
      id: 'sleep',
      title: t('sectionSleep'),
      icon: Moon,
      path: '/visit/sleep',
      status: sleepStatus
    },
    {
      id: 'anxiety',
      title: t('sectionAnxiety'),
      icon: Heart,
      path: '/visit/anxiety',
      status: gad7Status
    },
    {
      id: 'depression', 
      title: t('sectionDepression'),
      icon: Brain,
      path: '/visit/depression',
      status: phq9Status
    }
  ];
  
  const completedSections = sections.filter(s => s.status.status === 'completed').length;
  const totalSections = sections.length;
  
  const handleStartNew = () => {
    const newBundle: Partial<VisitBundle> = {
      lang: 'sv',
      name: getDisplayName(user?.user_metadata)
    };
    upsert(newBundle, user?.id);
    navigate('/visit/sleep');
  };

  const getSeverityColor = (severity: string | null) => {
    switch (severity) {
      case 'red': return 'text-red-600 bg-red-50 border-red-200';
      case 'amber': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'green': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string | null) => {
    switch (severity) {
      case 'red': return <AlertTriangle className="h-4 w-4" />;
      case 'amber': return <AlertTriangle className="h-4 w-4" />;
      case 'green': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">
              {t('title')}
            </h1>
            <p className="text-muted-foreground">
              {t('subtitle')}
            </p>
            {user && (
              <p className="text-sm text-muted-foreground">
                {tHome('greeting', { name: getDisplayName(user.user_metadata) })}
              </p>
            )}
          </div>

          {/* Progress Overview */}
          {bundle && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Framsteg</span>
                  <Badge variant="outline">
                    {completedSections}/{totalSections} slutförda
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(completedSections / totalSections) * 100}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Section Cards */}
          <div className="space-y-4">
            {sections.map((section) => (
              <Card key={section.id} className="transition-all hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <section.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{section.title}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge 
                            variant="outline"
                            className={`text-xs ${getSeverityColor(section.status.severity)}`}
                          >
                            <div className="flex items-center space-x-1">
                              {getSeverityIcon(section.status.severity)}
                              <span>
                                {section.status.status === 'completed' 
                                  ? `${t('completion.completed')} (${section.status.score})`
                                  : section.status.status === 'inProgress'
                                  ? t('completion.inProgress')
                                  : t('completion.notStarted')
                                }
                              </span>
                            </div>
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => navigate(section.path)}
                      size="sm"
                    >
                      {section.status.status === 'notStarted' ? t('start') : t('ctaOpen')}
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Actions */}
          <div className="space-y-4">
            {!bundle && (
              <Button onClick={handleStartNew} className="w-full" size="lg">
                <FileText className="h-4 w-4 mr-2" />
                {t('start')}
              </Button>
            )}

            {bundle && completedSections > 0 && (
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={() => navigate('/visit/summary')}
                  variant="outline"
                  className="w-full"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {t('exportPdf')}
                </Button>
                
                <Button 
                  onClick={() => navigate('/visit/summary')}
                  variant="outline"
                  className="w-full"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  {t('copyLink')}
                </Button>
              </div>
            )}
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