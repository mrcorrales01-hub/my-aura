import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PredictiveAIPanel from '@/components/PredictiveAIPanel';
import TranslationWidget from '@/components/TranslationWidget';
import ChildTeenMode from '@/components/ChildTeenMode';
import FamilyModePanel from '@/components/FamilyModePanel';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Brain, 
  Languages, 
  GamepadIcon, 
  Users, 
  Sparkles,
  Globe,
  Heart,
  Target
} from 'lucide-react';

const AdvancedFeatures: React.FC = () => {
  const { user } = useAuth();

  const features = [
    {
      id: 'predictive-ai',
      title: 'Predictive AI Coach',
      description: 'Get personalized therapy recommendations based on your progress',
      icon: Brain,
      badge: 'AI-Powered',
      badgeVariant: 'default' as const
    },
    {
      id: 'translation',
      title: 'Real-time Translation',
      description: 'Communicate in 22+ languages with instant translation',
      icon: Languages,
      badge: '22 Languages',
      badgeVariant: 'secondary' as const
    },
    {
      id: 'child-teen',
      title: 'Child & Teen Mode',
      description: 'Gamified therapy activities for younger users',
      icon: GamepadIcon,
      badge: 'Gamified',
      badgeVariant: 'outline' as const
    },
    {
      id: 'family-mode',
      title: 'Family & Relationships',
      description: 'Collaborative therapy for couples and families',
      icon: Users,
      badge: 'Collaborative',
      badgeVariant: 'destructive' as const
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Advanced Features
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Next-level capabilities to make your therapy experience unique and powerful
          </p>
        </div>

        {/* Feature Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.id} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <Badge variant={feature.badgeVariant} className="mx-auto">
                    {feature.badge}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Feature Tabs */}
        <Tabs defaultValue="predictive-ai" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto">
            <TabsTrigger value="predictive-ai" className="flex flex-col gap-2 py-4">
              <Brain className="w-5 h-5" />
              <span className="text-sm">Predictive AI</span>
            </TabsTrigger>
            <TabsTrigger value="translation" className="flex flex-col gap-2 py-4">
              <Languages className="w-5 h-5" />
              <span className="text-sm">Translation</span>
            </TabsTrigger>
            <TabsTrigger value="child-teen" className="flex flex-col gap-2 py-4">
              <GamepadIcon className="w-5 h-5" />
              <span className="text-sm">Child & Teen</span>
            </TabsTrigger>
            <TabsTrigger value="family-mode" className="flex flex-col gap-2 py-4">
              <Users className="w-5 h-5" />
              <span className="text-sm">Family Mode</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="predictive-ai" className="space-y-6">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Brain className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">Predictive AI Coach</h2>
                <Badge variant="default">AI-Powered</Badge>
              </div>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our AI analyzes your mood patterns, session notes, and progress to provide 
                personalized therapy recommendations and predict next steps in your journey.
              </p>
            </div>
            <PredictiveAIPanel />
          </TabsContent>

          <TabsContent value="translation" className="space-y-6">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Globe className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">Real-time Translation</h2>
                <Badge variant="secondary">22 Languages</Badge>
              </div>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Break down language barriers with instant, context-aware translation 
                designed specifically for therapeutic conversations and mental health content.
              </p>
            </div>
            <TranslationWidget context="chat" />
          </TabsContent>

          <TabsContent value="child-teen" className="space-y-6">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <GamepadIcon className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">Child & Teen Mode</h2>
                <Badge variant="outline">Gamified</Badge>
              </div>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Age-appropriate therapy activities with gamification elements. 
                Express emotions through drawing, play feeling games, and create stories in a safe, fun environment.
              </p>
            </div>
            <ChildTeenMode />
          </TabsContent>

          <TabsContent value="family-mode" className="space-y-6">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Heart className="w-6 h-6 text-red-500" />
                <h2 className="text-2xl font-bold">Family & Relationship Mode</h2>
                <Badge variant="destructive">Collaborative</Badge>
              </div>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Strengthen relationships with AI-guided family therapy sessions, 
                couples exercises, and collaborative tools for working through challenges together.
              </p>
            </div>
            <FamilyModePanel />
          </TabsContent>
        </Tabs>

        {/* Coming Soon Features */}
        <Card className="mt-12 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Target className="w-6 h-6 text-primary" />
              Coming Soon
            </CardTitle>
            <CardDescription>
              More advanced features in development
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4">
                <h4 className="font-semibold mb-2">Voice AI Assistant</h4>
                <p className="text-sm text-muted-foreground">
                  Natural voice conversations with AI coach
                </p>
              </div>
              <div className="p-4">
                <h4 className="font-semibold mb-2">VR Therapy Sessions</h4>
                <p className="text-sm text-muted-foreground">
                  Immersive virtual reality therapy experiences
                </p>
              </div>
              <div className="p-4">
                <h4 className="font-semibold mb-2">Biometric Integration</h4>
                <p className="text-sm text-muted-foreground">
                  Connect wearables for holistic health tracking
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdvancedFeatures;