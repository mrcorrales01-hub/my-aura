import { useAuth } from '@/contexts/AuthContext';
import AuriChat from '@/components/AuriChat';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Brain, Heart, Target, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Coach() {
  const { user } = useAuth();
  const { t } = useTranslation();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Please sign in</h2>
            <p className="text-muted-foreground">
              Sign in to access your AI coach and continue your wellness journey.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const quickActions = [
    {
      icon: Brain,
      title: 'Reframe Thoughts',
      description: 'Challenge negative thinking patterns',
      action: 'reframe'
    },
    {
      icon: Heart,
      title: 'Emotional Support',
      description: 'Get comfort and validation',
      action: 'support'
    },
    {
      icon: Target,
      title: 'Make a Plan',
      description: 'Break down goals into steps',
      action: 'plan'
    },
    {
      icon: Users,
      title: 'Role-play',
      description: 'Practice difficult conversations',
      action: 'roleplay'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-6 h-[calc(100vh-8rem)]">
          {/* Quick Actions Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickActions.map((action) => (
                  <Button
                    key={action.action}
                    variant="outline"
                    className="w-full h-auto p-4 flex flex-col items-start gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <action.icon className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">{action.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground text-left">
                      {action.description}
                    </p>
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Crisis Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-3">
                  If you're in crisis or having thoughts of self-harm:
                </p>
                <Button variant="destructive" size="sm" className="w-full">
                  Get Help Now
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <AuriChat />
          </div>
        </div>
      </div>
    </div>
  );
}