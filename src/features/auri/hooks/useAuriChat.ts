import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { streamAuri } from '../getAuriResponse';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const useAuriChat = () => {
  const { i18n } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading] = useState(false);

  const sendMessage = useCallback(async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Create AI message placeholder
      const aiMessageId = (Date.now() + 1).toString();
      const aiMessage: Message = {
        id: aiMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);

      // Stream response
      await streamAuri(
        { 
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
          lang: i18n.language 
        },
        (token: string) => {
          setMessages(prev => prev.map(msg => 
            msg.id === aiMessageId 
              ? { ...msg, content: msg.content + token }
              : msg
          ));
        }
      );
    } catch (error) {
      console.error('Chat error:', error);
      // Fallback response
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Tack för att du delar det med mig. Som din AI-coach vill jag hjälpa dig att utforska dessa känslor. Kan du berätta mer om vad som fick dig att känna så här idag?`,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev.slice(0, -1), fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [messages, i18n.language]);

  return {
    messages,
    isTyping,
    isLoading,
    sendMessage,
  };
};