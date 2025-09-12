import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Play, Edit, Trash2, TrendingUp } from 'lucide-react';
import { listPlans, deletePlan, getSessionsForPlan } from '@/features/exposure/store';

const ExposureHubPage = () => {
  const { t } = useTranslation('exposure');
  const navigate = useNavigate();
  const plans = listPlans();

  const calculateTrend = (planId: string) => {
    const sessions = getSessionsForPlan(planId).filter(s => s.after !== undefined);
    if (sessions.length < 3) return null;
    
    const recent = sessions.slice(-3);
    const improvements = recent.filter(s => (s.before - (s.after || 0)) >= 2);
    return improvements.length >= 2 ? 'improving' : null;
  };

  const auriQuickReplies = [
    "Hjälp mig välja lätt första situation",
    "Hur bryter jag undvikande?"
  ];

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
        
        <div className="flex flex-wrap gap-2 mt-4">
          {auriQuickReplies.map((reply, i) => (
            <Button 
              key={i}
              variant="outline" 
              size="sm"
              onClick={() => navigate('/chat', { state: { prefill: reply } })}
            >
              {t('askAuri')}: {reply}
            </Button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <Button 
          onClick={() => navigate('/exposure/new')}
          className="w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('new')}
        </Button>
      </div>

      {plans.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">
              Inga stegar skapade ännu. Skapa din första exponeringsstege för att komma igång.
            </p>
            <Button onClick={() => navigate('/exposure/new')}>
              <Plus className="w-4 h-4 mr-2" />
              {t('new')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {plans.map(plan => {
            const trend = calculateTrend(plan.id);
            const sessions = getSessionsForPlan(plan.id);
            
            return (
              <Card key={plan.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {plan.name}
                        <Badge variant="outline">
                          {plan.steps.length} {t('steps').toLowerCase()}
                        </Badge>
                        {trend && (
                          <Badge variant="outline" className="text-green-600 border-green-200">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            SUDS minskar
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{plan.situation}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigate(`/exposure/run/${plan.id}`)}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        {t('run')}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigate(`/exposure/new?edit=${plan.id}`)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          if (confirm('Ta bort denna stege?')) {
                            deletePlan(plan.id);
                            window.location.reload();
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                {sessions.length > 0 && (
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      {sessions.length} sessioner genomförda
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <div className="mt-8 p-4 bg-amber-50 rounded-lg border border-amber-200">
        <p className="text-sm text-amber-800">
          <strong>Observera:</strong> {t('disclaimer')}
        </p>
      </div>
    </div>
  );
};

export default ExposureHubPage;