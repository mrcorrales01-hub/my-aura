import { useAuth } from '@/contexts/AuthContext';
import { MoodTracker } from '@/components/MoodTracker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, PenTool, Target, TrendingUp, Calendar, Zap } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { t } = useI18n();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Welcome to My Aura</h2>
            <p className="text-muted-foreground mb-4">
              Please sign in to access your personal wellness dashboard.
            </p>
            <Link to="/auth">
              <Button>Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const quickActions = [
    {
      icon: MessageCircle,
      title: 'Chat with Auri',
      description: 'Get personalized support',
      href: '/coach',
      color: 'bg-primary text-primary-foreground'
    },
    {
      icon: PenTool,
      title: 'Journal Entry',
      description: 'Reflect on your day',
      href: '/journal',
      color: 'bg-secondary text-secondary-foreground'
    },
    {
      icon: Target,
      title: 'View Goals',
      description: 'Track your progress',
      href: '/goals',
      color: 'bg-accent text-accent-foreground'
    },
    {
      icon: Zap,
      title: 'Quick Exercise',
      description: 'Practice mindfulness',
      href: '/exercises',
      color: 'bg-muted text-muted-foreground'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Good morning! 👋
          </h1>
          <p className="text-muted-foreground">
            How are you feeling today? Let's check in and see how we can support your wellness journey.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Mood Check-in */}
            <MoodTracker />

            {/* Quick Stats */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">7</p>
                      <p className="text-sm text-muted-foreground">Day streak</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="h-8 w-8 text-secondary" />
                    <div>
                      <p className="text-2xl font-bold">12</p>
                      <p className="text-sm text-muted-foreground">Chats this week</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-8 w-8 text-accent" />
                    <div>
                      <p className="text-2xl font-bold">3</p>
                      <p className="text-sm text-muted-foreground">Goals active</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickActions.map((action) => (
                  <Link key={action.href} to={action.href}>
                    <Button
                      variant="outline"
                      className="w-full h-auto p-4 flex items-center gap-3 justify-start"
                    >
                      <action.icon className="h-5 w-5 text-primary" />
                      <div className="text-left">
                        <p className="font-medium text-sm">{action.title}</p>
                        <p className="text-xs text-muted-foreground">{action.description}</p>
                      </div>
                    </Button>
                  </Link>
                ))}
              </CardContent>
            </Card>

            {/* Today's Suggestion */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Focus</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Based on your recent mood patterns, try this breathing exercise.
                  </p>
                  <Link to="/exercises">
                    <Button size="sm" className="w-full">
                      Start 5-Minute Breathing
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}