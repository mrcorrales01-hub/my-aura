import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Shield, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface SecurityAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  dismissed: boolean;
}

export function SecurityAlertSystem() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    loadSecurityAlerts();
    
    // Subscribe to real-time security events
    const subscription = supabase
      .channel('security-alerts')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'security_events',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        const newEvent = payload.new as any;
        if (newEvent.risk_score > 50) {
          const alert: SecurityAlert = {
            id: newEvent.id,
            type: newEvent.event_type,
            severity: newEvent.severity_level as SecurityAlert['severity'],
            message: getAlertMessage(newEvent.event_type, newEvent.event_details),
            timestamp: newEvent.created_at,
            dismissed: false
          };
          setAlerts(prev => [alert, ...prev].slice(0, 5)); // Keep only 5 most recent
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const loadSecurityAlerts = async () => {
    if (!user) return;

    try {
      const { data: events } = await supabase
        .from('security_events')
        .select('*')
        .eq('user_id', user.id)
        .gte('risk_score', 50)
        .order('created_at', { ascending: false })
        .limit(5);

      if (events) {
        const alertsData = events.map(event => ({
          id: event.id,
          type: event.event_type,
          severity: event.severity_level as SecurityAlert['severity'],
          message: getAlertMessage(event.event_type, event.event_details),
          timestamp: event.created_at,
          dismissed: false
        }));
        setAlerts(alertsData);
      }
    } catch (error) {
      console.error('Error loading security alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAlertMessage = (eventType: string, details: any): string => {
    switch (eventType) {
      case 'password_leak_detected':
        return 'Your password was found in a data breach. Please change it immediately.';
      case 'suspicious_login_detected':
        return 'Unusual login activity detected from a new location or device.';
      case 'critical_content_auto_blocked':
        return 'Content requiring immediate attention was automatically flagged.';
      case 'potential_brute_force_attack':
        return 'Multiple failed login attempts detected. Your account may be under attack.';
      case 'content_access_rate_limit_exceeded':
        return 'Unusual data access patterns detected. Activity has been temporarily limited.';
      default:
        return `Security event detected: ${eventType}`;
    }
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const getSeverityIcon = (severity: SecurityAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Shield className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityVariant = (severity: SecurityAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      default:
        return 'default';
    }
  };

  if (loading || alerts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md space-y-2">
      {alerts.map((alert) => (
        <Alert 
          key={alert.id} 
          variant={getSeverityVariant(alert.severity)}
          className="shadow-lg"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-2">
              {getSeverityIcon(alert.severity)}
              <div className="flex-1">
                <AlertDescription className="text-sm">
                  {alert.message}
                </AlertDescription>
                <div className="text-xs opacity-70 mt-1">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dismissAlert(alert.id)}
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          </div>
        </Alert>
      ))}
    </div>
  );
}