import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, language = 'en', context = 'general', tone = 'empathetic', mood } = await req.json();

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get user from token
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Enhanced system prompt for mental health coaching
    const systemPrompt = `You are Auri, a compassionate AI wellness coach specialized in mental health support. You provide:

TONE: ${tone} - Be warm, understanding, and supportive
LANGUAGE: Respond in ${language}
CONTEXT: ${context}
USER MOOD: ${mood || 'unknown'}

Guidelines:
- Use active listening techniques and validate emotions
- Ask thoughtful follow-up questions to encourage self-reflection
- Offer practical, evidence-based coping strategies
- Reference CBT, DBT, and mindfulness techniques when appropriate
- Always prioritize user safety - if crisis detected, recommend professional help
- Be culturally sensitive and adapt to the user's background
- Keep responses concise but meaningful (2-3 paragraphs max)
- Use encouraging, hopeful language while acknowledging difficulties
- Never diagnose or provide medical advice
- Always end with a supportive question or gentle invitation to share more

If the user expresses suicidal thoughts or self-harm, immediately provide crisis resources and encourage seeking professional help.`;

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!openAIResponse.ok) {
      throw new Error('OpenAI API error');
    }

    const aiData = await openAIResponse.json();
    const response = aiData.choices[0].message.content;

    // Log conversation to database
    await supabaseClient.rpc('log_ai_interaction', {
      p_user_id: user.id,
      p_message: message,
      p_response: response,
      p_language: language,
      p_context: context,
      p_ai_tone: tone
    });

    return new Response(JSON.stringify({ response }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('AI Coach Error:', error);
    
    // Fallback response for safety
    const fallbackResponse = language === 'es' 
      ? "Estoy aquí para escucharte. ¿Podrías contarme más sobre cómo te sientes?"
      : language === 'fr'
      ? "Je suis là pour vous écouter. Pouvez-vous me dire comment vous vous sentez?"
      : "I'm here to listen to you. Could you tell me more about how you're feeling?";

    return new Response(JSON.stringify({ 
      response: fallbackResponse,
      error: 'I apologize, but I\'m having trouble connecting right now. If you\'re in crisis, please contact emergency services or a crisis helpline.' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200, // Still return 200 to provide fallback response
    });
  }
});