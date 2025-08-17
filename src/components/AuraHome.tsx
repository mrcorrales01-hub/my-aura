import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Heart, 
  Smile, 
  Zap, 
  Brain,
  Sparkles,
  Mic,
  Send,
  Clock,
  TrendingUp,
  Target,
  Music,
  Video,
  Headphones,
  Play
} from 'lucide-react';
import { useI18n } from '@/hooks/useI18n';
import { useNavigate } from 'react-router-dom';

const AuraHome = () => {
  const [currentMood, setCurrentMood] = useState<string>('');
  const { t } = useI18n();
  const navigate = useNavigate();

  const moodOptions = [
    { emoji: '😊', label: 'Happy', value: 'happy', color: 'bg-aura-secondary' },
    { emoji: '😌', label: 'Calm', value: 'calm', color: 'bg-aura-serenity' },
    { emoji: '😰', label: 'Anxious', value: 'anxious', color: 'bg-aura-warm' },
    { emoji: '😔', label: 'Sad', value: 'sad', color: 'bg-aura-primary' },
    { emoji: '😤', label: 'Stressed', value: 'stressed', color: 'bg-destructive' },
    { emoji: '🤔', label: 'Confused', value: 'confused', color: 'bg-muted' }
  ];

  const quickActions = [
    {
      title: 'Chat with Auri',
      description: 'Your AI wellness coach is here 24/7',
      icon: MessageCircle,
      color: 'text-aura-primary',
      bgColor: 'bg-aura-primary/10',
      action: () => navigate('/chat')
    },
    {
      title: 'Harmonious Music',
      description: 'AI-curated music for relaxation & focus',
      icon: Music,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      action: () => navigate('/music'),
      badge: 'New!'
    },
    {
      title: 'Video Exercises',
      description: 'Guided mindfulness & movement sessions',
      icon: Video,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      action: () => navigate('/videos'),
      badge: 'New!'
    },
    {
      title: 'Mood Check-in',
      description: 'Track your emotional patterns',
      icon: Heart,
      color: 'text-aura-warm',
      bgColor: 'bg-aura-warm/10',
      action: () => navigate('/mood')
    },
    {
      title: 'Daily Quests',
      description: 'Complete wellness micro-tasks',
      icon: Sparkles,
      color: 'text-aura-serenity',
      bgColor: 'bg-aura-serenity/10',
      action: () => navigate('/quests')
    },
    {
      title: 'My Plan',
      description: 'Goals, habits & life balance',
      icon: Target,
      color: 'text-aura-secondary',
      bgColor: 'bg-aura-secondary/10',
      action: () => navigate('/plan')
    }
  ];

  return (
    <div className="min-h-screen bg-calm-gradient p-4 space-y-6">
      {/* Welcome Header */}
      <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-aura">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-aura-gradient flex items-center justify-center aura-glow">
            <Heart className="w-8 h-8 text-white aura-float" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-aura-primary mb-1">
              Welcome back! 👋
            </h1>
            <p className="text-foreground/70">
              I'm Auri, your compassionate AI wellness coach. How can I support you today?
            </p>
          </div>
        </div>
      </Card>

      {/* Quick Mood Check */}
      <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-aura">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-aura-primary flex items-center">
            <Smile className="w-5 h-5 mr-2" />
            Quick Mood Check
          </h2>
          <Badge variant="secondary" className="bg-aura-secondary/20 text-aura-secondary border-0">
            <Clock className="w-3 h-3 mr-1" />
            30 seconds
          </Badge>
        </div>
        
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
          {moodOptions.map((mood) => (
            <Button
              key={mood.value}
              variant={currentMood === mood.value ? "default" : "outline"}
              className={`h-16 flex-col space-y-1 transition-all duration-300 ${
                currentMood === mood.value 
                  ? `${mood.color} text-white shadow-aura` 
                  : 'border-aura-calm hover:bg-aura-calm'
              }`}
              onClick={() => setCurrentMood(mood.value)}
            >
              <span className="text-xl">{mood.emoji}</span>
              <span className="text-xs">{mood.label}</span>
            </Button>
          ))}
        </div>

        {currentMood && (
          <div className="bg-aura-calm/50 rounded-lg p-4 animate-fade-in">
            <p className="text-sm text-foreground/80 mb-3">
              Thank you for sharing. Would you like to talk about what's making you feel {currentMood} today?
            </p>
            <Button 
              size="sm" 
              className="bg-aura-primary hover:bg-aura-primary/90 text-white"
              onClick={() => navigate('/chat')}
            >
              Start Conversation
              <Send className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </Card>

      {/* New Wellness Features Showcase */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-foreground">New Wellness Modules!</h2>
              <p className="text-sm text-muted-foreground">Harmonious Music & Video Exercises now available</p>
            </div>
          </div>
          <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
            Just Released!
          </Badge>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="p-4 bg-white/60 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Music className="w-5 h-5 text-purple-600" />
              <h3 className="font-medium">Harmonious Music</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">AI-curated music that adapts to your mood and wellness goals</p>
            <Button 
              size="sm" 
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => navigate('/music')}
            >
              <Headphones className="w-4 h-4 mr-2" />
              Try Music
            </Button>
          </div>
          
          <div className="p-4 bg-white/60 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Video className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium">Video Exercises</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">Short guided videos for mindfulness, breathing, and movement</p>
            <Button 
              size="sm" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => navigate('/videos')}
            >
              <Play className="w-4 h-4 mr-2" />
              Try Videos
            </Button>
          </div>
        </div>

        <Button 
          variant="outline" 
          className="w-full border-purple-200 text-purple-600 hover:bg-purple-50"
          onClick={() => navigate('/wellness-showcase')}
        >
          View Complete Feature Overview
        </Button>
      </Card>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium text-aura-primary flex items-center">
          <Sparkles className="w-5 h-5 mr-2" />
          Wellness Features
        </h2>
        
        <div className="grid md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Card 
                key={index}
                className="p-4 bg-white/80 backdrop-blur-sm border-0 shadow-aura hover:shadow-glow cursor-pointer transition-all duration-300 hover:scale-105"
                onClick={action.action}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-10 h-10 rounded-full ${action.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${action.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                                 <div className="flex items-center justify-between mb-1">
                                   <h3 className="font-medium text-aura-primary truncate">{action.title}</h3>
                                   {action.badge && (
                                     <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs px-2 py-1">
                                       {action.badge}
                                     </Badge>
                                   )}
                                 </div>
                    <p className="text-sm text-foreground/70 mb-2 line-clamp-2">{action.description}</p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full border-aura-primary/20 text-aura-primary hover:bg-aura-primary hover:text-white"
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Try Now
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Today's Progress */}
      <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-aura">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-aura-primary flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Your Wellness Journey
          </h2>
          <Badge variant="secondary" className="bg-aura-growth/20 text-aura-growth border-0">
            3 day streak!
          </Badge>
        </div>
        
        <div className="grid md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-aura-secondary/10 rounded-lg">
            <div className="text-2xl font-bold text-aura-secondary mb-1">7</div>
            <div className="text-sm text-foreground/70">Check-ins this week</div>
          </div>
          <div className="text-center p-4 bg-purple-100 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-1">3</div>
            <div className="text-sm text-foreground/70">Music sessions</div>
          </div>
          <div className="text-center p-4 bg-blue-100 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">2</div>
            <div className="text-sm text-foreground/70">Video exercises</div>
          </div>
          <div className="text-center p-4 bg-aura-growth/10 rounded-lg">
            <div className="text-2xl font-bold text-aura-growth mb-1">4</div>
            <div className="text-sm text-foreground/70">Goals achieved</div>
          </div>
        </div>
      </Card>

      {/* Crisis Support - Always Visible */}
      <Card className="p-4 bg-destructive/10 border border-destructive/20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-destructive" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-destructive mb-1">Need immediate support?</h3>
            <p className="text-sm text-destructive/80">Crisis resources and human support available 24/7</p>
          </div>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => navigate('/crisis')}
          >
            Get Help Now
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AuraHome;