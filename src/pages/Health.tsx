import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { checkSecurityCompliance } from '@/utils/securityAlerts';
import { getPlanLocal, getUsageToday } from '@/features/subscription/plan';

type HealthStatus = 'ok' | 'warn' | 'fail';

interface HealthCheck {
  name: string;
  status: HealthStatus;
  message: string;
  details?: string;
}

const Health = () => {
  const { t, i18n } = useTranslation(['common', 'health']);
  const [checks, setChecks] = useState<HealthCheck[]>([]);
  const [loading, setLoading] = useState(false);

  const runHealthChecks = async () => {
    setLoading(true);
    const results: HealthCheck[] = [];

    // Check i18n bundles
    try {
      const hasBasicTranslations = i18n.exists('common:appName') && i18n.exists('nav:home');
      results.push({
        name: 'I18n bundles',
        status: hasBasicTranslations ? 'ok' : 'warn',
        message: hasBasicTranslations ? 'All language bundles loaded' : 'Some translations missing',
        details: `Current language: ${i18n.language}, Loaded namespaces: ${Array.isArray(i18n.options.ns) ? i18n.options.ns.join(', ') : i18n.options.ns || 'none'}`
      });
    } catch (error: any) {
      results.push({
        name: 'I18n bundles',
        status: 'fail',
        message: 'Translation system failed',
        details: error.message
      });
    }

    // Check environment variables
    const hasSupabaseUrl = !!import.meta.env.VITE_SUPABASE_URL;
    const hasSupabaseKey = !!import.meta.env.VITE_SUPABASE_ANON_KEY;
    results.push({
      name: 'Environment',
      status: hasSupabaseUrl && hasSupabaseKey ? 'ok' : 'fail',
      message: hasSupabaseUrl && hasSupabaseKey ? 'All required env vars present' : 'Missing environment variables',
      details: `SUPABASE_URL: ${hasSupabaseUrl ? '✓' : '✗'}, SUPABASE_ANON_KEY: ${hasSupabaseKey ? '✓' : '✗'}`
    });

    // Check Supabase connectivity
    try {
      const { data, error } = await supabase.from('roleplay_scripts').select('count').limit(1);
      results.push({
        name: 'Supabase connectivity',
        status: error ? 'fail' : 'ok',
        message: error ? 'Database connection failed' : 'Database accessible',
        details: error?.message || 'Connected successfully'
      });
    } catch (error: any) {
      results.push({
        name: 'Supabase connectivity',
        status: 'fail',
        message: 'Database connection error',
        details: error.message
      });
    }

    // Check Auri chat auth header
    try {
      const { data: { session } } = await supabase.auth.getSession();
      results.push({
        name: 'Auri chat auth',
        status: session ? 'ok' : 'warn',
        message: session ? 'Auth header available' : 'No active session',
        details: session ? 'User authenticated' : 'Sign in required for full chat functionality'
      });
    } catch (error: any) {
      results.push({
        name: 'Auri chat auth',
        status: 'fail',
        message: 'Auth check failed',
        details: error.message
      });
    }

    // Check subscription check status
    const subsRequired = import.meta.env.VITE_SUBS_REQUIRED === 'true';
    results.push({
      name: 'Subscription check',
      status: 'ok',
      message: subsRequired ? 'Subscription checks active' : 'Bypassed in dev (VITE_SUBS_REQUIRED=false)',
      details: `Development mode: ${!subsRequired ? 'enabled' : 'disabled'}`
    });

    // Check PWA
    const hasSW = !!navigator.serviceWorker;
    const hasManifest = document.querySelector('link[rel="manifest"]');
    results.push({
      name: 'PWA',
      status: hasSW && hasManifest ? 'ok' : 'warn',
      message: hasSW && hasManifest ? 'PWA ready' : 'PWA partially configured',
      details: `Service Worker: ${hasSW ? '✓' : '✗'}, Manifest: ${hasManifest ? '✓' : '✗'}`
    });

    // Check reminders
    const hasNotifications = 'Notification' in window;
    const notifPermission = hasNotifications ? Notification.permission : 'unsupported';
    results.push({
      name: 'Reminders',
      status: hasNotifications && notifPermission === 'granted' ? 'ok' : hasNotifications ? 'warn' : 'fail',
      message: hasNotifications ? `Notifications ${notifPermission}` : 'Notifications unsupported',
      details: `Permission: ${notifPermission}`
    });

    // Check analytics
    const analyticsEnabled = import.meta.env.VITE_ANALYTICS_ENABLED === 'true';
    const hasPostHog = !!import.meta.env.VITE_POSTHOG_KEY;
    const hasSentry = !!import.meta.env.VITE_SENTRY_DSN;
    results.push({
      name: 'Analytics',
      status: analyticsEnabled ? (hasPostHog || hasSentry ? 'ok' : 'warn') : 'ok',
      message: analyticsEnabled ? 'Analytics enabled' : 'Analytics disabled',
      details: `PostHog: ${hasPostHog ? '✓' : '✗'}, Sentry: ${hasSentry ? '✓' : '✗'}`
    });

    // Check Auri meter
    try {
      const plan = getPlanLocal();
      const used = getUsageToday().auri || 0;
      results.push({
        name: 'Auri Meter',
        status: 'ok',
        message: `Plan: ${plan}`,
        details: `Usage today: ${used}`
      });
    } catch (error: any) {
      results.push({
        name: 'Auri Meter',
        status: 'warn',
        message: 'Usage tracking unavailable',
        details: error.message
      });
    }

    // Check security compliance
    try {
      const securityCheck = await checkSecurityCompliance();
      results.push({
        name: 'Security compliance',
        status: securityCheck.score >= 80 ? 'ok' : securityCheck.score >= 60 ? 'warn' : 'fail',
        message: `Security Score: ${securityCheck.score}/100`,
        details: securityCheck.issues.length > 0 ? `Issues: ${securityCheck.issues.join(', ')}` : 'All security checks passed'
      });
    } catch (error: any) {
      results.push({
        name: 'Security compliance',
        status: 'fail',
        message: 'Security check failed',
        details: error.message
      });
    }

    setChecks(results);
    setLoading(false);
  };

  useEffect(() => {
    runHealthChecks();
  }, []);

  const getStatusIcon = (status: HealthStatus) => {
    switch (status) {
      case 'ok': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warn': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'fail': return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusBadge = (status: HealthStatus) => {
    const variants = {
      ok: 'bg-green-100 text-green-800',
      warn: 'bg-yellow-100 text-yellow-800', 
      fail: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={`${variants[status]} border-0`}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const overallStatus = checks.some(c => c.status === 'fail') ? 'fail' : 
                       checks.some(c => c.status === 'warn') ? 'warn' : 'ok';

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">System Health</h1>
              <p className="text-muted-foreground">Monitor application status and connectivity</p>
            </div>
            <Button 
              onClick={runHealthChecks} 
              disabled={loading}
              variant="outline"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                {getStatusIcon(overallStatus)}
                <div>
                  <h3 className="font-semibold">Overall Status</h3>
                  <p className="text-sm text-muted-foreground">
                    {overallStatus === 'ok' && 'All systems operational'}
                    {overallStatus === 'warn' && 'Some issues detected'}
                    {overallStatus === 'fail' && 'Critical issues require attention'}
                  </p>
                </div>
                {getStatusBadge(overallStatus)}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {checks.map((check, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(check.status)}
                    <CardTitle className="text-lg">{check.name}</CardTitle>
                  </div>
                  {getStatusBadge(check.status)}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm mb-2">{check.message}</p>
                {check.details && (
                  <p className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
                    {check.details}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Health;