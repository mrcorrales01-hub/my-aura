import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Eye, Lock, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SecurityEvent {
  id: string;
  event_type: string;
  severity_level: string;
  risk_score: number;
  event_details: any;
  created_at: string;
  user_id: string;
}

interface SecurityMetrics {
  totalEvents: number;
  highRiskEvents: number;
  crisisDetections: number;
  dataAccessAttempts: number;
}

export const SecurityMonitoringDashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalEvents: 0,
    highRiskEvents: 0,
    crisisDetections: 0,
    dataAccessAttempts: 0
  });
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      checkAdminStatus();
      loadSecurityData();
    }
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) return;
    
    try {
      // Use security definer function instead of direct table query
      const { data, error } = await supabase.rpc('is_user_admin');
        
      setIsAdmin(!!data && !error);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  const loadSecurityData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load recent security events (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: securityEvents, error } = await supabase
        .from('security_events')
        .select('*')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setEvents(securityEvents || []);

      // Calculate metrics
      const totalEvents = securityEvents?.length || 0;
      const highRiskEvents = securityEvents?.filter(e => e.risk_score > 70).length || 0;
      const crisisDetections = securityEvents?.filter(e => e.event_type === 'crisis_content_detected').length || 0;
      const dataAccessAttempts = securityEvents?.filter(e => e.event_type.includes('data_access')).length || 0;

      setMetrics({
        totalEvents,
        highRiskEvents,
        crisisDetections,
        dataAccessAttempts
      });

    } catch (error) {
      console.error('Error loading security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'outline';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 60) return 'text-orange-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert className="max-w-md">
          <Lock className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access the security monitoring dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Security Monitoring</h1>
          <p className="text-muted-foreground">Monitor security events and system health</p>
        </div>
        <Button onClick={loadSecurityData} variant="outline" size="sm">
          <Activity className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Security Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalEvents}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">High Risk Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.highRiskEvents}</div>
            <p className="text-xs text-muted-foreground">Risk score &gt; 70</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Crisis Detections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics.crisisDetections}</div>
            <p className="text-xs text-muted-foreground">Crisis content flagged</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Data Access</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.dataAccessAttempts}</div>
            <p className="text-xs text-muted-foreground">Sensitive data accessed</p>
          </CardContent>
        </Card>
      </div>

      {/* Security Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Recent Security Events
          </CardTitle>
          <CardDescription>
            Latest security events and alerts from the past 7 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No security events in the last 7 days</p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.slice(0, 10).map((event) => (
                <div key={event.id} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={getSeverityColor(event.severity_level)}>
                        {event.severity_level}
                      </Badge>
                      <span className="text-sm font-medium">
                        {event.event_type.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      <span className={`text-sm font-mono ${getRiskColor(event.risk_score)}`}>
                        Risk: {event.risk_score}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {event.event_details?.context || 'Security event detected'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.created_at).toLocaleString()}
                    </p>
                  </div>
                  
                  {event.event_type === 'crisis_content_detected' && (
                    <AlertTriangle className="h-5 w-5 text-red-500 ml-4" />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};