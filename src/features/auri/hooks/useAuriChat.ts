import React, { useState, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AuriResponse {
  content: string;
  context?: any;
}

export const useAuriChat = (sessionId?: string) => {
  const { user } = useAuthContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Load chat history
  const { data: chatHistory, isLoading } = useQuery({
    queryKey: ['auri-chat', sessionId],
    queryFn: async () => {
      if (!user) return [];
      
      const query = supabase
        .from('messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      
      if (sessionId) {
        query.eq('session_id', sessionId);
      }
      
      const { data, error } = await query.limit(50);
      
      if (error) throw error;
      
      return data?.map(msg => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        timestamp: new Date(msg.created_at)
      })) || [];
    },
    enabled: !!user
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error('User not authenticated');
      
      // Add user message to local state immediately
      const userMessage: Message = {
        id: `temp-${Date.now()}`,
        role: 'user',
        content,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setIsTyping(true);

      try {
        // Call Auri AI service
        const response = await getAuriResponse(content, {
          userId: user.id,
          sessionId,
          language: 'sv' // TODO: Get from user preferences
        });

        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant', 
          content: response.content,
          timestamp: new Date()
        };

        // Save both messages to database
        await Promise.all([
          supabase.from('messages').insert({
            user_id: user.id,
            session_id: sessionId,
            role: 'user',
            content: content,
            language: 'sv'
          }),
          supabase.from('messages').insert({
            user_id: user.id,
            session_id: sessionId,
            role: 'assistant',
            content: response.content,
            language: 'sv',
            context: response.context
          })
        ]);

        setMessages(prev => [...prev, assistantMessage]);
        return response;
        
      } catch (error) {
        console.error('Auri chat error:', error);
        
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: 'Ursäkta, jag kunde inte svara just nu. Försök igen senare.',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, errorMessage]);
        throw error;
      } finally {
        setIsTyping(false);
      }
    }
  });

  // Clear chat
  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  // Initialize messages from history
  React.useEffect(() => {
    if (chatHistory) {
      setMessages(chatHistory);
    }
  }, [chatHistory]);

  return {
    messages,
    isLoading,
    isTyping,
    sendMessage: sendMessageMutation.mutate,
    isError: sendMessageMutation.isError,
    error: sendMessageMutation.error,
    clearChat
  };
};

// Auri AI Response Service
async function getAuriResponse(
  message: string, 
  context: { userId: string; sessionId?: string; language: string }
): Promise<AuriResponse> {
  // Check if OpenAI API key is configured
  const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!openaiKey) {
    return {
      content: "Hej! Jag är Auri, din AI-coach. För tillfället är min AI-funktionalitet inte helt konfigurerad, men jag finns här för att lyssna. Berätta gärna hur du mår idag!",
      context: { fallback: true }
    };
  }

  try {
    // Call Supabase Edge Function for AI response
    const { data, error } = await supabase.functions.invoke('auri-chat', {
      body: {
        message,
        context,
        language: context.language
      }
    });

    if (error) throw error;

    return {
      content: data.response || "Jag förstår. Kan du berätta mer?",
      context: data.context
    };
  } catch (error) {
    console.error('Auri API error:', error);
    
    // Fallback responses based on message content
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('mår') || lowerMessage.includes('känner')) {
      return {
        content: "Tack för att du delar med dig. Det är viktigt att prata om sina känslor. Vill du berätta mer om vad som påverkar dig just nu?",
        context: { fallback: true, type: 'feelings' }
      };
    }
    
    if (lowerMessage.includes('stress') || lowerMessage.includes('orolig')) {
      return {
        content: "Jag förstår att du känner dig stressad eller orolig. Det är normalt att ha sådana känslor ibland. Har du provat några avslappningstekniker?",
        context: { fallback: true, type: 'stress' }
      };
    }
    
    return {
      content: "Jag lyssnar på dig. Även om min AI-funktionalitet inte är helt tillgänglig just nu, så kan du alltid skriva dina tankar här. Vad skulle hjälpa dig att känna dig bättre idag?",
      context: { fallback: true }
    };
  }
}