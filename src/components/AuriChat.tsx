import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Send, 
  Mic, 
  MicOff, 
  Heart, 
  Brain,
  Loader2,
  Volume2,
  VolumeX,
  Plus,
  Download,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { TrustBadge } from '@/components/TrustBadge';
import { QuickActions } from '@/features/auri/components/QuickActions';
import { BreathingRing } from '@/features/exercises/components/BreathingRing';
import { useToast } from '@/components/ui/use-toast';
import { auriService } from '@/services/auri';
import { sessionsService, type ChatSession } from '@/services/sessions';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AuriChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [exerciseMode, setExerciseMode] = useState<string | null>(null);
  const [ttsEnabled, setTtsEnabled] = useState(() => {
    return localStorage.getItem('tts-enabled') === 'true';
  });
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const { toast } = useToast();

  // Load sessions on mount
  useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user]);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: i18n.language === 'sv' 
            ? "Hej! Jag är Auri, din medkänsliga AI-välmåendecoach. Jag är här för att lyssna, stötta och hjälpa dig på din resa mot bättre mental hälsa. Hur mår du idag? 😌"
            : "Hello! I'm Auri, your compassionate AI wellness coach. I'm here to listen, support, and help you on your mental health journey. How are you feeling today? 😌",
          timestamp: new Date()
        }
      ]);
    }
  }, [i18n.language]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, streamingText]);

  const loadSessions = async () => {
    try {
      setLoadingSessions(true);
      const sessionList = await sessionsService.listSessions();
      setSessions(sessionList);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoadingSessions(false);
    }
  };

  const startNewChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: i18n.language === 'sv' 
          ? "Hej! Jag är Auri, din medkänsliga AI-välmåendecoach. Jag är här för att lyssna, stötta och hjälpa dig på din resa mot bättre mental hälsa. Hur mår du idag? 😌"
          : "Hello! I'm Auri, your compassionate AI wellness coach. I'm here to listen, support, and help you on your mental health journey. How are you feeling today? 😌",
        timestamp: new Date()
      }
    ]);
    setCurrentSessionId(null);
    setStreamingText('');
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setStreamingText('');

    // Add placeholder for assistant response
    const assistantMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date()
    }]);

    try {
      await auriService.startOrSendMessage(
        content,
        (data) => {
          if (data.type === 'token') {
            setStreamingText(prev => prev + data.content);
          } else if (data.type === 'complete') {
            setMessages(prev => prev.map(msg => 
              msg.id === assistantMessageId 
                ? { ...msg, content: data.full_response }
                : msg
            ));
            setStreamingText('');
            setIsLoading(false);
            setCurrentSessionId(data.sessionId);
            
            // Text-to-speech for assistant messages
            if (ttsEnabled && data.full_response) {
              speakMessage(data.full_response);
            }
          }
        },
        currentSessionId || undefined,
        i18n.language
      );
    } catch (error) {
      console.error('Send message error:', error);
      setIsLoading(false);
      setStreamingText('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const exportChat = async () => {
    if (!currentSessionId) {
      toast({
        title: t('common.error'),
        description: i18n.language === 'sv' ? "Ingen aktiv session att exportera" : "No active session to export",
        variant: "destructive",
      });
      return;
    }

    try {
      const exportText = await sessionsService.exportSessionAsText(currentSessionId);
      const blob = new Blob([exportText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `auri-chat-${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: t('common.success'),
        description: i18n.language === 'sv' ? "Chatt exporterad" : "Chat exported",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: t('common.error'),
        description: i18n.language === 'sv' ? "Kunde inte exportera chatten" : "Failed to export chat",
        variant: "destructive",
      });
    }
  };

  const toggleListening = () => {
    if (!isListening) {
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = i18n.language === 'en' ? 'en-US' : i18n.language;

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
        };
        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          toast({
            title: t('common.error'),
            description: i18n.language === 'sv' ? "Kunde inte höra dig tydligt. Försök igen eller skriv ditt meddelande." : "Couldn't hear you clearly. Please try again or type your message.",
            variant: "destructive",
          });
        };
        recognition.onend = () => setIsListening(false);
        recognition.start();
      } else {
        toast({
          title: t('common.error'),
          description: i18n.language === 'sv' ? "Röstinmatning stöds inte i din webbläsare. Skriv ditt meddelande." : "Voice input isn't supported in your browser. Please type your message.",
          variant: "destructive",
        });
      }
    } else {
      setIsListening(false);
    }
  };

  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window && !isSpeaking) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = i18n.language === 'en' ? 'en-US' : i18n.language;
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleExerciseStart = (exerciseType: string) => {
    setExerciseMode(exerciseType);
  };

  const handleExerciseComplete = () => {
    setExerciseMode(null);
    toast({
      title: t('common.success'),
      description: i18n.language === 'sv' ? "Övning slutförd!" : "Exercise completed!",
    });
  };

  if (exerciseMode) {
    return (
      <div className="max-w-md mx-auto p-4">
        <div className="mb-4">
          <Button 
            variant="outline" 
            onClick={() => setExerciseMode(null)}
            className="mb-4"
          >
            ← {t('common.back')}
          </Button>
        </div>
        <BreathingRing 
          onComplete={handleExerciseComplete}
          duration={exerciseMode === 'breathing' ? 60 : 120}
          autoStart={true}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Chat Header */}
      <Card className="p-4 bg-white/80 backdrop-blur-sm border-0 shadow-aura mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-primary">{t('auri:title') || 'Auri'}</h3>
              <p className="text-sm text-muted-foreground">
                {isLoading ? (t('auri:thinking') || 'Thinking...') : (t('auri:subtitle') || 'Your AI wellness coach')}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <TrustBadge variant="chat" />
            <Button onClick={startNewChat} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              {t('auri:newChat') || 'New Chat'}
            </Button>
            {currentSessionId && (
              <Button onClick={exportChat} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                {t('auri:exportChat') || 'Export'}
              </Button>
            )}
            <Badge variant="secondary" className="flex items-center">
              <Brain className="w-3 h-3 mr-1" />
              AI Powered
            </Badge>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <QuickActions onExerciseStart={handleExerciseStart} />
      
      {/* Chat Messages */}
      <Card className="flex-1 p-0 bg-white/80 backdrop-blur-sm border-0 shadow-lg overflow-hidden">
        <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] p-4 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-muted text-foreground border'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center space-x-2 mb-2">
                      <Heart className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-primary">Auri</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => isSpeaking ? stopSpeaking() : speakMessage(message.content)}
                        className="h-6 w-6 p-0 hover:bg-primary/10"
                      >
                        {isSpeaking ? (
                          <VolumeX className="w-3 h-3 text-primary" />
                        ) : (
                          <Volume2 className="w-3 h-3 text-primary" />
                        )}
                      </Button>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed">{message.content || streamingText}</p>
                  <p className={`text-xs mt-2 opacity-70`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted p-4 rounded-lg border">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-sm text-primary">{t('auri:thinking') || 'Thinking...'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </Card>

      {/* Input */}
      <Card className="p-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg mt-4">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <div className="flex-1">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('auri:placeholder') || 'Type your message...'}
              className="focus:ring-primary focus:border-primary"
              disabled={isLoading}
            />
          </div>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={toggleListening}
            disabled={isLoading}
            className={isListening ? 'bg-primary text-primary-foreground' : ''}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>

          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
        
        <p className="text-xs text-muted-foreground mt-2 text-center">
          {t('auri:disclaimer') || 'AI responses are for informational purposes only'}
        </p>
      </Card>
    </div>
  );
};

export default AuriChat;