import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Languages, Send, Volume2 } from 'lucide-react';
import { useI18n } from '@/hooks/useMultilingualI18n';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  originalLanguage?: string;
  translatedText?: string;
  isTranslated?: boolean;
}

interface MultilingualChatProps {
  title?: string;
  context?: 'therapy' | 'coaching' | 'crisis';
  onTranslationToggle?: (enabled: boolean) => void;
}

export const MultilingualChat: React.FC<MultilingualChatProps> = ({
  title,
  context = 'coaching',
  onTranslationToggle
}) => {
  const { t, currentLanguage, currentLang } = useI18n();
  const { translateText, loading: translating } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [autoTranslate, setAutoTranslate] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
      originalLanguage: currentLanguage
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Get AI response in user's language
      const { data, error } = await supabase.functions.invoke('ai-coach', {
        body: {
          message: inputText,
          language: currentLanguage,
          context: context,
          conversationHistory: messages.slice(-10)
        }
      });

      if (error) throw error;

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        sender: 'ai',
        timestamp: new Date(),
        originalLanguage: currentLanguage
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: t('errors.general'),
        sender: 'ai',
        timestamp: new Date(),
        originalLanguage: currentLanguage
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTranslateMessage = async (messageId: string, targetLang: string) => {
    const message = messages.find(m => m.id === messageId);
    if (!message || message.isTranslated) return;

    try {
      const result = await translateText(
        message.text,
        targetLang,
        message.originalLanguage || 'auto',
        'chat'
      );

      if (result) {
        setMessages(prev => prev.map(m => 
          m.id === messageId 
            ? { 
                ...m, 
                translatedText: result.translatedText,
                isTranslated: true
              }
            : m
        ));
      }
    } catch (error) {
      console.error('Translation error:', error);
    }
  };

  const speakText = (text: string, lang: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      speechSynthesis.speak(utterance);
    }
  };

  const toggleAutoTranslate = () => {
    const newValue = !autoTranslate;
    setAutoTranslate(newValue);
    onTranslationToggle?.(newValue);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {title || t('chat.title')}
            <Badge variant="outline" className="flex items-center gap-1">
              {currentLang.flag} {currentLang.nativeName}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={autoTranslate ? "default" : "outline"}
              size="sm"
              onClick={toggleAutoTranslate}
              className="flex items-center gap-1"
            >
              <Languages className="w-4 h-4" />
              {t('translation.autoTranslate')}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <Languages className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('chat.subtitle')}</p>
                <p className="text-sm mt-2">{t('chat.disclaimer')}</p>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <div className="text-sm">
                    {message.isTranslated ? message.translatedText : message.text}
                  </div>
                  
                  <div className="flex items-center justify-between mt-2 gap-2">
                    <span className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                    
                    <div className="flex items-center gap-1">
                      {message.originalLanguage && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => speakText(
                            message.isTranslated ? message.translatedText! : message.text,
                            message.originalLanguage!
                          )}
                          className="h-6 w-6 p-0"
                        >
                          <Volume2 className="w-3 h-3" />
                        </Button>
                      )}
                      
                      {!message.isTranslated && message.originalLanguage !== currentLanguage && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTranslateMessage(message.id, currentLanguage)}
                          disabled={translating}
                          className="h-6 w-6 p-0"
                        >
                          <Languages className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                    {t('chat.thinking')}
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t('chat.placeholder')}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isLoading}
              className={currentLang.rtl ? 'text-right' : 'text-left'}
              dir={currentLang.rtl ? 'rtl' : 'ltr'}
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={isLoading || !inputText.trim()}
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};