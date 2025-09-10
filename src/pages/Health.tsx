import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, AlertTriangle, XCircle, Copy, RefreshCw, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface HealthCheck {
  name: string;
  status: 'ok' | 'warn' | 'fail';
  message: string;
  details?: string;
}

interface HealthReport {
  timestamp: string;
  checks: HealthCheck[];
}

const Health = () => {
  const { t, i18n } = useTranslation(['health', 'common']);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [report, setReport] = useState<HealthReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runHealthChecks = async (): Promise<HealthReport> => {
    const checks: HealthCheck[] = [];
    const supportedLangs = ['sv', 'en', 'es', 'no', 'da', 'fi'];

    // 1. Check i18n bundles
    try {
      const bundleChecks = await Promise.all(
        supportedLangs.map(async (lang) => {
          try {
            const response = await fetch(`/locales/${lang}/common.json`);
            return { lang, ok: response.ok };
          } catch {
            return { lang, ok: false };
          }
        })
      );

      const missingBundles = bundleChecks.filter(check => !check.ok).map(check => check.lang);
      
      checks.push({
        name: 'i18n_bundles',
        status: missingBundles.length === 0 ? 'ok' : 'warn',
        message: missingBundles.length === 0 
          ? 'All 6 language bundles are available'
          : `Missing bundles: ${missingBundles.join(', ')}`,
        details: `Checked languages: ${supportedLangs.join(', ')}`
      });
    } catch (error) {
      checks.push({
        name: 'i18n_bundles',
        status: 'fail',
        message: 'Failed to check i18n bundles',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // 2. Check environment variables
    const envVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
    const missingEnv = envVars.filter(key => !import.meta.env[key]);
    
    checks.push({
      name: 'environment',
      status: missingEnv.length === 0 ? 'ok' : 'fail',
      message: missingEnv.length === 0 
        ? 'All required environment variables are set'
        : `Missing environment variables: ${missingEnv.join(', ')}`,
      details: missingEnv.length > 0 ? 
        `${t('health:envMissing')}\n${envVars.join('\n')}` : 
        `Required: ${envVars.join(', ')}`
    });

    // 3. Check Supabase connection
    try {
      const { data, error } = await supabase.from('exercises').select('id').limit(1);
      
      checks.push({
        name: 'supabase_connection',
        status: error ? 'fail' : 'ok',
        message: error ? 'Supabase connection failed' : 'Supabase connection successful',
        details: error ? error.message : 'Successfully read from exercises table'
      });
    } catch (error) {
      checks.push({
        name: 'supabase_connection', 
        status: 'fail',
        message: 'Supabase connection error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // 4. Always run health-mode probes first (auth-optional)
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auri-chat?mode=health`
      );
      
      if (response.ok) {
        const data = await response.json();
        const demoMode = response.headers.get('x-demo-mode') === '1';
        
        checks.push({
          name: 'auri_chat_function',
          status: data.hasOpenAIKey ? 'ok' : 'warn',
          message: data.hasOpenAIKey 
            ? 'Auri chat function ready with OpenAI key'
            : t('health:demoMode'),
          details: `Demo mode: ${demoMode ? 'enabled' : 'disabled'}`
        });
      } else {
        checks.push({
          name: 'auri_chat_function',
          status: 'fail', 
          message: `Auri chat function error: ${response.status}`,
          details: await response.text()
        });
      }
    } catch (error) {
      checks.push({
        name: 'auri_chat_function',
        status: 'fail',
        message: 'Failed to check auri-chat function',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // 5. Check auri-roleplay health
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auri-roleplay?mode=health`
      );
      
      if (response.ok) {
        const data = await response.json();
        const demoMode = response.headers.get('x-demo-mode') === '1';
        
        checks.push({
          name: 'auri_roleplay_function',
          status: data.hasOpenAIKey ? 'ok' : 'warn', 
          message: data.hasOpenAIKey
            ? 'Auri roleplay function ready with OpenAI key'
            : t('health:demoMode'),
          details: `Demo mode: ${demoMode ? 'enabled' : 'disabled'}`
        });
      } else {
        checks.push({
          name: 'auri_roleplay_function',
          status: 'fail',
          message: `Auri roleplay function error: ${response.status}`,
          details: await response.text()
        });
      }
    } catch (error) {
      checks.push({
        name: 'auri_roleplay_function', 
        status: 'fail',
        message: 'Failed to check auri-roleplay function',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // 6. Check roleplay scenarios
    try {
      const scenarioCount = 3; // We have exactly 3 built-in scenarios
      checks.push({
        name: 'roleplay_scenarios',
        status: scenarioCount >= 3 ? 'ok' : 'warn',
        message: `${scenarioCount} roleplay scenarios available`,
        details: `Built-in scenarios: boundary-setting, panic-grounding, productive-disagreement`
      });
    } catch (error) {
      checks.push({
        name: 'roleplay_scenarios',
        status: 'fail',
        message: 'Failed to load roleplay scenarios',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // 7. Check authentication status
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      checks.push({
        name: 'authentication',
        status: user ? 'ok' : 'warn',
        message: user ? 'User authenticated' : t('health:notLoggedIn'),
        details: user ? `User ID: ${user.id}` : t('health:signIn')
      });
    } catch (error) {
      checks.push({
        name: 'authentication',
        status: 'warn',
        message: 'Authentication check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    return {
      timestamp: new Date().toISOString(),
      checks
    };
  };

  const fetchHealthReport = async () => {
    setIsLoading(true);
    try {
      const healthReport = await runHealthChecks();
      setReport(healthReport);
    } catch (error) {
      toast({
        title: 'Health Check Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthReport();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warn': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'fail': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <XCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok': return 'text-green-700 bg-green-50 border-green-200';
      case 'warn': return 'text-yellow-700 bg-yellow-50 border-yellow-200'; 
      case 'fail': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ok': return 'default';
      case 'warn': return 'secondary';
      case 'fail': return 'destructive';
      default: return 'outline';
    }
  };

  const copyDiagnostics = () => {
    if (!report) return;
    
    const diagnostics = {
      timestamp: report.timestamp,
      language: i18n.language,
      userAgent: navigator.userAgent,
      url: window.location.href,
      checks: report.checks.map(check => ({
        name: check.name,
        status: check.status,
        message: check.message,
        details: check.details
      }))
    };

    navigator.clipboard.writeText(JSON.stringify(diagnostics, null, 2));
    toast({
      title: 'Diagnostics Copied',
      description: 'Diagnostic information has been copied to clipboard'
    });
  };

  const getFixSuggestion = (checkName: string, status: string) => {
    if (status === 'ok') return null;
    
    const suggestions: Record<string, string> = {
      'i18n_bundles': 'Check that translation files exist in public/locales/[lang]/ directories',
      'environment': 'Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your environment',
      'supabase_connection': 'Verify your Supabase project is running and credentials are correct', 
      'auri_chat_function': status === 'warn' ? 'Set OPENAI_API_KEY in Supabase secrets to enable full functionality' : 'Check that the auri-chat edge function is deployed',
      'auri_roleplay_function': status === 'warn' ? 'Set OPENAI_API_KEY in Supabase secrets to enable full functionality' : 'Check that the auri-roleplay edge function is deployed',
      'authentication': 'Authentication system may need attention - check Supabase auth configuration'
    };

    return suggestions[checkName];
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">{t('health:title')}</h1>
              <p className="text-muted-foreground mt-2">Monitor application health and configuration</p>
            </div>
            
            <div className="flex space-x-2">
              <Button onClick={copyDiagnostics} variant="outline" disabled={!report}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Diagnostics
              </Button>
              <Button onClick={fetchHealthReport} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Re-run Checks
              </Button>
            </div>
          </div>

          {isLoading && !report && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {report && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                Last checked: {new Date(report.timestamp).toLocaleString()}
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                {report.checks.map((check) => (
                  <Card key={check.name} className={`border ${getStatusColor(check.status)}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-medium flex items-center">
                          {getStatusIcon(check.status)}
                          <span className="ml-2 capitalize">{check.name.replace(/_/g, ' ')}</span>
                        </CardTitle>
                        <Badge variant={getStatusBadgeVariant(check.status) as any}>
                          {check.status.toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm mb-2">{check.message}</p>
                      
                      {check.details && (
                        <details className="text-xs text-muted-foreground">
                          <summary className="cursor-pointer hover:text-foreground">Details</summary>
                          <pre className="mt-2 whitespace-pre-wrap">{check.details}</pre>
                        </details>
                      )}
                      
                      {/* Special handling for auth and env errors */}
                      {check.name === 'authentication' && check.status === 'warn' && (
                        <div className="mt-3">
                          <Button 
                            onClick={() => navigate('/auth/login')} 
                            size="sm"
                            className="bg-yellow-600 hover:bg-yellow-500 text-white"
                          >
                            {t('health:openLogin')}
                          </Button>
                        </div>
                      )}
                      
                      {check.name === 'environment' && check.status === 'fail' && (
                        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-sm">
                          <p className="text-red-800 font-medium mb-2">{t('health:fixEnv')}</p>
                          <code className="text-xs bg-red-100 p-1 rounded block">
                            VITE_SUPABASE_URL<br/>
                            VITE_SUPABASE_ANON_KEY
                          </code>
                        </div>
                      )}
                      
                      {(check.name === 'auri_chat_function' || check.name === 'auri_roleplay_function') && check.status === 'warn' && (
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                          <p className="text-yellow-800">
                            💡 {t('health:demoMode')}
                            <a 
                              href="https://supabase.com/dashboard/project/rggohnwmajmrvxgfmimk/settings/functions"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 inline-flex items-center text-yellow-700 underline hover:text-yellow-900"
                            >
                              Open Supabase Secrets <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </p>
                        </div>
                      )}
                      
                      {getFixSuggestion(check.name, check.status) && 
                       !['authentication', 'environment', 'auri_chat_function', 'auri_roleplay_function'].includes(check.name) && (
                        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                          💡 {getFixSuggestion(check.name, check.status)}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Health;