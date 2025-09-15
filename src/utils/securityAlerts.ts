// Security alert utilities for enhanced security monitoring
import { supabase } from '@/integrations/supabase/client';

export interface SecurityAlertConfig {
  enableRealTimeAlerts: boolean;
  alertThresholds: {
    highRisk: number;
    critical: number;
  };
  notificationChannels: string[];
}

export const defaultSecurityConfig: SecurityAlertConfig = {
  enableRealTimeAlerts: true,
  alertThresholds: {
    highRisk: 70,
    critical: 90
  },
  notificationChannels: ['in-app', 'console']
};

export const checkSecurityCompliance = async (): Promise<{
  score: number;
  issues: string[];
  recommendations: string[];
}> => {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  try {
    // Check password security configuration
    const { data: passwordConfig } = await supabase.rpc('check_password_security_config');
    if (passwordConfig && typeof passwordConfig === 'object' && 'required_action' in passwordConfig) {
      issues.push('Password leak protection not enabled');
      recommendations.push('Enable password leak protection in Supabase Auth settings');
      score -= 20;
    }

    // Check recent security events
    const { data: recentEvents } = await supabase
      .from('security_events')
      .select('event_type, risk_score, created_at')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    if (recentEvents && recentEvents.length > 0) {
      const highRiskCount = recentEvents.filter(e => e.risk_score > 70).length;
      if (highRiskCount > 3) {
        issues.push(`${highRiskCount} high-risk security events in last 24h`);
        recommendations.push('Review security event logs and investigate patterns');
        score -= 15;
      }
    }

  } catch (error) {
    console.error('Security compliance check failed:', error);
    issues.push('Unable to perform complete security check');
    score -= 10;
  }

  return {
    score: Math.max(score, 0),
    issues,
    recommendations
  };
};

export const getSecurityScore = async (): Promise<number> => {
  const { score } = await checkSecurityCompliance();
  return score;
};

export const formatSecurityAlert = (alert: any) => {
  const severityColor = {
    low: '#22c55e',
    medium: '#f59e0b', 
    high: '#ef4444',
    critical: '#dc2626'
  };

  return {
    ...alert,
    color: severityColor[alert.severity as keyof typeof severityColor] || '#6b7280',
    priority: alert.severity === 'critical' ? 1 : alert.severity === 'high' ? 2 : 3
  };
};