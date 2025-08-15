import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { useI18n } from '@/hooks/useI18n';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const AIChat = () => {
  const { t, currentLanguage } = useI18n();
  const { user, session } = useAuth();
  const { toast } = useToast();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (content: string) => {
    if (!content.trim() || !user || !session) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-coach', {
        body: {
          message: content,
          language: currentLanguage,
          context: 'general',
          tone: 'supportive',
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data?.response ?? t('genericError'),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

    } catch (err) {
      console.error('Error sending message:', err);
      toast({
        title: t('error'),
        description: t('sendMessageError'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <div className="flex-1 flex flex-col min-h-0">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold text-foreground">Auri - Your AI Coach</h2>
          <p className="text-sm text-muted-foreground">
            I'm here to support you with evidence-based guidance and practical tools.
          </p>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <Card>
                <CardContent className="p-6">
                  <p className="text-muted-foreground text-center">
                    Hello! I'm Auri, your personal wellness coach. How are you feeling today?
                  </p>
                </CardContent>
              </Card>
            )}
            
            {messages.map((message) => (
              <Card
                key={message.id}
                className={message.role === 'user' ? 'ml-12' : 'mr-12'}
              >
                <CardContent
                  className={`p-4 ${
                    message.role === 'user' ? 'bg-primary text-primary-foreground' : ''
                  }`}
                >
                  <p>{message.content}</p>
                  <p className="text-xs mt-2 opacity-70">
                    {message.timestamp instanceof Date
                      ? message.timestamp.toLocaleTimeString()
                      : new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </CardContent>
              </Card>
            ))}
            
            {isLoading && (
              <Card className="mr-12">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <div className="animate-pulse">Auri is thinking...</div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-card">
          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};