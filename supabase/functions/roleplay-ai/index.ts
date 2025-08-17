import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      message, 
      scenario, 
      persona, 
      conversationHistory = [],
      userId 
    } = await req.json();

    console.log('Roleplay AI request:', { scenario, persona, messageLength: message.length });

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    // Build conversation context
    const systemPrompt = `You are roleplaying as: ${persona}

SCENARIO: ${scenario}

ROLEPLAY INSTRUCTIONS:
- Stay completely in character as the described persona
- Respond naturally and authentically to the user's messages
- Create realistic dialogue that helps the user practice real-life situations
- Be supportive but challenging when appropriate for the scenario
- Keep responses conversational and not overly long (2-3 sentences max)
- Adapt your communication style to match the scenario context
- Help the user build confidence through realistic practice

IMPORTANT: You are NOT an AI assistant. You are the character described in the persona. Do not break character or mention that this is roleplay practice.`;

    // Build message history for context
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: messages,
        max_completion_tokens: 150,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Generate feedback for the user's message
    const feedbackPrompt = `Analyze this roleplay practice message for communication effectiveness:

User's message: "${message}"
Scenario context: "${scenario}"

Provide brief feedback on:
1. Communication confidence (rate 1-100)
2. One strength they showed
3. One area for improvement
4. Overall tone assessment

Format as JSON: {"confidence": number, "strength": "text", "improvement": "text", "tone": "text"}`;

    const feedbackResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [{ role: 'user', content: feedbackPrompt }],
        max_completion_tokens: 100,
        temperature: 0.3,
      }),
    });

    let feedback = null;
    if (feedbackResponse.ok) {
      const feedbackData = await feedbackResponse.json();
      try {
        feedback = JSON.parse(feedbackData.choices[0].message.content);
      } catch (e) {
        console.log('Failed to parse feedback JSON:', e);
      }
    }

    // Log the conversation if userId is provided
    if (userId) {
      await supabase.from('conversations').insert({
        user_id: userId,
        message: message,
        response: aiResponse,
        context: `roleplay_${scenario}`,
        language_preference: 'en',
        ai_tone: 'roleplay'
      });
    }

    console.log('Roleplay response generated successfully');

    return new Response(JSON.stringify({
      response: aiResponse,
      feedback: feedback,
      scenario: scenario
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in roleplay-ai function:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Internal server error',
      response: "I'm having trouble staying in character right now. Let's try that again?"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});