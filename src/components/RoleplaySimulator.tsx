import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  MessageCircle, 
  Users, 
  Briefcase,
  Heart,
  Mic,
  MicOff,
  Volume2,
  Settings,
  Star,
  Target
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useGamification } from '@/hooks/useGamification';

interface RoleplayScenario {
  id: string;
  title: string;
  description: string;
  category: 'conflict' | 'interview' | 'dating' | 'presentation' | 'negotiation' | 'therapy';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  icon: any;
  color: string;
  bgColor: string;
  aiPersona: string;
  tips: string[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  feedback?: {
    tone: string;
    confidence: number;
    suggestions: string[];
  };
}

const RoleplaySimulator = () => {
  const [selectedScenario, setSelectedScenario] = useState<RoleplayScenario | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [sessionFeedback, setSessionFeedback] = useState<any>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const { completeRoleplaySession } = useGamification();
  const { t } = useTranslation();

  const scenarios: RoleplayScenario[] = [
    {
      id: '1',
      title: 'Difficult Conversation with Boss',
      description: 'Practice asking for a raise or discussing workplace concerns',
      category: 'conflict',
      difficulty: 'intermediate',
      icon: Briefcase,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      aiPersona: 'A professional but demanding boss who needs to be convinced with solid arguments',
      tips: [
        'Stay calm and professional',
        'Present facts and achievements',
        'Listen to their perspective',
        'Find common ground'
      ]
    },
    {
      id: '2',
      title: 'Job Interview Preparation',
      description: 'Practice answering tough interview questions with confidence',
      category: 'interview',
      difficulty: 'beginner',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      aiPersona: 'A friendly but thorough interviewer asking standard and behavioral questions',
      tips: [
        'Research the company beforehand',
        'Use the STAR method for examples',
        'Ask thoughtful questions',
        'Show enthusiasm'
      ]
    },
    {
      id: '3',
      title: 'Dating Conversation',
      description: 'Build confidence in romantic conversations and first dates',
      category: 'dating',
      difficulty: 'beginner',
      icon: Heart,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      aiPersona: 'A warm, interesting person who is open to getting to know you better',
      tips: [
        'Be genuinely interested in them',
        'Share stories, not just facts',
        'Ask open-ended questions',
        'Be yourself'
      ]
    },
    {
      id: '4',
      title: 'Public Speaking Practice',
      description: 'Overcome presentation anxiety and improve speaking skills',
      category: 'presentation',
      difficulty: 'advanced',
      icon: Mic,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      aiPersona: 'An engaged audience member who asks questions and provides reactions',
      tips: [
        'Start with a strong opening',
        'Make eye contact',
        'Use pauses effectively',
        'End with a clear call to action'
      ]
    },
    {
      id: '5',
      title: 'Conflict Resolution',
      description: 'Learn to navigate disagreements and find win-win solutions',
      category: 'conflict',
      difficulty: 'advanced',
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      aiPersona: 'Someone with a different viewpoint who is willing to find common ground',
      tips: [
        'Listen actively to understand',
        'Acknowledge their feelings',
        'Focus on interests, not positions',
        'Look for creative solutions'
      ]
    },
    {
      id: '6',
      title: 'Therapy Session Practice',
      description: 'Practice expressing emotions and discussing personal challenges',
      category: 'therapy',
      difficulty: 'intermediate',
      icon: MessageCircle,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      aiPersona: 'A compassionate, non-judgmental therapist who asks thoughtful questions',
      tips: [
        'Be honest about your feelings',
        'Take time to reflect',
        'Don\'t rush the process',
        'It\'s okay to be vulnerable'
      ]
    }
  ];

  const startRoleplay = async (scenario: RoleplayScenario) => {
    setSelectedScenario(scenario);
    setIsActive(true);
    setMessages([]);
    setSessionStartTime(new Date());
    
    // AI introduces the roleplay
    const introMessage: ChatMessage = {
      id: '1',
      role: 'ai',
      content: `Hello! I'm ready to roleplay as ${scenario.aiPersona}. Let's practice "${scenario.title}". Feel free to start whenever you're ready. Remember: this is a safe space to practice and learn.`,
      timestamp: new Date()
    };
    
    setMessages([introMessage]);
    
    toast({
      title: "Roleplay Started! 🎭",
      description: `Now practicing: ${scenario.title}`,
    });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !selectedScenario) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    try {
      // Send to dedicated roleplay AI
      const { data, error } = await supabase.functions.invoke('roleplay-ai', {
        body: {
          message: inputMessage,
          scenario: selectedScenario.title,
          persona: selectedScenario.aiPersona,
          conversationHistory: messages.slice(-6), // Keep last 6 messages for context
          language: 'en', // Use English as default since we removed multi-language support
          userId: user?.id
        }
      });

      if (error) throw error;

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: data.response || "I understand. Can you tell me more about that?",
        timestamp: new Date(),
        feedback: data.feedback ? {
          tone: data.feedback.tone || 'neutral',
          confidence: data.feedback.confidence || 75,
          suggestions: [
            data.feedback.strength ? `Strength: ${data.feedback.strength}` : 'Good communication',
            data.feedback.improvement ? `Tip: ${data.feedback.improvement}` : 'Keep practicing'
          ]
        } : undefined
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Error in roleplay:', error);
      toast({
        title: "Connection Issue",
        description: "Having trouble with the roleplay AI. Please try again.",
        variant: "destructive",
      });
    }
  };

