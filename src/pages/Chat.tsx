import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '@/contexts/AuthContext';
import { streamAuriResponse } from '@/features/auri/getAuriResponse';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const Chat = () => {
  const { t, i18n } = useTranslation(['common', 'auri']);
  const { user } = useAuthContext();
  const { toast } = useToast();
  
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamContent, setStreamContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, streamContent]);

  const send = async (text: string) => {
    const lang = i18n.language;
    const next = [...msgs, { role: 'user' as const, content: text }];
    setMsgs(next);
    setInput('');
    setError(null);
    
    let acc = '';
    setStreaming(true);
    setStreamContent('');
    
    try {
      await streamAuriResponse({ messages: next, lang }, (tok) => {
        acc += tok;
        setStreamContent(acc);
      });
      
      setStreaming(false);
      
      // Simple anti-repeat: if assistant same as last assistant -> append "variation"
      const lastAssist = msgs.filter(m => m.role === 'assistant').at(-1)?.content || '';
      const norm = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').slice(0, 140);
      
      if (norm(lastAssist) === norm(acc)) {
        // retry once with higher temp message hint
        const hint = [...next, { role: 'system' as const, content: 'Do not repeat phrasing. Provide completely new 3 steps.' }];
        acc = '';
        setStreaming(true);
        setStreamContent('');
        
        await streamAuriResponse({ messages: hint, lang }, (tok) => {
          acc += tok;
          setStreamContent(acc);
        });
        
        setStreaming(false);
      }
      
      setMsgs([...next, { role: 'assistant', content: acc }]);
      setStreamContent('');
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
      setStreaming(false);
      setStreamContent('');
      toast({
        title: t('common.error'),
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      });
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || streaming) return;
    send(input.trim());
  };

  const handleSuggestionClick = (prompt: string) => {
    setInput('');
    send(prompt);
  };

  const retry = () => {
    setError(null);
    if (msgs.length > 0 && msgs[msgs.length - 1].role === 'user') {
      send(msgs[msgs.length - 1].content);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">{t('common.pleaseSignIn')}</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Auri</h1>
            <p className="text-muted-foreground mt-2">{t('auri:welcome', 'Välkommen')}</p>
          </div>
        </div>

        <Card className="flex-1 flex flex-col p-4 max-w-4xl mx-auto w-full">
          {/* Messages */}
          <div className="flex-1 space-y-4 mb-4 overflow-y-auto max-h-96">
            {msgs.length === 0 && !streaming && (
              <div className="text-center text-muted-foreground py-8">
                <p>{t('auri:welcome', 'Välkommen')}</p>
                <div className="grid grid-cols-2 gap-2 mt-4 max-w-md mx-auto">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleSuggestionClick(t('auri:suggestions.mood', 'Prata om mitt mående'))}
                  >
                    {t('auri:suggestions.mood', 'Mood')}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleSuggestionClick(t('auri:suggestions.stress', 'Minska stress'))}
                  >
                    {t('auri:suggestions.stress', 'Stress')}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleSuggestionClick(t('auri:suggestions.anxiety', 'Hantera oro'))}
                  >
                    {t('auri:suggestions.anxiety', 'Anxiety')}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleSuggestionClick(t('auri:suggestions.general', 'Snabb välmåenderutin'))}
                  >
                    {t('auri:suggestions.general', 'General')}
                  </Button>
                </div>
              </div>
            )}
            
            {msgs.map((message, idx) => (
              <div
                key={idx}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            
            {streaming && (
              <div className="flex justify-start">
                <div className="bg-muted text-foreground max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                  {streamContent ? (
                    <p className="text-sm whitespace-pre-wrap">{streamContent}</p>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Auri skriver...</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm text-destructive">{error}</span>
              </div>
              <Button
                onClick={retry}
                size="sm"
                variant="outline"
                className="h-7 px-2"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('auri:inputPlaceholder', 'Skriv ditt meddelande här...')}
              disabled={streaming}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={!input.trim() || streaming}
              className="px-4"
            >
              {streaming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default Chat;