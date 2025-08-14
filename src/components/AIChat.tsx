import { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
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
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (content: string) => {
    if (!content.trim() || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Simulate AI response for now
      const responses = [
        "I understand how you're feeling. It's completely normal to have these thoughts sometimes.",
        "That sounds challenging. Let's explore some coping strategies that might help.",
        "Thank you for sharing. How would you like to work through this together?",
        "I'm here to support you. What would be most helpful right now?"
      ];
      
      const response = responses[Math.floor(Math.random() * responses.length)];
      
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 1000);

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
              <Card key={message.id} className={message.role === 'user' ? 'ml-12' : 'mr-12'}>
                <CardContent className={`p-4 ${message.role === 'user' ? 'bg-primary text-primary-foreground' : ''}`}>
                  <p>{message.content}</p>
                  <p className="text-xs mt-2 opacity-70">
                    {message.timestamp.toLocaleTimeString()}
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