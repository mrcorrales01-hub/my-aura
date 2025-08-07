import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    const { message, context = 'general' } = await req.json();

    // Get user preferences for personalized responses
    const { data: preferences } = await supabaseClient
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Build system prompt based on user preferences and context
    let systemPrompt = `You are Aura, a compassionate AI wellness companion focused on emotional and relationship health. `;
    
    if (preferences?.ai_tone === 'empathetic') {
      systemPrompt += `Respond with deep empathy, understanding, and emotional warmth. Use gentle, supportive language.`;
    } else if (preferences?.ai_tone === 'direct') {
      systemPrompt += `Provide clear, direct, and actionable advice while remaining supportive and understanding.`;
    } else if (preferences?.ai_tone === 'encouraging') {
      systemPrompt += `Be uplifting, motivational, and encouraging while providing practical guidance.`;
    } else {
      systemPrompt += `Be supportive, understanding, and helpful with a balanced tone.`;
    }

    if (context === 'mood') {
      systemPrompt += ` The user is sharing their current mood or emotional state. Provide validation, understanding, and gentle guidance.`;
    } else if (context === 'relationship') {
      systemPrompt += ` The user is discussing relationship challenges. Offer practical relationship advice and communication strategies.`;
    } else if (context === 'emergency') {
      systemPrompt += ` This may be a crisis situation. Prioritize safety, provide immediate support resources, and encourage professional help.`;
    }

    systemPrompt += ` Keep responses concise (2-3 sentences max), warm, and actionable. Always prioritize the user's wellbeing.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    const aiResponse = data.choices[0].message.content;

    // Save conversation to database (optional)
    await supabaseClient.from('conversations').insert({
      user_id: user.id,
      user_message: message,
      ai_response: aiResponse,
      context: context,
      created_at: new Date().toISOString()
    }).catch(console.error); // Don't fail if conversation saving fails

    return new Response(JSON.stringify({ 
      response: aiResponse,
      context: context 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-coach function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      response: "I'm sorry, I'm having trouble right now. Please try again in a moment, or contact support if this continues." 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});