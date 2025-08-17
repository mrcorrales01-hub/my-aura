import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useEarlyWarningSystem } from '@/hooks/useEarlyWarningSystem';
import { 
  AlertTriangle, 
  Shield, 
  Brain, 
  Phone, 
  CheckCircle, 
  X, 
  Zap,
  TrendingDown,
  Heart,
  Moon,
  Activity,
  Users,
  MessageCircle,
  RefreshCw,
  Clock,
  Target
} from 'lucide-react';

const EarlyWarningSystem: React.FC = () => {
  const {
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
  } = useEarlyWarningSystem();

  const getRiskFactorIcon = (factor: string) => {
    switch (factor) {
      case 'moodDecline':
        return <TrendingDown className="w-4 h-4" />;
      case 'sleepDisruption':
        return <Moon className="w-4 h-4" />;
      case 'activityDecrease':
        return <Activity className="w-4 h-4" />;
      case 'stressIncrease':
        return <Zap className="w-4 h-4" />;
      case 'socialWithdrawal':
        return <Users className="w-4 h-4" />;
      case 'conversationPatterns':
        return <MessageCircle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 70) return 'text-red-600 bg-red-50 border-red-200';
    if (score >= 40) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (score >= 20) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'crisis_risk':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'depression_risk':
        return <Brain className="w-5 h-5 text-purple-500" />;
      case 'burnout_risk':
        return <Zap className="w-5 h-5 text-orange-500" />;
      case 'anxiety_spike':
        return <Heart className="w-5 h-5 text-blue-500" />;
      case 'sleep_disruption':
        return <Moon className="w-5 h-5 text-indigo-500" />;
      default:
        return <Shield className="w-5 h-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Early Warning System</h1>
          <p className="text-muted-foreground mt-1">
            AI-powered detection of mental health patterns and risk factors
          </p>
        </div>
        <Button 
          onClick={runRiskAnalysis} 
          disabled={analyzing}
          className="bg-primary hover:bg-primary/90"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${analyzing ? 'animate-spin' : ''}`} />
          {analyzing ? 'Analyzing...' : 'Run Analysis'}
        </Button>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={`border-2 ${getRiskScoreColor(systemMetrics.riskScore)}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Risk Score</p>
                <p className="text-2xl font-bold">
                  {systemMetrics.riskScore}/100
                </p>
              </div>
              <Shield className="w-8 h-8" />
            </div>
            <Progress 
              value={systemMetrics.riskScore} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Alerts</p>
                <p className="text-2xl font-bold text-red-600">
                  {systemMetrics.activeAlerts}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Confidence</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round(systemMetrics.confidenceLevel * 100)}%
                </p>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Check</p>
                <p className="text-sm font-bold">
                  {systemMetrics.lastAssessment.toLocaleTimeString()}
                </p>
              </div>
              <Clock className="w-8 h-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {alerts.filter(alert => alert.severityLevel === 'critical').length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Critical Alert:</strong> We've detected concerning patterns in your mental health data. 
            Please consider reaching out to a mental health professional or crisis hotline immediately.
          </AlertDescription>
        </Alert>
      )}

      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Active Health Alerts
          </CardTitle>
          <CardDescription>
            AI-detected patterns that may require attention
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <p>No active alerts - your patterns look healthy!</p>
              <p className="text-sm">Keep up the great work with your wellness journey.</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <Card key={alert.id} className={`border-l-4 ${getSeverityColor(alert.severityLevel)}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getAlertIcon(alert.alertType)}
                      <div>
                        <h3 className="font-semibold">
                          {getAlertTypeDisplayName(alert.alertType)}
                        </h3>
                        <Badge className={getSeverityColor(alert.severityLevel)}>
                          {alert.severityLevel.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {Math.round(alert.confidenceScore * 100)}% confidence
                      </span>
                      <Progress 
                        value={alert.confidenceScore * 100} 
                        className="w-16 h-2" 
                      />
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">
                    {alert.aiReasoning}
                  </p>

                  {alert.contributingFactors.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Contributing Factors:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {alert.contributingFactors.map((factor, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {alert.recommendedActions.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        Recommended Actions:
                      </p>
                      <ul className="text-sm space-y-1">
                        {alert.recommendedActions.map((action, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-blue-500 rounded-full" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-3 border-t">
                    {alert.severityLevel === 'critical' && (
                      <Button
                        onClick={() => triggerEmergencyProtocol(alert.id)}
                        className="bg-red-600 hover:bg-red-700 text-white"
                        size="sm"
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Emergency Help
                      </Button>
                    )}
                    
                    {alert.status === 'active' && (
                      <Button
                        onClick={() => updateAlertStatus(alert.id, 'acknowledged')}
                        variant="outline"
                        size="sm"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Acknowledge
                      </Button>
                    )}
                    
                    <Button
                      onClick={() => updateAlertStatus(alert.id, 'resolved')}
                      variant="outline"
                      size="sm"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Mark Resolved
                    </Button>

                    <span className="text-xs text-muted-foreground ml-auto">
                      {alert.createdAt.toLocaleDateString()} at {alert.createdAt.toLocaleTimeString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      {/* Risk Factors Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Risk Factors Monitoring
          </CardTitle>
          <CardDescription>
            Current patterns being monitored by the AI system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(riskFactors).map(([factor, isActive]) => (
              <div 
                key={factor} 
                className={`p-3 rounded-lg border ${
                  isActive ? 'border-orange-200 bg-orange-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    isActive ? 'bg-orange-100' : 'bg-gray-100'
                  }`}>
                    {getRiskFactorIcon(factor)}
                  </div>
                  <div>
                    <h3 className="font-medium capitalize">
                      {factor.replace(/([A-Z])/g, ' $1').trim()}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isActive ? 'Pattern detected' : 'Normal patterns'}
                    </p>
                  </div>
                  <div className="ml-auto">
                    {isActive ? (
                      <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        Normal
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Resources */}
      <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <Phone className="w-8 h-8 text-red-600" />
            <div>
              <h3 className="text-lg font-semibold text-red-900">
                Emergency Support Resources
              </h3>
              <p className="text-red-700">
                If you're in crisis, help is available 24/7
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-medium text-red-900 mb-2">Crisis Hotlines</h4>
              <ul className="space-y-1 text-red-700">
                <li>• 988 Suicide & Crisis Lifeline</li>
                <li>• Crisis Text Line: Text HOME to 741741</li>
                <li>• National Suicide Prevention Lifeline</li>
              </ul>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-medium text-red-900 mb-2">Immediate Actions</h4>
              <ul className="space-y-1 text-red-700">
                <li>• Call emergency services (911)</li>
                <li>• Contact your therapist or psychiatrist</li>
                <li>• Reach out to a trusted friend or family member</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EarlyWarningSystem;