import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, Clock, Globe, Heart, MessageCircle, Sparkles, Send } from 'lucide-react';
import { useGlobalLocalization } from '@/hooks/useGlobalLocalization';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  culturalContext?: string;
  emotionalTone?: string;
}

interface CulturalContext {
  greeting: string;
  communicationStyle: 'direct' | 'indirect' | 'formal' | 'casual';
  wellnessApproach: string;
  culturalNuances: string[];
}

export const CulturalAICoach = () => {
  const { currentLanguage, t, isRTL, timeZone } = useGlobalLocalization();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [culturalContext, setCulturalContext] = useState<CulturalContext | null>(null);

  // Cultural contexts for different regions
  const culturalContexts: Record<string, CulturalContext> = {
    en: {
      greeting: 'Hi there! I\'m here to support your wellness journey.',
      communicationStyle: 'casual',
      wellnessApproach: 'Individual-focused self-care and personal boundaries',
      culturalNuances: ['Direct communication', 'Personal space importance', 'Individual achievement']
    },
    ja: {
      greeting: 'こんにちは。あなたの心の健康をサポートします。',
      communicationStyle: 'formal',
      wellnessApproach: 'Harmony-focused wellness and group consideration',
      culturalNuances: ['Indirect communication', 'Group harmony', 'Respect for hierarchy']
    },
    ar: {
      greeting: 'السلام عليكم. أنا هنا لدعم رحلة عافيتك.',
      communicationStyle: 'formal',
      wellnessApproach: 'Family and community-centered wellness',
      culturalNuances: ['Respect for elders', 'Family consultation', 'Spiritual wellness']
    },
    hi: {
      greeting: 'नमस्ते! मैं आपकी कल्याण यात्रा में सहायता के लिए यहाँ हूँ।',
      communicationStyle: 'formal',
      wellnessApproach: 'Holistic mind-body-spirit wellness',
      culturalNuances: ['Respect for tradition', 'Spiritual practices', 'Joint family considerations']
    },
    de: {
      greeting: 'Hallo! Ich bin hier, um Ihre Wellness-Reise zu unterstützen.',
      communicationStyle: 'direct',
      wellnessApproach: 'Structured and systematic wellness approach',
      culturalNuances: ['Direct feedback', 'Planning and structure', 'Work-life balance']
    },
    zh: {
      greeting: '您好！我在这里支持您的健康之旅。',
      communicationStyle: 'indirect',
      wellnessApproach: 'Balance and harmony-focused wellness',
      culturalNuances: ['Face-saving communication', 'Balance and harmony', 'Family honor']
    }
  };

  useEffect(() => {
    const context = culturalContexts[currentLanguage] || culturalContexts.en;
    setCulturalContext(context);
    
    // Add welcome message with cultural context
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        role: 'assistant',
        content: context.greeting,
        timestamp: new Date(),
        culturalContext: currentLanguage,
        emotionalTone: 'welcoming'
      }]);
    }
  }, [currentLanguage]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response with cultural context
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateCulturalResponse(input, culturalContext),
        timestamp: new Date(),
        culturalContext: currentLanguage,
        emotionalTone: 'supportive'
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateCulturalResponse = (userInput: string, context: CulturalContext | null) => {
    if (!context) return "I'm here to help you with your wellness journey.";

    // Simulate culturally aware responses
    const responses = {
      en: "I understand you're going through this. Let's focus on what you can control and build some healthy boundaries.",
      ja: "あなたの気持ちを理解しています。調和とバランスを見つけることに焦点を当てましょう。",
      ar: "أفهم ما تمر به. دعنا نركز على العافية الشاملة والدعم من المجتمع.",
      hi: "मैं समझता हूँ कि आप क्या महसूस कर रहे हैं। आइए संपूर्ण कल्याण पर ध्यान दें।",
      de: "Ich verstehe Ihre Situation. Lassen Sie uns einen strukturierten Ansatz für Ihr Wohlbefinden entwickeln.",
      zh: "我理解您的处境。让我们专注于找到内心的平衡与和谐。"
    };

    return responses[currentLanguage as keyof typeof responses] || responses.en;
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat(currentLanguage, {
      timeZone: timeZone,
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  AI Cultural Coach
                  <Badge variant="secondary" className="text-xs">
                    <Globe className="w-3 h-3 mr-1" />
                    {currentLanguage.toUpperCase()}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Culturally-aware wellness guidance tailored to your background
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timeZone.split('/')[1]}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {culturalContext && (
        <Card className="mb-6 border-wellness-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-4 h-4 text-wellness-primary" />
              <span className="font-medium text-sm">Cultural Context Active</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-wellness-primary mb-1">Communication Style</div>
                <div className="text-muted-foreground capitalize">{culturalContext.communicationStyle}</div>
              </div>
              <div>
                <div className="font-medium text-wellness-primary mb-1">Wellness Approach</div>
                <div className="text-muted-foreground">{culturalContext.wellnessApproach}</div>
              </div>
            </div>
            <div className="mt-3">
              <div className="font-medium text-wellness-primary mb-2 text-xs">Cultural Considerations</div>
              <div className="flex flex-wrap gap-1">
                {culturalContext.culturalNuances.map((nuance, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {nuance}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="h-[600px] flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-wellness-primary" />
            <span className="font-medium">Chat Session</span>
            {isTyping && (
              <Badge variant="secondary" className="text-xs">
                <Sparkles className="w-3 h-3 mr-1 animate-pulse" />
                AI thinking...
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 mb-4" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-wellness-primary text-white'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="text-sm">{message.content}</div>
                    <div className="text-xs opacity-70 mt-1 flex items-center gap-2">
                      {formatTime(message.timestamp)}
                      {message.culturalContext && (
                        <Badge variant="outline" className="text-xs h-4">
                          {message.culturalContext}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('coach.placeholder')}
              className="min-h-[60px] resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              dir={isRTL ? 'rtl' : 'ltr'}
            />
            <Button 
              onClick={handleSend} 
              disabled={!input.trim() || isTyping}
              className="self-end"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};