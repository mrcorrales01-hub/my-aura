import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper logging function for enhanced debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[AI-COACH] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }
    logStep("OpenAI API key verified");

    // Create Supabase client
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
    logStep("User authenticated", { userId: user.id });

    // Parse request body
    const { message, language = 'en', context = 'general', tone = 'supportive' } = await req.json();
    if (!message) {
      throw new Error("Message is required");
    }
    logStep("Request parsed", { message: message.substring(0, 50), language, context, tone });

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are Auri, a compassionate AI wellness coach specializing in mental health and relationships. 
            
Your approach:
- Be warm, empathetic, and non-judgmental
- Use evidence-based techniques from CBT, DBT, and ACT
- Offer practical tools and coping strategies
- Validate emotions while gently challenging negative thought patterns
- Never diagnose or provide medical advice
- If someone expresses thoughts of self-harm, provide supportive resources and encourage professional help
- Respond in ${language} language
- Maintain a ${tone} tone
- Context: ${context}

Remember: You're here to support, not replace professional therapy. Guide users toward professional help when appropriate.`
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${errorData}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    logStep("OpenAI response received", { length: aiResponse.length });

    // Log conversation to database
    const { error: dbError } = await supabaseClient
      .from('conversations')
      .insert({
        user_id: user.id,
        message,
        response: aiResponse,
        language_preference: language,
        context,
        ai_tone: tone
      });

    if (dbError) {
      console.error('Database logging error:', dbError);
      // Don't fail the request for logging errors
    } else {
      logStep("Conversation logged to database");
    }

    return new Response(JSON.stringify({ 
      response: aiResponse,
      context,
      language 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in ai-coach function", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      fallback: "I'm having trouble connecting right now. Please try again in a moment, or reach out if you need immediate support."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});