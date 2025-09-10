import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Security-Policy': "default-src 'self'; connect-src 'self' https://api.openai.com; script-src 'self'; style-src 'self' 'unsafe-inline'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const mode = url.searchParams.get('mode');
    
    // Health mode - don't call OpenAI
    if (mode === 'health') {
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

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get user
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    const { message, sessionId, language = 'sv' } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    // Demo mode if no OpenAI key
    if (!openAIApiKey) {
      const demoResponse = language === 'sv' 
        ? `Hej! Jag är Auri, din AI-välmåendekompanjon. Detta är en demo-version. För att aktivera full funktionalitet behövs en OpenAI API-nyckel. Hur kan jag hjälpa dig idag?`
        : `Hello! I'm Auri, your AI wellness companion. This is a demo version. To activate full functionality, an OpenAI API key is needed. How can I help you today?`;

      // Save demo messages
      await supabaseClient.from('messages').insert([
        { user_id: user.id, session_id: sessionId, role: 'user', content: message },
        { user_id: user.id, session_id: sessionId, role: 'assistant', content: demoResponse }
      ]);

      return new Response(
        `data: ${JSON.stringify({ content: demoResponse, done: true })}\n\n`,
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'x-demo-mode': '1'
          },
        }
      );
    }

    // Save user message
    await supabaseClient.from('messages').insert({
      user_id: user.id,
      session_id: sessionId,
      role: 'user',
      content: message
    });

    // Get recent conversation history
    const { data: recentMessages } = await supabaseClient
      .from('messages')
      .select('role, content')
      .eq('user_id', user.id)
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(10);

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `You are Auri, a compassionate AI wellness companion. You provide emotional support, mindfulness guidance, and wellness advice. Always respond in ${language === 'sv' ? 'Swedish' : language === 'en' ? 'English' : language === 'es' ? 'Spanish' : language === 'no' ? 'Norwegian' : language === 'da' ? 'Danish' : 'Finnish'}. Be warm, empathetic, and supportive. Keep responses concise and actionable.`
      },
      ...(recentMessages?.reverse() || [])
    ];

    // Call OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 500,
        temperature: 0.7,
        stream: true
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const readable = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) return;
        
        let assistantMessage = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = new TextDecoder().decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  // Save assistant message
                  if (assistantMessage.trim()) {
                    await supabaseClient.from('messages').insert({
                      user_id: user.id,
                      session_id: sessionId,
                      role: 'assistant',
                      content: assistantMessage
                    });
                  }
                  controller.enqueue(`data: ${JSON.stringify({ done: true })}\n\n`);
                  return;
                }

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    assistantMessage += content;
                    controller.enqueue(`data: ${JSON.stringify({ content })}\n\n`);
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'x-demo-mode': '0'
      },
    });

  } catch (error) {
    console.error('Error in auri-chat function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});