import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, tone, language, voice, context, sessionId } = await req.json();

    console.log('Voice AI Coach request:', { message, tone, language, voice, context });

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("Invalid token or user not found");
    }

    // Enhanced system prompt for voice AI coaching
    const systemPrompt = `You are Auri, an advanced AI wellness coach and mental health companion. You provide empathetic, evidence-based support with the following characteristics:

TONE: ${tone || 'supportive'} - Adjust your communication style accordingly:
- supportive: Warm, validating, and encouraging
- professional: Clinical, structured, evidence-based
- motivational: Inspiring, energetic, action-oriented  
- friendly: Casual, approachable, conversational

CONTEXT: ${context || 'general therapy session'}

KEY PRINCIPLES:
1. Always prioritize user safety and well-being
2. Provide practical, actionable advice
3. Use therapeutic techniques like CBT, mindfulness, DBT when appropriate
4. Acknowledge emotions and validate experiences
5. Encourage professional help when needed
6. Keep responses conversational and engaging for voice interaction
7. Use appropriate pauses and natural speech patterns

LANGUAGE: Respond in a way that's natural for voice conversation, avoiding overly clinical language unless in professional tone.

If you detect crisis language or severe mental health concerns, always recommend immediate professional help or crisis resources.

Remember: You're having a voice conversation, so keep responses natural, warm, and conversational.`;

    // Generate AI response
    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error("Failed to generate AI response");
    }

    const aiData = await aiResponse.json();
    const responseText = aiData.choices[0].message.content;

    // Generate speech from AI response
    const ttsResponse = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1-hd',
        input: responseText,
        voice: voice || 'alloy',
        response_format: 'mp3',
        speed: 1.0,
      }),
    });

    let audioContent = null;
    if (ttsResponse.ok) {
      const arrayBuffer = await ttsResponse.arrayBuffer();
      audioContent = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    }

    // Log conversation to database
    try {
      await supabase.from("conversations").insert({
        user_id: user.id,
        message: message,
        response: responseText,
        language_preference: language || 'en',
        context: context || 'voice_ai_coach',
        ai_tone: tone || 'supportive'
      });
    } catch (dbError) {
      console.error("Error logging conversation:", dbError);
    }

    console.log('Voice AI Coach response generated successfully');

    return new Response(
      JSON.stringify({
        response: responseText,
        audioContent: audioContent,
        voice: voice || 'alloy',
        tone: tone || 'supportive',
        language: language || 'en'
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Voice AI Coach error:", error);
    
    const fallbackResponse = "I'm having trouble connecting right now, but I'm here to support you. Please try again in a moment, or reach out to a human counselor if you need immediate assistance.";
    
    return new Response(
      JSON.stringify({
        error: error.message,
        fallbackResponse: fallbackResponse,
        response: fallbackResponse
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});