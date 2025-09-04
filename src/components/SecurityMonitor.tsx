import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { logSecurityEvent } from '@/utils/security';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SecurityAlert {
  id: string;
  type: 'session_anomaly' | 'suspicious_activity' | 'rate_limit' | 'data_breach';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  dismissed: boolean;
}

export const SecurityMonitor: React.FC = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [sessionStart] = useState(Date.now());

  useEffect(() => {
    if (!user || !isMonitoring) return;

    let inactivityTimer: NodeJS.Timeout;
    let activityCount = 0;
    const maxInactivity = 30 * 60 * 1000; // 30 minutes

    // Monitor user activity
    const trackActivity = () => {
      activityCount++;
      clearTimeout(inactivityTimer);
      
      inactivityTimer = setTimeout(() => {
        addAlert({
          type: 'session_anomaly',
          message: 'Extended inactivity detected. Please verify your session.',
          severity: 'medium'
        });
      }, maxInactivity);
    };

    // Monitor suspicious patterns
    const monitorSuspiciousActivity = () => {
      const sessionDuration = Date.now() - sessionStart;
      const activityRate = activityCount / (sessionDuration / 1000 / 60); // actions per minute

      // Unusually high activity rate
      if (activityRate > 20) {
        addAlert({
          type: 'suspicious_activity',
          message: 'Unusually high activity detected. Security scan in progress.',
          severity: 'high'
        });
        
        logSecurityEvent('high_activity_rate', 'high', {
          activity_rate: activityRate,
          session_duration: sessionDuration,
          activity_count: activityCount
        }, 70);
      }
    };

    // Security event listeners
    const events = ['click', 'keydown', 'scroll', 'mousemove'];
    events.forEach(event => {
      document.addEventListener(event, trackActivity, { passive: true });
    });

    // Monitor for suspicious activity every 5 minutes
    const suspiciousActivityInterval = setInterval(monitorSuspiciousActivity, 5 * 60 * 1000);

    // Monitor for console access (potential debugging/hacking attempts)
    const consoleWarn = console.warn;
    console.warn = (...args) => {
      if (args.some(arg => typeof arg === 'string' && arg.includes('DevTools'))) {
        addAlert({
          type: 'suspicious_activity',
          message: 'Developer tools detected. Monitoring session for security.',
          severity: 'medium'
        });
      }
      consoleWarn.apply(console, args);
    };

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, trackActivity);
      });
      clearTimeout(inactivityTimer);
      clearInterval(suspiciousActivityInterval);
      console.warn = consoleWarn;
    };
  }, [user, isMonitoring, sessionStart]);

  const addAlert = (alertData: Omit<SecurityAlert, 'id' | 'timestamp' | 'dismissed'>) => {
    const newAlert: SecurityAlert = {
      ...alertData,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      dismissed: false
    };

    setAlerts(prev => [newAlert, ...prev.slice(0, 4)]); // Keep only latest 5 alerts
  };

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, dismissed: true } : alert
    ));
  };

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
    logSecurityEvent('security_monitoring_toggled', 'low', {
      monitoring_enabled: !isMonitoring
    }, 20);
  };

  const getAlertIcon = (severity: SecurityAlert['severity']) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return <Shield className="h-4 w-4 text-warning" />;
    }
  };

  const getAlertVariant = (severity: SecurityAlert['severity']) => {
    return severity === 'critical' || severity === 'high' ? 'destructive' : 'default';
  };

  if (!user) return null;

  const activeAlerts = alerts.filter(alert => !alert.dismissed);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {/* Monitoring Status Indicator */}
      <div className="flex items-center justify-between bg-background/90 backdrop-blur-sm border rounded-lg px-3 py-2">
        <div className="flex items-center gap-2 text-sm">
          <Shield className="h-4 w-4 text-primary" />
          <span>Security Monitor</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleMonitoring}
          className="h-6 w-6 p-0"
        >
          {isMonitoring ? (
            <Eye className="h-3 w-3" />
          ) : (
            <EyeOff className="h-3 w-3" />
          )}
        </Button>
      </div>

      {/* Security Alerts */}
      {activeAlerts.map(alert => (
        <Alert
          key={alert.id}
          variant={getAlertVariant(alert.severity)}
          className="bg-background/90 backdrop-blur-sm"
        >
          <div className="flex items-start justify-between">
            <div className="flex gap-2">
              {getAlertIcon(alert.severity)}
              <AlertDescription className="text-sm">
                {alert.message}
              </AlertDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dismissAlert(alert.id)}
              className="h-6 w-6 p-0 ml-2"
            >
              ×
            </Button>
          </div>
        </Alert>
      ))}
    </div>
  );
};