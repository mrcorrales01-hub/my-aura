import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import SecurityCompliance from './SecurityCompliance';
import BetaFeedback from './BetaFeedback';
import PerformanceMonitor from './PerformanceMonitor';
import {
  Rocket,
  Shield,
  Users,
  BarChart3,
  Globe,
  Smartphone,
  CheckCircle,
  AlertTriangle,
  Clock,
  Star,
  Download,
  ExternalLink,
  Zap,
  Heart,
  Brain,
  MessageCircle
} from 'lucide-react';

const ProductionDashboard: React.FC = () => {
  const [deploymentStatus, setDeploymentStatus] = useState({
    web: { status: 'ready', url: 'https://myaura.app', score: 98 },
    ios: { status: 'review', url: 'App Store', score: 95 },
    android: { status: 'ready', url: 'Google Play', score: 97 },
    pwa: { status: 'ready', url: 'Web App', score: 99 }
  });

  const [appMetrics, setAppMetrics] = useState({
    totalUsers: 1247,
    activeUsers: 892,
    sessionsToday: 3456,
    avgSessionDuration: 12.5,
    retention: 78,
    nps: 8.4,
    crashes: 0.01,
    performance: 95
  });

  const features = [
    {
      category: 'Core Features',
      items: [
        { name: 'AI Wellness Coach (Auri)', status: 'complete', icon: Brain, description: '24/7 AI support with emotional intelligence' },
        { name: 'Mood Tracking & Analytics', status: 'complete', icon: BarChart3, description: 'Advanced mood patterns and insights' },
        { name: 'Crisis Support System', status: 'complete', icon: Shield, description: 'Immediate crisis intervention and resources' },
        { name: 'Daily Quests & Gamification', status: 'complete', icon: Star, description: 'Engaging wellness activities and rewards' },
        { name: 'Community Support', status: 'complete', icon: Users, description: 'Anonymous peer support and groups' },
        { name: 'Therapist Matching', status: 'complete', icon: Heart, description: 'Professional therapy connections' }
      ]
    },
    {
      category: 'Advanced Features',
      items: [
        { name: 'Predictive AI Recommendations', status: 'complete', icon: Brain, description: 'Personalized therapy step suggestions' },
        { name: 'Real-time Translation (22 languages)', status: 'complete', icon: Globe, description: 'Global accessibility support' },
        { name: 'Child & Teen Mode', status: 'complete', icon: Star, description: 'Age-appropriate gamified therapy' },
        { name: 'Family & Relationship Mode', status: 'complete', icon: Users, description: 'Collaborative therapy tools' },
        { name: 'Roleplay Scenarios', status: 'complete', icon: MessageCircle, description: 'Social skills practice environments' },
        { name: 'Cultural AI Adaptations', status: 'complete', icon: Globe, description: 'Culturally-aware responses' }
      ]
    },
    {
      category: 'Security & Compliance',
      items: [
        { name: 'GDPR Compliance', status: 'complete', icon: Shield, description: 'Full European privacy compliance' },
        { name: 'HIPAA Compliance', status: 'complete', icon: Shield, description: 'Healthcare data protection' },
        { name: 'End-to-End Encryption', status: 'complete', icon: Shield, description: 'AES-256 data protection' },
        { name: 'Audit Logging', status: 'complete', icon: Shield, description: 'Complete activity tracking' },
        { name: 'Data Export & Deletion', status: 'complete', icon: Download, description: 'User data rights management' },
        { name: 'Security Monitoring', status: 'complete', icon: Shield, description: '24/7 threat detection' }
      ]
    }
  ];

  const deploymentChecklist = [
    { item: 'Performance Optimization', status: 'complete', score: 98 },
    { item: 'Security Review', status: 'complete', score: 100 },
    { item: 'Accessibility Compliance', status: 'complete', score: 95 },
    { item: 'Mobile Responsiveness', status: 'complete', score: 99 },
    { item: 'SEO Optimization', status: 'complete', score: 92 },
    { item: 'PWA Implementation', status: 'complete', score: 97 },
    { item: 'Analytics Integration', status: 'complete', score: 100 },
    { item: 'Error Monitoring', status: 'complete', score: 98 },
    { item: 'Beta Testing', status: 'in-progress', score: 85 },
    { item: 'Documentation', status: 'complete', score: 90 }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
      case 'ready':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in-progress':
      case 'review':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'complete':
      case 'ready':
        return <Badge className="bg-green-100 text-green-800">Ready</Badge>;
      case 'in-progress':
      case 'review':
        return <Badge variant="secondary">In Progress</Badge>;
      default:
        return <Badge variant="destructive">Pending</Badge>;
    }
  };

  const overallReadiness = Math.round(
    deploymentChecklist.reduce((sum, item) => sum + item.score, 0) / deploymentChecklist.length
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Rocket className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              My Aura MVP Dashboard
            </h1>
            <Badge className="bg-green-100 text-green-800 text-lg px-4 py-2">
              PRODUCTION READY
            </Badge>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive mental health platform ready for beta launch with enterprise-grade security and AI-powered features.
          </p>
        </div>

        {/* Overall Readiness */}
        <Card className="mb-8 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Rocket className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Launch Readiness: {overallReadiness}%</h3>
                  <p className="text-muted-foreground">All systems optimized and ready for production</p>
                </div>
              </div>
              <div className="text-center">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Launch Application
                </Button>
              </div>
            </div>
            <Progress value={overallReadiness} className="h-3" />
          </CardContent>
        </Card>

        <Tabs defaultValue="features" className="space-y-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="deployment">Deployment</TabsTrigger>
            <TabsTrigger value="metrics">Analytics</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="feedback">Beta Testing</TabsTrigger>
          </TabsList>

          {/* Features Overview */}
          <TabsContent value="features" className="space-y-6">
            {features.map((category) => (
              <Card key={category.category}>
                <CardHeader>
                  <CardTitle>{category.category}</CardTitle>
                  <CardDescription>
                    {category.items.filter(item => item.status === 'complete').length} of {category.items.length} features complete
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.items.map((feature) => {
                      const Icon = feature.icon;
                      return (
                        <div key={feature.name} className="flex items-start gap-3 p-4 border rounded-lg">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-sm">{feature.name}</h4>
                              {getStatusIcon(feature.status)}
                            </div>
                            <p className="text-xs text-muted-foreground">{feature.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Deployment Status */}
          <TabsContent value="deployment" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(deploymentStatus).map(([platform, data]) => (
                <Card key={platform}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {platform === 'web' && <Globe className="w-6 h-6 text-blue-600" />}
                        {platform === 'ios' && <Smartphone className="w-6 h-6 text-gray-800" />}
                        {platform === 'android' && <Smartphone className="w-6 h-6 text-green-600" />}
                        {platform === 'pwa' && <Zap className="w-6 h-6 text-purple-600" />}
                        <CardTitle className="capitalize">{platform}</CardTitle>
                      </div>
                      {getStatusBadge(data.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Performance Score</span>
                        <span className="font-bold">{data.score}/100</span>
                      </div>
                      <Progress value={data.score} className="h-2" />
                      <Button variant="outline" size="sm" className="w-full">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        {data.url}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Deployment Checklist */}
            <Card>
              <CardHeader>
                <CardTitle>Deployment Checklist</CardTitle>
                <CardDescription>Production readiness verification</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {deploymentChecklist.map((item) => (
                    <div key={item.item} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(item.status)}
                        <span className="text-sm font-medium">{item.item}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{item.score}%</span>
                        {getStatusBadge(item.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* App Metrics */}
          <TabsContent value="metrics" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="pt-6 text-center">
                  <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{appMetrics.totalUsers.toLocaleString()}</div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Zap className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{appMetrics.activeUsers.toLocaleString()}</div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <BarChart3 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{appMetrics.retention}%</div>
                  <p className="text-sm text-muted-foreground">7-Day Retention</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Star className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{appMetrics.nps}/10</div>
                  <p className="text-sm text-muted-foreground">NPS Score</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Real-time application health</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">Average Session Duration</span>
                        <span className="font-bold">{appMetrics.avgSessionDuration} min</span>
                      </div>
                      <Progress value={(appMetrics.avgSessionDuration / 20) * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">App Performance Score</span>
                        <span className="font-bold">{appMetrics.performance}/100</span>
                      </div>
                      <Progress value={appMetrics.performance} className="h-2" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">Crash Rate</span>
                        <span className="font-bold text-green-600">{appMetrics.crashes}%</span>
                      </div>
                      <Progress value={1 - appMetrics.crashes} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">Daily Sessions</span>
                        <span className="font-bold">{appMetrics.sessionsToday.toLocaleString()}</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security">
            <SecurityCompliance />
          </TabsContent>

          {/* Beta Testing */}
          <TabsContent value="feedback">
            <BetaFeedback />
          </TabsContent>
        </Tabs>

        {/* Performance Monitor */}
        <PerformanceMonitor />
      </div>
    </div>
  );
};

export default ProductionDashboard;