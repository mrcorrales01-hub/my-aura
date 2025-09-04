import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'auri';
  timestamp: Date;
}

export function ChatBox() {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: t('chat.thinking'),
      sender: 'auri',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAuriResponse = (userMessage: string): string => {
    // Simple AI responses in different languages
    const responses = {
      sv: [
        "Jag förstår hur du känner. Kan du berätta mer om det?",
        "Det låter utmanande. Hur kan jag hjälpa dig att hantera det här?",
        "Tack för att du delar det med mig. Vad tänker du om att prova en andningsövning?",
        "Jag är här för dig. Skulle du vilja prata om vad som får dig att må bra?",
      ],
      en: [
        "I understand how you're feeling. Can you tell me more about it?",
        "That sounds challenging. How can I help you manage this?",
        "Thank you for sharing that with me. What do you think about trying a breathing exercise?",
        "I'm here for you. Would you like to talk about what makes you feel good?",
      ],
      es: [
        "Entiendo cómo te sientes. ¿Puedes contarme más al respecto?",
        "Eso suena desafiante. ¿Cómo puedo ayudarte a manejar esto?",
        "Gracias por compartir eso conmigo. ¿Qué piensas de probar un ejercicio de respiración?",
        "Estoy aquí para ti. ¿Te gustaría hablar de lo que te hace sentir bien?",
      ],
      da: [
        "Jeg forstår, hvordan du har det. Kan du fortælle mig mere om det?",
        "Det lyder udfordrende. Hvordan kan jeg hjælpe dig med at håndtere dette?",
        "Tak fordi du deler det med mig. Hvad synes du om at prøve en vejrtrækningsøvelse?",
        "Jeg er her for dig. Vil du gerne tale om, hvad der får dig til at have det godt?",
      ],
      no: [
        "Jeg forstår hvordan du har det. Kan du fortelle meg mer om det?",
        "Det høres utfordrende ut. Hvordan kan jeg hjelpe deg med å håndtere dette?",
        "Takk for at du deler det med meg. Hva synes du om å prøve en pusteøvelse?",
        "Jeg er her for deg. Vil du snakke om det som får deg til å føle deg bra?",
      ],
      fi: [
        "Ymmärrän miltä sinusta tuntuu. Voitko kertoa siitä lisää?",
        "Se kuulostaa haastavalta. Miten voin auttaa sinua käsittelemään tätä?",
        "Kiitos kun jaat sen kanssani. Mitä mieltä olet hengitysharjoituksen kokeilemisesta?",
        "Olen täällä sinua varten. Haluaisitko puhua siitä, mikä saa sinut voimaan hyvin?",
      ],
    };

    const currentLang = i18n.language as keyof typeof responses;
    const langResponses = responses[currentLang] || responses.en;
    return langResponses[Math.floor(Math.random() * langResponses.length)];
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const auriResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: getAuriResponse(input),
        sender: 'auri',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, auriResponse]);
      setIsLoading(false);
    }, 1000 + Math.random() * 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[600px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex items-start space-x-3",
              message.sender === 'user' ? "flex-row-reverse space-x-reverse" : ""
            )}
          >
            <div className={cn(
              "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
              message.sender === 'user' 
                ? "bg-primary text-primary-foreground" 
                : "bg-secondary text-secondary-foreground"
            )}>
              {message.sender === 'user' ? (
                <User size={16} />
              ) : (
                <Bot size={16} />
              )}
            </div>
            <Card className={cn(
              "max-w-[80%]",
              message.sender === 'user' ? "bg-primary text-primary-foreground" : ""
            )}>
              <CardContent className="p-3">
                <p className="text-sm">{message.content}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </CardContent>
            </Card>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center">
              <Bot size={16} />
            </div>
            <Card>
              <CardContent className="p-3 flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">{t('chat.thinking')}</span>
              </CardContent>
            </Card>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4">
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('chat.placeholder')}
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={handleSend} 
            disabled={!input.trim() || isLoading}
            size="sm"
          >
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}