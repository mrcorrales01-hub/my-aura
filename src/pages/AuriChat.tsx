import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuriChat } from '@/features/auri/hooks/useAuriChat';
import { SuggestionButtons } from '@/features/auri/components/SuggestionButtons';
import { Send, Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const AuriChat = () => {
  const { t } = useTranslation(['auri', 'common']);
  const [inputMessage, setInputMessage] = useState('');
  const { messages, isTyping, sendMessage, isLoading } = useAuriChat();

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;
    
    const message = inputMessage.trim();
    setInputMessage('');
    
    try {
      await sendMessage(message);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleSuggestionClick = (prompt: string) => {
    setInputMessage(prompt);
    sendMessage(prompt);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center py-6">
        <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <Bot className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold mb-2">{t('auri:title')}</h1>
        <p className="text-muted-foreground">{t('auri:subtitle')}</p>
      </div>

      {/* Chat Interface */}
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Auri
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <Bot className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-6">{t('auri:welcome')}</p>
                    
                    {/* Quick Suggestions */}
                    <div className="max-w-md mx-auto">
                      <SuggestionButtons onUse={handleSuggestionClick} />
                    </div>
                  </div>
                )}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3 max-w-[80%]",
                      message.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                      message.role === 'user' 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted text-muted-foreground"
                    )}>
                      {message.role === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>
                    
                    <div className={cn(
                      "rounded-lg p-3 prose prose-sm max-w-none",
                      message.role === 'user'
                        ? "bg-primary text-primary-foreground ml-2"
                        : "bg-muted text-foreground mr-2"
                    )}>
                      <p className="m-0 whitespace-pre-wrap">{message.content}</p>
                      <div className="text-xs opacity-70 mt-2">
                        {message.timestamp.toLocaleTimeString('sv-SE', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-3 max-w-[80%] mr-auto">
                    <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-muted rounded-lg p-3 mr-2">
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-muted-foreground">{t('auri:thinking')}</span>
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
                          <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                          <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t p-4">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={t('auri:placeholder')}
                className="flex-1"
                disabled={isTyping}
              />
              <Button 
                type="submit" 
                size="sm" 
                disabled={!inputMessage.trim() || isTyping}
              >
                <Send className="w-4 h-4" />
                <span className="sr-only">{t('auri:send')}</span>
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuriChat;