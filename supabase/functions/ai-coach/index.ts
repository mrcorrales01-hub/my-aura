import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, tone = 'supportive', sessionId, context = 'general' } = await req.json();
    
    if (!message) {
      throw new Error('Message is required');
    }

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    // Get conversation history for context
    const { data: conversationHistory } = await supabaseClient
      .from('conversations')
      .select('message, response, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    // Define tone-specific system prompts
    const tonePrompts = {
      supportive: `You are Auri, a compassionate AI mental health coach. You provide empathetic, supportive responses that validate feelings while offering gentle guidance. Use warm, caring language and focus on emotional support and self-compassion.`,
      professional: `You are Auri, a professional AI mental health coach. You provide evidence-based guidance with a clinical but warm approach. Use psychological techniques and structured responses while maintaining professionalism.`,
      motivational: `You are Auri, an inspiring AI mental health coach. You provide energetic, positive responses that encourage action and growth. Use uplifting language and focus on empowerment and achieving goals.`,
      friendly: `You are Auri, a friendly AI mental health coach. You provide casual, approachable responses like a trusted friend who also happens to be a wellness expert. Use conversational language while offering helpful insights.`
    };

    const systemPrompt = tonePrompts[tone as keyof typeof tonePrompts] || tonePrompts.supportive;

    // Build conversation context
    const contextMessages = conversationHistory
      ?.reverse()
      ?.map(conv => [
        { role: 'user', content: conv.message },
        { role: 'assistant', content: conv.response }
      ]).flat() || [];

    const messages = [
      { role: 'system', content: `${systemPrompt}

Key guidelines:
- Always prioritize user safety and wellbeing
- If someone expresses suicidal thoughts or self-harm, immediately recommend they contact emergency services or crisis hotlines
- Provide practical, actionable advice when appropriate
- Ask follow-up questions to better understand the user's situation
- Remember you're not a replacement for professional therapy, but a supportive companion
- Be culturally sensitive and non-judgmental
- Keep responses concise but meaningful (2-4 sentences typically)
- Use the user's name occasionally if provided in context` },
      ...contextMessages.slice(-8), // Last 4 exchanges for context
      { role: 'user', content: message }
    ];

    console.log('Sending request to OpenAI:', { 
      model: 'gpt-5-2025-08-07', 
      messageCount: messages.length,
      tone,
      context 
    });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: messages,
        max_completion_tokens: 300,
        presence_penalty: 0.3,
        frequency_penalty: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status} ${errorData}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('AI response generated successfully');

    // Store conversation in database
    const { error: insertError } = await supabaseClient
      .from('conversations')
      .insert({
        user_id: user.id,
        message: message,
        response: aiResponse,
        language_preference: 'en', // TODO: Get from user preferences
        context: context,
        ai_tone: tone
      });

    if (insertError) {
      console.error('Error storing conversation:', insertError);
      // Don't throw error here, still return the response
    }

    return new Response(JSON.stringify({ 
      response: aiResponse,
      sessionId: sessionId || crypto.randomUUID(),
      tone: tone
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-coach function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      fallbackResponse: "I'm having trouble connecting right now, but I'm here to support you. Please try again in a moment, or if you're in crisis, please reach out to a human counselor or emergency services immediately."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});