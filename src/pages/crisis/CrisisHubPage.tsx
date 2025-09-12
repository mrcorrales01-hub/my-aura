import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  Shield, 
  Phone, 
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { getTriage, getPlan } from '@/features/crisis/store';

export default function CrisisHubPage() {
  const { t } = useTranslation('crisis');
  const navigate = useNavigate();
  
  const triage = getTriage();
  const plan = getPlan();
  
  const getSeverityColor = (level: string) => {
    switch (level) {
      case 'red': return 'bg-red-100 text-red-800 border-red-200';
      case 'amber': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'green': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (level: string) => {
    switch (level) {
      case 'red': return <AlertTriangle className="h-4 w-4" />;
      case 'amber': return <AlertCircle className="h-4 w-4" />;
      case 'green': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getSeverityLabel = (level: string) => {
    switch (level) {
      case 'red': return t('high');
      case 'amber': return t('moderate');
      case 'green': return t('low');
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">{t('title')}</h1>
            <p className="text-muted-foreground">{t('subtitle')}</p>
          </div>

          {/* SOS Button */}
          <div className="flex justify-center">
            <Button
              onClick={() => navigate('/crisis/triage')}
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white min-w-[120px] h-12"
            >
              <AlertTriangle className="h-5 w-5 mr-2" />
              {t('sos')}
            </Button>
          </div>

          {/* Status Overview */}
          <div className="grid gap-4">
            {/* Triage Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5" />
                    <span>{t('triage')}</span>
                  </div>
                  {triage && (
                    <Badge className={getSeverityColor(triage.level)}>
                      <div className="flex items-center space-x-1">
                        {getSeverityIcon(triage.level)}
                        <span>{getSeverityLabel(triage.level)}</span>
                      </div>
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {triage ? (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t('lastTriage')}: {new Date(triage.ts).toLocaleString('sv-SE')}
                      </p>
                      <p className="text-sm">
                        {t('riskLevel')}: {getSeverityLabel(triage.level)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">{t('noTriage')}</p>
                  )}
                  
                  <Button
                    onClick={() => navigate('/crisis/triage')}
                    className="w-full"
                    variant={triage?.level === 'red' ? 'default' : 'outline'}
                  >
                    {t('triage')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Safety Plan Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>{t('plan')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {plan ? (
                    <div>
                      <p className="text-sm font-medium">{t('currentPlan')}</p>
                      <p className="text-sm text-muted-foreground">
                        {plan.name || t('planTitle')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Uppdaterad: {new Date(plan.updatedAt).toLocaleString('sv-SE')}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">{t('noPlan')}</p>
                  )}
                  
                  <Button
                    onClick={() => navigate('/crisis/plan')}
                    className="w-full"
                    variant="outline"
                  >
                    {plan ? t('editPlan') : t('createPlan')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Phone className="h-5 w-5" />
                  <span>{t('resources')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Hjälplinjer och stöd nära dig
                  </p>
                  
                  <Button
                    onClick={() => navigate('/crisis/help')}
                    className="w-full"
                    variant="outline"
                  >
                    {t('resources')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Emergency Actions */}
          {triage?.level === 'red' && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-red-800">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="font-medium">{t('redBanner')}</span>
                  </div>
                  
                  <div className="grid gap-2">
                    <Button
                      onClick={() => window.open('tel:112', '_self')}
                      className="bg-red-600 hover:bg-red-700 text-white w-full"
                    >
                      {t('callNow')}
                    </Button>
                    
                    <Button
                      onClick={() => navigate('/crisis/help')}
                      variant="outline"
                      className="w-full"
                    >
                      {t('resources')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground text-center">
            {t('disclaimer')}
          </p>
        </div>
      </div>
    </div>
  );
}