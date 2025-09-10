import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '@/contexts/AuthContext';
import { streamAuriResponse } from '@/features/auri/getAuriResponse';
import { SuggestionButtons } from '@/features/auri/components/SuggestionButtons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Loader2, Send, AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { getSubscription, canUseFeature } from '@/lib/subscription';

interface Message {
  role: 'user' | 'assistant' | 'system';
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
  const [subscription, setSubscription] = useState<any>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, streamContent]);

  useEffect(() => {
    if (user) {
      getSubscription().then(setSubscription);
    }
  }, [user]);

  const send = async (text: string) => {
    if (!user) return;
    
    // Check subscription limits
    if (subscription && !canUseFeature(subscription, 'auriMessages', 1)) {
      toast({
        title: 'Message limit reached',
        description: `You've reached your weekly limit of ${subscription.limits.auriMessages} messages. Upgrade to Plus for 500 messages/week.`,
        variant: 'destructive'
      });
      return;
    }

    const lang = i18n.language;
    const next: Message[] = [...msgs, { role: 'user', content: text }];
    setMsgs(next);
    setInput('');
    setError(null);
    
    let acc = '';
    setStreaming(true);
    setStreamContent('');
    
    try {
      await streamAuriResponse({ 
        messages: next, 
        lang,
        user_id: user.id
      }, (tok) => {
        acc += tok;
        setStreamContent(acc);
      });
      
      setStreaming(false);
      
      // Anti-repeat guard
      const lastAssist = msgs.filter(m => m.role === 'assistant').at(-1)?.content || '';
      const norm = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').slice(0, 140);
      
      if (norm(lastAssist) === norm(acc)) {
        const hint: Message[] = [...next, { 
          role: 'system', 
          content: 'Do not reuse earlier phrasing; produce new concrete steps.' 
        }];
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
      
      // Refresh subscription after use
      if (subscription) {
        getSubscription().then(setSubscription);
      }
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Network error');
      setStreaming(false);
      setStreamContent('');
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
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen flex items-center justify-center"
      >
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">{t('common.pleaseSignIn')}</h1>
          <Button onClick={() => window.location.href = '/auth'}>
            {t('common.signIn')}
          </Button>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto p-4">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-3xl font-bold">Auri</h1>
          <p className="text-muted-foreground mt-2">{t('auri:welcome', 'Välkommen')}</p>
        </div>
        {subscription && (
          <div className="text-right text-sm">
            <div className="text-xs text-muted-foreground capitalize">
              {subscription.tier} {subscription.tier !== 'free' && '✨'}
            </div>
            {subscription.limits.auriMessages > 0 && (
              <div className="text-xs text-muted-foreground">
                {subscription.limits.auriUsed}/{subscription.limits.auriMessages} this week
              </div>
            )}
          </div>
        )}
      </motion.div>

      <Card className="flex-1 flex flex-col p-4">
        <div className="flex-1 space-y-4 mb-4 overflow-y-auto max-h-[500px]">
          <AnimatePresence mode="popLayout">
            {msgs.length === 0 && !streaming && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center text-muted-foreground py-8"
              >
                <p className="mb-6">{t('auri:welcome', 'Välkommen')}</p>
                <SuggestionButtons onUse={handleSuggestionClick} />
              </motion.div>
            )}
            
            {msgs.map((message, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </motion.div>
            ))}
            
            {streaming && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-muted text-foreground max-w-xs lg:max-w-md px-4 py-3 rounded-2xl">
                  {streamContent ? (
                    <p className="text-sm whitespace-pre-wrap">{streamContent}</p>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Auri tänker...</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div ref={messagesEndRef} />
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center justify-between"
          >
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
          </motion.div>
        )}

        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('auri:inputPlaceholder', 'Skriv ditt meddelande här...')}
            disabled={streaming}
            className="flex-1"
          />
          <motion.div whileTap={{ scale: 0.98 }}>
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
          </motion.div>
        </form>
      </Card>
    </div>
  );
};

export default Chat;