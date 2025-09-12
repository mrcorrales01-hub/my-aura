import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Heart, 
  Users, 
  Target, 
  Calendar,
  TrendingUp,
  Shield,
  Star,
  MessageCircle,
  BookOpen,
  Award,
  Zap,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useGlobalLanguage } from '@/hooks/useGlobalLanguage';
import { useNavigate } from 'react-router-dom';
import { getDisplayName } from '@/lib/profileName';
import { useTranslation } from 'react-i18next';
import AICoach from './AICoach';

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useGlobalLanguage();
  const { t: tHome } = useTranslation('home');
  const navigate = useNavigate();
  const [currentStreak, setCurrentStreak] = useState(7);
  const [weeklyGoal, setWeeklyGoal] = useState(75);
  const [showAICoach, setShowAICoach] = useState(false);

  if (showAICoach) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-aura-primary/5">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => setShowAICoach(false)}
              className="mb-4"
            >
              ← Back to Dashboard
            </Button>
          </div>
          <AICoach />
        </div>
      </div>
    );
  }

  const primaryFeatures = [
    {
      icon: Brain,
      title: 'AI Coach',
      description: 'Chat with Auri, your personal AI wellness coach',
      status: 'Available Now',
      progress: 100,
      action: () => setShowAICoach(true),
      featured: true
    },
    {
      icon: Zap,
      title: tHome('coach'),
      description: tHome('coachDesc'),
      status: 'Available Now',
      progress: 100,
      action: () => navigate('/coach'),
      featured: true
    },
    {
      icon: Heart,
      title: 'Daily Check-in',
      description: 'Quick emotional wellness check with AI insights',
      status: 'Available Now',
      progress: 100,
      action: () => navigate('/checkin'),
      featured: true
    },
    {
      icon: Target,
      title: tHome('screeners'),
      description: 'PHQ-9 & GAD-7 self-assessments',
      status: 'Available Now',
      progress: 100,
      action: () => navigate('/screeners'),
      featured: true
    },
    {
      icon: TrendingUp,
      title: tHome('timeline'),
      description: 'Track symptoms over time with visual insights',
      status: 'Available Now',
      progress: 100,
      action: () => navigate('/timeline'),
      featured: true
    },
    {
      icon: Calendar,
      title: tHome('smartPlan'),
      description: 'AI-generated weekly focus goals',
      status: 'Available Now',
      progress: 100,
      action: () => navigate('/plan'),
      featured: true
    }
  ];

  const upcomingFeatures = [
    {
      icon: Heart,
      title: 'Mood Analytics',
      description: 'Advanced mood tracking with beautiful analytics',
      status: 'Coming Soon',
      progress: 70
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Connect with others on similar mental health journeys',
      status: 'Coming Soon',
      progress: 40
    }
  ];

  const quickActions = [
    {
      icon: AlertTriangle,
      title: 'Panikläget', 
      description: 'Snabb hjälp i akuta situationer',
      action: () => navigate('/panic')
    },
    {
      icon: MessageCircle,
      title: 'Chat with AI Coach',
      description: 'Get personalized guidance and support',
      action: () => setShowAICoach(true)
    },
    {
      icon: Zap,
      title: 'Mini-Coach Sessions',
      description: 'Quick guided flows for specific needs',
      action: () => navigate('/coach')
    },
    {
      icon: CheckCircle,
      title: 'Daily Check-in',
      description: 'Track your mood and get AI insights',
      action: () => navigate('/checkin')
    },
    {
      icon: Shield,
      title: 'Crisis Support',
      description: 'Safety plan, resources, and immediate help',
      action: () => navigate('/crisis')
    },
    {
      icon: Target,
      title: 'Set Goals',
      description: 'Define your wellness objectives',
      action: () => console.log('Set goals')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-aura-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {tHome('greeting', { name: getDisplayName(user?.user_metadata) })}
          </h1>
          <p className="text-foreground/70 text-lg">
            Your AI-powered mental wellness journey continues today. How can Auri support you?
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-card/50 backdrop-blur-sm border-aura-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Award className="h-4 w-4 text-aura-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-aura-primary">{currentStreak} days</div>
              <p className="text-xs text-muted-foreground">Keep it going! 🔥</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-aura-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-aura-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-aura-primary">{weeklyGoal}%</div>
              <Progress value={weeklyGoal} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-aura-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Sessions</CardTitle>
              <Brain className="h-4 w-4 text-aura-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-aura-primary">12</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>
        </div>

        {/* Primary AI Features */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">AI-Powered Wellness</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {primaryFeatures.map((feature, index) => (
              <Card 
                key={index} 
                className={`bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg cursor-pointer ${
                  feature.featured ? 'border-aura-primary ring-2 ring-aura-primary/20' : 'border-aura-primary/20'
                }`}
                onClick={feature.action}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-aura-gradient flex items-center justify-center">
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                        <Badge 
                          variant="outline" 
                          className={feature.featured ? "border-green-500 text-green-600 bg-green-50" : "border-aura-primary text-aura-primary"}
                        >
                          {feature.status}
                        </Badge>
                      </div>
                    </div>
                    {feature.featured && <Zap className="w-5 h-5 text-aura-primary animate-pulse" />}
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    {feature.description}
                  </CardDescription>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ready to use</span>
                      <span className="text-green-600 font-medium">{feature.progress}%</span>
                    </div>
                    <Progress value={feature.progress} className="h-2" />
                  </div>
                  <Button 
                    className="w-full mt-4 bg-aura-primary hover:bg-aura-primary/90 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      feature.action();
                    }}
                  >
                    Try Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Card 
                key={index} 
                className="bg-card/50 backdrop-blur-sm border-aura-primary/20 hover:border-aura-primary/40 transition-colors cursor-pointer"
                onClick={action.action}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-aura-primary/10 flex items-center justify-center">
                      <action.icon className="w-5 h-5 text-aura-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{action.title}</CardTitle>
                      <CardDescription className="text-sm">{action.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Upcoming Features */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Coming Soon</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {upcomingFeatures.map((feature, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur-sm border-aura-primary/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-aura-gradient flex items-center justify-center">
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                        <Badge variant="outline" className="border-aura-primary text-aura-primary">
                          {feature.status}
                        </Badge>
                      </div>
                    </div>
                    <Star className="w-5 h-5 text-aura-primary/50" />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    {feature.description}
                  </CardDescription>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Development Progress</span>
                      <span className="text-aura-primary font-medium">{feature.progress}%</span>
                    </div>
                    <Progress value={feature.progress} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* AI Coach CTA */}
        <Card className="bg-gradient-to-r from-aura-primary/10 to-aura-primary/5 border-aura-primary/20">
          <CardContent className="p-8 text-center">
            <Brain className="w-16 h-16 text-aura-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-foreground mb-2">
              Ready to talk with your AI Coach?
            </h3>
            <p className="text-foreground/70 mb-6 max-w-2xl mx-auto">
              Auri is available 24/7 to provide personalized mental health support, answer questions, 
              and help you work through challenges in a safe, confidential space.
            </p>
            <Button 
              className="bg-aura-primary hover:bg-aura-primary/90 text-white px-8"
              onClick={() => setShowAICoach(true)}
            >
              Start Conversation with Auri
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;