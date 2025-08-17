import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  Brain, 
  Loader2, 
  MessageCircle, 
  Settings,
  Heart,
  Sparkles,
  User,
  Bot
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  tone?: string;
}

const AICoach = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tone, setTone] = useState('supportive');
  const [sessionId, setSessionId] = useState<string>('');
  const { user, session } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const toneOptions = [
    { value: 'supportive', label: 'Supportive', description: 'Compassionate and validating' },
    { value: 'professional', label: 'Professional', description: 'Evidence-based and structured' },
    { value: 'motivational', label: 'Motivational', description: 'Inspiring and energizing' },
    { value: 'friendly', label: 'Friendly', description: 'Casual and approachable' }
  ];

  const welcomeMessages = [
    "Hi! I'm Auri, your AI wellness coach. I'm here to listen, support, and help you navigate your mental health journey. How are you feeling today?",
    "Welcome back! I'm glad you're here. Whether you want to talk about your day, work through challenges, or just check in, I'm here for you.",
    "Hello! It's wonderful to see you prioritizing your mental wellbeing. What's on your mind today?"
  ];

  useEffect(() => {
    // Initialize session and welcome message
    const newSessionId = crypto.randomUUID();
    setSessionId(newSessionId);
    
    // Add welcome message
    const welcomeMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    setMessages([{
      id: crypto.randomUUID(),
      content: welcomeMessage,
      sender: 'ai',
      timestamp: new Date(),
      tone: 'supportive'
    }]);

    // Load recent conversation history
    loadConversationHistory();
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversationHistory = async () => {
    if (!user || !session) return;

    try {
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select('message, response, created_at, ai_tone')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error loading conversation history:', error);
        return;
      }

      if (conversations && conversations.length > 0) {
        const historyMessages: Message[] = [];
        conversations.reverse().forEach((conv) => {
          historyMessages.push({
            id: crypto.randomUUID(),
            content: conv.message,
            sender: 'user',
            timestamp: new Date(conv.created_at),
          });
          historyMessages.push({
            id: crypto.randomUUID(),
            content: conv.response,
            sender: 'ai',
            timestamp: new Date(conv.created_at),
            tone: conv.ai_tone
          });
        });

        setMessages(prev => [...historyMessages, ...prev]);
      }
    } catch (error) {
      console.error('Error loading conversation history:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !session) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: input.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-coach', {
        body: {
          message: userMessage.content,
          tone: tone,
          sessionId: sessionId,
          context: 'general'
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw error;
      }

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        content: data.response || data.fallbackResponse,
        sender: 'ai',
        timestamp: new Date(),
        tone: data.tone
      };

      setMessages(prev => [...prev, aiMessage]);

      if (data.fallbackResponse) {
        toast({
          title: "Connection Issue",
          description: "I'm having trouble connecting, but I'm still here to help!",
          variant: "default",
        });
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        content: "I'm having trouble connecting right now, but I'm here to support you. Please try again in a moment, or if you're in crisis, please reach out to a human counselor or emergency services immediately.",
        sender: 'ai',
        timestamp: new Date(),
        tone: 'supportive'
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Connection Error",
        description: "Unable to connect to AI coach. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-r from-aura-primary/10 to-aura-primary/5 border-aura-primary/20">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-aura-gradient flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl text-aura-primary">AI Coach Chat</CardTitle>
                <p className="text-sm text-foreground/70">
                  Your personal wellness companion, available 24/7
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-aura-primary/10 text-aura-primary">
              <MessageCircle className="w-3 h-3 mr-1" />
              Active
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Tone Settings */}
      <Card className="bg-card/50 backdrop-blur-sm border-aura-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Settings className="w-4 h-4 text-aura-primary" />
              <span className="text-sm font-medium">Conversation Tone:</span>
            </div>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {toneOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-muted-foreground">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="bg-card/50 backdrop-blur-sm border-aura-primary/20">
        <CardContent className="p-0">
          <ScrollArea ref={scrollAreaRef} className="h-96 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[80%] ${
                    message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.sender === 'user' 
                        ? 'bg-aura-primary/10' 
                        : 'bg-aura-gradient'
                    }`}>
                      {message.sender === 'user' ? (
                        <User className="w-4 h-4 text-aura-primary" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className={`rounded-lg p-3 ${
                      message.sender === 'user'
                        ? 'bg-aura-primary text-white'
                        : 'bg-background border border-aura-primary/20'
                    }`}>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-current/10">
                        <span className={`text-xs ${
                          message.sender === 'user' ? 'text-white/70' : 'text-muted-foreground'
                        }`}>
                          {formatTime(message.timestamp)}
                        </span>
                        {message.tone && message.sender === 'ai' && (
                          <Badge variant="outline" className="text-xs">
                            {toneOptions.find(t => t.value === message.tone)?.label}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2 max-w-[80%]">
                    <div className="w-8 h-8 rounded-full bg-aura-gradient flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-background border border-aura-primary/20 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin text-aura-primary" />
                        <span className="text-sm text-muted-foreground">Auri is thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Input Area */}
      <Card className="bg-card/50 backdrop-blur-sm border-aura-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share what's on your mind..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button 
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="bg-aura-primary hover:bg-aura-primary/90 text-white"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <div className="flex items-center space-x-1">
              <Heart className="w-3 h-3" />
              <span>Secure & encrypted</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Crisis Support Banner */}
      <Card className="bg-destructive/10 border border-destructive/20">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center">
              <Heart className="w-4 h-4 text-destructive" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive mb-1">
                Need immediate support?
              </p>
              <p className="text-xs text-destructive/80">
                If you're in crisis, please contact emergency services or crisis hotlines immediately.
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Crisis Resources
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AICoach;