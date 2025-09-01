import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Cache-Control': 'no-cache',
  'Connection': 'keep-alive',
};

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    // Verify user authentication
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { session_id, user_text, lang = 'sv' } = await req.json();

    let sessionId = session_id;

    // Create new session if none provided
    if (!sessionId) {
      const { data: newSession, error: sessionError } = await supabaseClient
        .from('sessions')
        .insert({ user_id: user.id, lang })
        .select('id')
        .single();

      if (sessionError) {
        console.error('Session creation error:', sessionError);
        throw new Error('Failed to create session');
      }
      sessionId = newSession.id;
    }

    // Get recent messages for context (last 30 days, max 20 messages)
    const { data: recentMessages, error: messagesError } = await supabaseClient
      .from('messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true })
      .limit(20);

    if (messagesError) {
      console.error('Messages fetch error:', messagesError);
    }

    // Save user message
    await supabaseClient
      .from('messages')
      .insert({
        session_id: sessionId,
        role: 'user',
        content: user_text,
        tokens: user_text.split(/\s+/).length
      });

    // Crisis detection
    const crisisKeywords = ['suicide', 'kill myself', 'end it all', 'hurt myself', 'self harm', 'självmord', 'döda mig', 'skada mig'];
    const isCrisis = crisisKeywords.some(keyword => 
      user_text.toLowerCase().includes(keyword.toLowerCase())
    );

    // Build messages for OpenAI
    const systemMessage: ChatMessage = {
      role: 'system',
      content: `You are Auri, a compassionate AI wellness coach. Respond in ${lang === 'sv' ? 'Swedish' : 'English'}. Be supportive, empathetic, and concise. ${
        isCrisis 
          ? 'IMPORTANT: The user may be in crisis. Be extra supportive and gently suggest professional help or emergency services if needed. Show empathy but prioritize their safety.'
          : 'Help users with mental health, relationships, and emotional wellbeing.'
      }`
    };

    const conversationMessages: ChatMessage[] = [
      systemMessage,
      ...(recentMessages || []).slice(-10), // Last 10 messages for context
      { role: 'user', content: user_text }
    ];

    // Call OpenAI streaming API
    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: conversationMessages,
        max_tokens: 500,
        temperature: 0.7,
        stream: true,
      }),
    });

    if (!openAiResponse.ok) {
      console.error('OpenAI API error:', await openAiResponse.text());
      throw new Error('OpenAI API failed');
    }

    // Create streaming response
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    let fullResponse = '';
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send session_id first
          const sessionData = `data: ${JSON.stringify({ session_id: sessionId, type: 'session' })}\n\n`;
          controller.enqueue(encoder.encode(sessionData));

          const reader = openAiResponse.body?.getReader();
          if (!reader) throw new Error('No response body');

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  // Save assistant response
                  if (fullResponse.trim()) {
                    await supabaseClient
                      .from('messages')
                      .insert({
                        session_id: sessionId,
                        role: 'assistant',
                        content: fullResponse.trim(),
                        tokens: fullResponse.split(/\s+/).length
                      });
                  }
                  
                  const doneData = `data: ${JSON.stringify({ type: 'done', session_id: sessionId })}\n\n`;
                  controller.enqueue(encoder.encode(doneData));
                  controller.close();
                  return;
                }

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    fullResponse += content;
                    const tokenData = `data: ${JSON.stringify({ type: 'token', content, session_id: sessionId })}\n\n`;
                    controller.enqueue(encoder.encode(tokenData));
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        } catch (error) {
          console.error('Stream error:', error);
          const errorData = `data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`;
          controller.enqueue(encoder.encode(errorData));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error in auri-chat:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});