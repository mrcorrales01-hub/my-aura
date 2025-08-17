import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface EarlyWarningAlert {
  id: string;
  alertType: 'depression_risk' | 'burnout_risk' | 'crisis_risk' | 'anxiety_spike' | 'sleep_disruption';
  severityLevel: 'low' | 'medium' | 'high' | 'critical';
  contributingFactors: string[];
  aiReasoning: string;
  confidenceScore: number;
  status: 'active' | 'acknowledged' | 'resolved';
  recommendedActions: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface RiskFactors {
  moodDecline: boolean;
  sleepDisruption: boolean;
  activityDecrease: boolean;
  stressIncrease: boolean;
  socialWithdrawal: boolean;
  conversationPatterns: boolean;
}

interface SystemMetrics {
  activeAlerts: number;
  riskScore: number; // 0-100
  lastAssessment: Date;
  confidenceLevel: number;
}

export const useEarlyWarningSystem = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<EarlyWarningAlert[]>([]);
  const [riskFactors, setRiskFactors] = useState<RiskFactors>({
    moodDecline: false,
    sleepDisruption: false,
    activityDecrease: false,
    stressIncrease: false,
    socialWithdrawal: false,
    conversationPatterns: false,
  });
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    activeAlerts: 0,
    riskScore: 0,
    lastAssessment: new Date(),
    confidenceLevel: 0,
  });
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  // Fetch active alerts
  const fetchAlerts = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('early_warning_alerts')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['active', 'acknowledged'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      const alertsData: EarlyWarningAlert[] = (data || []).map(alert => ({
        id: alert.id,
        alertType: alert.alert_type as any,
        severityLevel: alert.severity_level as any,
        contributingFactors: Array.isArray(alert.contributing_factors) ? alert.contributing_factors as string[] : [],
        aiReasoning: alert.ai_reasoning || '',
        confidenceScore: alert.confidence_score,
        status: alert.status as any,
        recommendedActions: Array.isArray(alert.recommended_actions) ? alert.recommended_actions as string[] : [],
        createdAt: new Date(alert.created_at),
        updatedAt: new Date(alert.updated_at),
      }));

      setAlerts(alertsData);
      updateSystemMetrics(alertsData);

    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Run comprehensive risk analysis
  const runRiskAnalysis = async () => {
    if (!user) return;

    try {
      setAnalyzing(true);

      // Analyze patterns and generate predictions
      const { data, error } = await supabase.functions.invoke('early-warning-analysis', {
        body: {
          userId: user.id,
          analysisType: 'comprehensive',
          lookbackDays: 14,
        }
      });

      if (error) throw error;

      // Update risk factors based on analysis
      setRiskFactors(data.riskFactors || riskFactors);
      
      // Show notifications for new high-priority alerts
      const newCriticalAlerts = data.newAlerts?.filter((alert: any) => 
        alert.severityLevel === 'critical' || alert.severityLevel === 'high'
      );

      if (newCriticalAlerts?.length > 0) {
        toast({
          title: "⚠️ Important Health Alert",
          description: `We've detected ${newCriticalAlerts.length} concerning pattern(s) in your data.`,
          variant: "destructive",
        });
      }

      // Refresh alerts
      await fetchAlerts();

    } catch (error) {
      console.error('Error running risk analysis:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to complete risk analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  // Update alert status
  const updateAlertStatus = async (alertId: string, status: 'acknowledged' | 'resolved') => {
    try {
      const { error } = await supabase
        .from('early_warning_alerts')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, status, updatedAt: new Date() }
          : alert
      ));

      toast({
        title: status === 'acknowledged' ? "Alert Acknowledged" : "Alert Resolved",
        description: status === 'acknowledged' 
          ? "Thank you for acknowledging this alert." 
          : "Great job addressing this concern!",
      });

    } catch (error) {
      console.error('Error updating alert status:', error);
      toast({
        title: "Update Error",
        description: "Failed to update alert status.",
        variant: "destructive",
      });
    }
  };

  // Trigger emergency protocol
  const triggerEmergencyProtocol = async (alertId: string) => {
    try {
      // Log crisis interaction
      const { error: logError } = await supabase
        .from('crisis_interactions')
        .insert({
          user_id: user?.id,
          crisis_level: 'high',
          action_taken: 'emergency_protocol_triggered',
          notes: `Triggered from early warning alert: ${alertId}`,
        });

      if (logError) console.error('Error logging crisis interaction:', logError);

      // In a real implementation, this would:
      // 1. Notify emergency contacts
      // 2. Connect to crisis hotlines
      // 3. Alert healthcare providers
      // 4. Provide immediate resources

      toast({
        title: "🚨 Emergency Protocol Activated",
        description: "Connecting you to immediate support resources...",
      });

      // Simulate emergency contact
      setTimeout(() => {
        toast({
          title: "Emergency Support Available",
          description: "Crisis counselors are standing by. Call 988 for immediate help.",
        });
      }, 2000);

    } catch (error) {
      console.error('Error triggering emergency protocol:', error);
    }
  };

  // Update system metrics
  const updateSystemMetrics = (alertsData: EarlyWarningAlert[]) => {
    const activeAlerts = alertsData.filter(alert => alert.status === 'active').length;
    
    // Calculate risk score based on active alerts
    let riskScore = 0;
    alertsData.forEach(alert => {
      if (alert.status === 'active') {
        switch (alert.severityLevel) {
          case 'critical':
            riskScore += 40;
            break;
          case 'high':
            riskScore += 25;
            break;
          case 'medium':
            riskScore += 15;
            break;
          case 'low':
            riskScore += 5;
            break;
        }
      }
    });

    riskScore = Math.min(100, riskScore);

    // Calculate average confidence
    const confidenceLevel = alertsData.length > 0
      ? alertsData.reduce((sum, alert) => sum + alert.confidenceScore, 0) / alertsData.length
      : 0;

    setSystemMetrics({
      activeAlerts,
      riskScore,
      lastAssessment: new Date(),
      confidenceLevel,
    });
  };

  // Get severity color for UI
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Get alert type display name
  const getAlertTypeDisplayName = (type: string) => {
    switch (type) {
      case 'depression_risk':
        return 'Depression Risk';
      case 'burnout_risk':
        return 'Burnout Risk';
      case 'crisis_risk':
        return 'Crisis Risk';
      case 'anxiety_spike':
        return 'Anxiety Spike';
      case 'sleep_disruption':
        return 'Sleep Disruption';
      default:
        return 'Health Alert';
    }
  };

  // Auto-analyze periodically
  useEffect(() => {
    if (user) {
      fetchAlerts();
      
      // Run analysis daily
      const interval = setInterval(() => {
        runRiskAnalysis();
      }, 24 * 60 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [user, fetchAlerts]);

  // Run analysis on component mount
  useEffect(() => {
    if (user && alerts.length === 0) {
      // Delay initial analysis to allow other data to load
      setTimeout(() => {
        runRiskAnalysis();
      }, 5000);
    }
  }, [user]);

  return {
    alerts,
    riskFactors,
    systemMetrics,
    loading,
    analyzing,
    runRiskAnalysis,
    updateAlertStatus,
    triggerEmergencyProtocol,
    getSeverityColor,
    getAlertTypeDisplayName,
  };
};