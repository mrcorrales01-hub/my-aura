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
  Award
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useGlobalLanguage } from '@/hooks/useGlobalLanguage';

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useGlobalLanguage();
  const [currentStreak, setCurrentStreak] = useState(7);
  const [weeklyGoal, setWeeklyGoal] = useState(75);

  const upcomingFeatures = [
    {
      icon: Brain,
      title: 'AI Coach',
      description: 'Personalized mental health guidance powered by advanced AI',
      status: 'Coming Soon',
      progress: 85
    },
    {
      icon: Heart,
      title: 'Mood Tracker',
      description: 'Track your emotional well-being with beautiful analytics',
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
      icon: MessageCircle,
      title: 'Quick Check-in',
      description: 'How are you feeling today?',
      action: () => console.log('Quick check-in')
    },
    {
      icon: BookOpen,
      title: 'Daily Journal',
      description: 'Reflect on your thoughts',
      action: () => console.log('Daily journal')
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
            Welcome back, {user?.user_metadata?.full_name || 'Friend'}!
          </h1>
          <p className="text-foreground/70 text-lg">
            Your mental wellness journey continues today. How can we support you?
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
              <CardTitle className="text-sm font-medium">Account Status</CardTitle>
              <Shield className="h-4 w-4 text-aura-primary" />
            </CardHeader>
            <CardContent>
              <Badge variant="secondary" className="bg-aura-primary/10 text-aura-primary">
                Free Plan
              </Badge>
              <p className="text-xs text-muted-foreground mt-2">Upgrade for premium features</p>
            </CardContent>
          </Card>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-aura-primary/10 to-aura-primary/5 border-aura-primary/20">
          <CardContent className="p-8 text-center">
            <Brain className="w-16 h-16 text-aura-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-foreground mb-2">
              Ready to unlock your full potential?
            </h3>
            <p className="text-foreground/70 mb-6 max-w-2xl mx-auto">
              Upgrade to premium and get access to personalized AI coaching, advanced mood analytics, 
              and exclusive community features when they launch.
            </p>
            <Button className="bg-aura-primary hover:bg-aura-primary/90 text-white px-8">
              Upgrade to Premium
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;