  const endRoleplay = async () => {
    if (messages.length > 1 && selectedScenario && sessionStartTime) {
      const duration = Math.round((Date.now() - sessionStartTime.getTime()) / 60000); // duration in minutes
      const averageConfidence = messages
        .filter(m => m.feedback?.confidence)
        .reduce((sum, m) => sum + (m.feedback?.confidence || 0), 0) / 
        Math.max(1, messages.filter(m => m.feedback?.confidence).length);

      setSessionFeedback({
        duration: `${duration} minutes`,
        messagesExchanged: messages.length,
        overallConfidence: Math.round(averageConfidence || 75),
        strengths: ['Good listening skills', 'Clear communication', 'Stayed calm under pressure'],
        areasToImprove: ['Could be more assertive', 'Practice summarizing key points'],
        nextSteps: ['Try the advanced version', 'Practice with a friend', 'Record yourself speaking']
      });

      // Complete roleplay session for gamification
      await completeRoleplaySession(
        selectedScenario.title,
        selectedScenario.category,
        Math.round(averageConfidence || 75)
      );
    }
    
    setIsActive(false);
    setSelectedScenario(null);
    setMessages([]);
    setSessionStartTime(null);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {!isActive ? (
        <>
          {/* Scenario Selection */}
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-aura">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-aura-gradient flex items-center justify-center">
                <Play className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-aura-primary">{t('roleplay.title')}</h1>
                <p className="text-foreground/70">{t('roleplay.subtitle')}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {scenarios.map((scenario) => {
                const Icon = scenario.icon;
                return (
                  <Card
                    key={scenario.id}
                    className={`p-4 cursor-pointer transition-all duration-300 hover:shadow-lg ${scenario.bgColor} border-2 border-transparent hover:border-current`}
                    onClick={() => startRoleplay(scenario)}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-full ${scenario.bgColor} border-2 border-current flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${scenario.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className={`font-semibold ${scenario.color}`}>{scenario.title}</h3>
                          <Badge variant="outline" className={getDifficultyColor(scenario.difficulty)}>
                            {scenario.difficulty}
                          </Badge>
                        </div>
                        <p className="text-sm text-foreground/80 mb-3">{scenario.description}</p>
                        
                        <div className="space-y-2">
                          <p className="text-xs text-foreground/60">
                            <strong>AI Role:</strong> {scenario.aiPersona}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {scenario.tips.slice(0, 2).map((tip, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tip}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </Card>

          {/* Session Feedback */}
          {sessionFeedback && (
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-aura">
              <div className="flex items-center space-x-3 mb-4">
                <Star className="w-6 h-6 text-aura-growth" />
                <h2 className="text-xl font-semibold text-aura-primary">Session Complete!</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-aura-primary mb-3">Session Stats</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="font-medium">{sessionFeedback.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Messages:</span>
                      <span className="font-medium">{sessionFeedback.messagesExchanged}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Confidence:</span>
                      <span className="font-medium text-aura-growth">{sessionFeedback.overallConfidence}%</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-aura-primary mb-3">Key Strengths</h3>
                  <ul className="space-y-1 text-sm">
                    {sessionFeedback.strengths.map((strength: string, index: number) => (
                      <li key={index} className="flex items-center text-aura-growth">
                        <span className="w-2 h-2 bg-aura-growth rounded-full mr-2"></span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <Button 
                onClick={() => setSessionFeedback(null)}
                className="mt-4 bg-aura-primary hover:bg-aura-primary/90 text-white"
              >
                Start New Session
              </Button>
            </Card>
          )}
        </>
      ) : (
        /* Active Roleplay Interface */
        <div className="grid gap-6">
          {/* Roleplay Header */}
          <Card className="p-4 bg-white/80 backdrop-blur-sm border-0 shadow-aura">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h2 className="font-semibold text-aura-primary">{selectedScenario?.title}</h2>
                  <p className="text-sm text-foreground/70">Roleplay in Progress</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={endRoleplay}>
                  <Pause className="w-4 h-4 mr-2" />
                  End Session
                </Button>
              </div>
            </div>
          </Card>

          {/* Chat Interface */}
          <Card className="p-0 bg-white/80 backdrop-blur-sm border-0 shadow-aura h-96">
            <ScrollArea className="h-full p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-aura-primary text-white'
                          : 'bg-aura-calm border border-aura-primary/20'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      {message.feedback && (
                        <div className="mt-2 pt-2 border-t border-aura-primary/20">
                          <div className="text-xs text-aura-primary">
                            Confidence: {message.feedback.confidence}%
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>

          {/* Input Interface */}
          <Card className="p-4 bg-white/80 backdrop-blur-sm border-0 shadow-aura">
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <Textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your response in the roleplay..."
                  className="resize-none"
                  rows={2}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
              </div>
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim()}
                className="bg-aura-primary hover:bg-aura-primary/90 text-white"
              >
                Send
              </Button>
            </div>
          </Card>

          {/* Tips Panel */}
          {selectedScenario && (
            <Card className="p-4 bg-aura-serenity/10 border border-aura-serenity/30">
              <h3 className="font-medium text-aura-primary mb-2 flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Tips for {selectedScenario.title}
              </h3>
              <div className="grid md:grid-cols-2 gap-2">
                {selectedScenario.tips.map((tip, index) => (
                  <div key={index} className="text-sm text-foreground/80 flex items-center">
                    <span className="w-2 h-2 bg-aura-serenity rounded-full mr-2"></span>
                    {tip}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default RoleplaySimulator;