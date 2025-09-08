import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Health check mode - no token spend
  const url = new URL(req.url);
  if (url.searchParams.get('mode') === 'health') {
    const hasOpenAIKey = !!Deno.env.get('OPENAI_API_KEY');
    return new Response(
      JSON.stringify({ ok: true, hasOpenAIKey }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'x-demo-mode': hasOpenAIKey ? '0' : '1'
        }
      }
    );
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

    const { messages, lang = 'sv', system, temperature = 0.7, max_tokens = 500 } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      throw new Error('Messages array is required');
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    // Demo mode if no API key
    if (!openaiApiKey) {
      console.log('Demo mode: No OpenAI API key found');
      
      const demoResponse = lang === 'sv' 
        ? "Hej! Jag är i demo-läge eftersom OpenAI API-nyckeln saknas. I den riktiga versionen skulle jag ge personlig vägledning för mental hälsa. Lägg till din OpenAI API-nyckel i Supabase Edge Function Secrets för att aktivera full funktionalitet."
        : "Hello! I'm in demo mode because the OpenAI API key is missing. In the full version, I would provide personalized mental health guidance. Add your OpenAI API key to Supabase Edge Function Secrets to enable full functionality.";

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          // Send response in chunks to simulate streaming
          const words = demoResponse.split(' ');
          let index = 0;
          
          const sendNext = () => {
            if (index < words.length) {
              const token = words[index] + (index < words.length - 1 ? ' ' : '');
              const tokenData = `data: ${JSON.stringify({ type: 'token', content: token })}\n\n`;
              controller.enqueue(encoder.encode(tokenData));
              index++;
              setTimeout(sendNext, 50); // Simulate typing delay
            } else {
              const doneData = `data: ${JSON.stringify({ type: 'done' })}\n\n`;
              controller.enqueue(encoder.encode(doneData));
              controller.close();
            }
          };
          
          sendNext();
        }
      });

      return new Response(stream, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'x-demo-mode': '1'
        },
      });
    }

    // Create system message with safety instructions
    const defaultSystem = `You are Auri, a compassionate AI wellness coach. Respond in ${lang === 'sv' ? 'Swedish' : lang === 'es' ? 'Spanish' : lang === 'no' ? 'Norwegian' : lang === 'da' ? 'Danish' : lang === 'fi' ? 'Finnish' : 'English'}. 

IMPORTANT: You are not a substitute for professional medical advice. In emergencies, always direct users to contact emergency services or crisis helplines.

Be supportive, empathetic, and concise (2-3 sentences typically). Help with mental health, relationships, and emotional wellbeing. If you detect crisis keywords, be extra supportive and gently suggest professional help.

Maintain a warm, non-judgmental tone while being helpful and encouraging.`;

    const systemMessage: ChatMessage = {
      role: 'system',
      content: system || defaultSystem
    };

    const conversationMessages: ChatMessage[] = [
      systemMessage,
      ...messages.slice(-10) // Keep last 10 messages for context
    ];

    // Call OpenAI streaming API
    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: conversationMessages,
        max_tokens,
        temperature,
        stream: true,
      }),
    });

    if (!openAiResponse.ok) {
      const errorText = await openAiResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API failed: ${openAiResponse.status}`);
    }

    // Create streaming response
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    let fullResponse = '';
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
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
                  // Save messages to database
                  try {
                    // Save user message
                    if (messages.length > 0) {
                      const userMessage = messages[messages.length - 1];
                      await supabaseClient
                        .from('messages')
                        .insert({
                          user_id: user.id,
                          session_id: null, // Will be updated when sessions are implemented
                          role: 'user',
                          content: userMessage.content,
                          language: lang
                        });
                    }

                    // Save assistant response
                    if (fullResponse.trim()) {
                      await supabaseClient
                        .from('messages')
                        .insert({
                          user_id: user.id,
                          session_id: null,
                          role: 'assistant',
                          content: fullResponse.trim(),
                          language: lang
                        });
                    }
                  } catch (dbError) {
                    console.error('Database save error:', dbError);
                  }
                  
                  const doneData = `data: ${JSON.stringify({ type: 'done' })}\n\n`;
                  controller.enqueue(encoder.encode(doneData));
                  controller.close();
                  return;
                }

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    fullResponse += content;
                    const tokenData = `data: ${JSON.stringify({ type: 'token', content })}\n\n`;
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