import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, XCircle, Copy, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { runHealthChecks, type HealthReport, type HealthCheck } from '@/features/health/api';

export default function Health() {
  const { t } = useTranslation('common');
  const { toast } = useToast();
  const [report, setReport] = useState<HealthReport | null>(null);
  const [loading, setLoading] = useState(true);

  const runChecks = async () => {
    setLoading(true);
    try {
      const newReport = await runHealthChecks();
      setReport(newReport);
    } catch (error) {
      toast({
        title: t('health.error'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runChecks();
  }, []);

  const getStatusIcon = (status: HealthCheck['status']) => {
    switch (status) {
      case 'OK':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'WARN':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'FAIL':
        return <XCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const getStatusColor = (status: HealthCheck['status']) => {
    switch (status) {
      case 'OK':
        return 'bg-green-50 border-green-200';
      case 'WARN':
        return 'bg-yellow-50 border-yellow-200';
      case 'FAIL':
        return 'bg-red-50 border-red-200';
    }
  };

  const getStatusBadgeVariant = (status: HealthCheck['status']) => {
    switch (status) {
      case 'OK':
        return 'default' as const;
      case 'WARN':
        return 'secondary' as const;
      case 'FAIL':
        return 'destructive' as const;
    }
  };

  const copyDiagnostics = () => {
    if (!report) return;
    
    const diagnostics = {
      timestamp: new Date().toISOString(),
      checks: Object.entries(report).map(([key, check]) => ({
        name: key,
        status: check.status,
        message: check.message,
        details: check.details
      }))
    };
    
    navigator.clipboard.writeText(JSON.stringify(diagnostics, null, 2));
    toast({
      title: t('health.diagnosticsCopied'),
      description: t('health.diagnosticsCopiedDesc'),
    });
  };

  const getFixSuggestion = (checkName: string, status: HealthCheck['status']) => {
    if (status === 'OK') return null;
    
    const suggestions: Record<string, string> = {
      i18n: t('health.fixI18n'),
      env: t('health.fixEnv'),
      supabase: t('health.fixSupabase'),
      auriChat: t('health.fixEdgeFunction'),
      auriRoleplay: t('health.fixEdgeFunction')
    };
    
    return suggestions[checkName];
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">{t('health.title')}</h1>
        <p className="text-muted-foreground">{t('health.description')}</p>
      </div>

      <div className="flex gap-4 mb-6">
        <Button onClick={runChecks} disabled={loading}>
          {loading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
          {t('health.runChecks')}
        </Button>
        
        {report && (
          <Button variant="outline" onClick={copyDiagnostics}>
            <Copy className="mr-2 h-4 w-4" />
            {t('health.copyDiagnostics')}
          </Button>
        )}
      </div>

      {loading && !report && (
        <div className="text-center py-8">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">{t('health.running')}</p>
        </div>
      )}

      {report && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(report).map(([key, check]) => (
            <Card key={key} className={`${getStatusColor(check.status)}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{t(`health.checks.${key}.title`)}</CardTitle>
                  {getStatusIcon(check.status)}
                </div>
                <CardDescription>
                  {t(`health.checks.${key}.description`)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusBadgeVariant(check.status)}>
                      {t(`health.status.${check.status.toLowerCase()}`)}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {check.message}
                  </p>
                  
                  {check.details && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                        {t('health.showDetails')}
                      </summary>
                      <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                        {JSON.stringify(check.details, null, 2)}
                      </pre>
                    </details>
                  )}
                  
                  {getFixSuggestion(key, check.status) && (
                    <div className="mt-3 p-2 bg-muted rounded">
                      <p className="text-xs font-medium text-muted-foreground">
                        {t('health.howToFix')}:
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {getFixSuggestion(key, check.status)}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}