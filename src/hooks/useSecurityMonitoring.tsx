import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useSecurityMonitoring = () => {
  const { user } = useAuth();

  const reportSuspiciousActivity = useCallback(async (
    eventType: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    details: Record<string, any> = {},
    riskScore: number = 50
  ) => {
    if (!user) return;

    try {
      await supabase.rpc('log_security_event_v2', {
        p_user_id: user.id,
        p_event_type: eventType,
        p_severity_level: severity,
        p_table_name: null,
        p_record_id: null,
        p_event_details: details,
        p_risk_score: riskScore
      });
    } catch (error) {
      console.error('Error reporting security event:', error);
    }
  }, [user]);

  const checkForSuspiciousPatterns = useCallback(async () => {
    if (!user) return;

    try {
      // Check recent high-risk events
      const { data: recentEvents } = await supabase
        .from('security_events')
        .select('event_type, risk_score, created_at')
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (recentEvents && recentEvents.length > 0) {
        const highRiskEvents = recentEvents.filter(event => event.risk_score > 70);
        const totalRiskScore = recentEvents.reduce((sum, event) => sum + event.risk_score, 0);
        const avgRiskScore = totalRiskScore / recentEvents.length;

        if (highRiskEvents.length > 3 || avgRiskScore > 60) {
          await reportSuspiciousActivity(
            'suspicious_activity_pattern_detected',
            'high',
            {
              high_risk_events_count: highRiskEvents.length,
              average_risk_score: avgRiskScore,
              total_events_24h: recentEvents.length
            },
            75
          );
        }
      }
    } catch (error) {
      console.error('Error checking suspicious patterns:', error);
    }
  }, [user, reportSuspiciousActivity]);

  const monitorContentAccess = useCallback(async (
    tableName: string,
    accessType: string,
    recordCount: number = 1
  ) => {
    if (!user) return;

    // Log content access for monitoring
    try {
      await supabase.rpc('log_content_access_attempt', {
        p_table_name: tableName,
        p_access_type: accessType,
        p_user_authenticated: true,
        p_context: 'client_monitoring'
      });

      // Check if this access pattern is suspicious
      if (recordCount > 50) {
        await reportSuspiciousActivity(
          'bulk_content_access_detected',
          'medium',
          {
            table_name: tableName,
            access_type: accessType,
            record_count: recordCount
          },
          60
        );
      }
    } catch (error) {
      console.error('Error monitoring content access:', error);
    }
  }, [user, reportSuspiciousActivity]);

  // Periodic security check
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      checkForSuspiciousPatterns();
    }, 10 * 60 * 1000); // Check every 10 minutes

    return () => clearInterval(interval);
  }, [user, checkForSuspiciousPatterns]);

  return {
    reportSuspiciousActivity,
    checkForSuspiciousPatterns,
    monitorContentAccess
  };
};