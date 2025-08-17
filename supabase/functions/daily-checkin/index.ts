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
    const { mood, energy, stress, notes, checkinType = 'daily' } = await req.json();
    
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

    // Store mood entry
    const { error: moodError } = await supabaseClient
      .from('mood_entries')
      .insert({
        user_id: user.id,
        mood_id: mood || 'neutral',
        mood_value: energy || 5,
        notes: notes || ''
      });

    if (moodError) {
      console.error('Error storing mood entry:', moodError);
    }

    // Generate personalized AI response based on check-in data
    const checkinData = {
      mood: mood || 'not specified',
      energy: energy || 'not specified',
      stress: stress || 'not specified',
      notes: notes || 'none provided',
      time: new Date().toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    };

    // Get recent mood trends for context
    const { data: recentMoods } = await supabaseClient
      .from('mood_entries')
      .select('mood_id, mood_value, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(7);

    const trendInfo = recentMoods && recentMoods.length > 1 
      ? `Recent mood pattern: ${recentMoods.slice(0, 3).map(m => m.mood_id).join(' → ')}`
      : 'First check-in or limited history';

    const systemPrompt = `You are Auri, a caring AI wellness assistant providing personalized daily check-in responses. Respond warmly and personally to the user's mood and feelings.

Current check-in data:
- Mood: ${checkinData.mood}
- Energy level: ${checkinData.energy}/10
- Stress level: ${checkinData.stress}/10
- Additional notes: ${checkinData.notes}
- Time: ${checkinData.time}
- ${trendInfo}

Guidelines:
- Acknowledge their current emotional state with empathy
- Provide 1-2 actionable suggestions based on their mood/energy/stress
- Keep response encouraging and supportive (2-3 sentences)
- If stress/mood is concerning, suggest helpful resources
- End with a gentle question or affirmation
- Be conversational and warm, like a caring friend`;

    console.log('Generating personalized check-in response');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `I'm checking in. Here's how I'm feeling: mood is ${checkinData.mood}, energy at ${checkinData.energy}/10, stress at ${checkinData.stress}/10. ${checkinData.notes ? `Additional thoughts: ${checkinData.notes}` : ''}` }
        ],
        max_completion_tokens: 200,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Store the check-in conversation
    const { error: conversationError } = await supabaseClient
      .from('conversations')
      .insert({
        user_id: user.id,
        message: `Daily check-in: mood=${mood}, energy=${energy}/10, stress=${stress}/10. ${notes || ''}`,
        response: aiResponse,
        language_preference: 'en',
        context: 'daily_checkin',
        ai_tone: 'supportive'
      });

    if (conversationError) {
      console.error('Error storing conversation:', conversationError);
    }

    // Generate motivational reminder for later
    const reminderPrompts = {
      low_energy: "Remember, low energy days are part of the human experience. Small steps count too! 🌱",
      high_stress: "When stress feels overwhelming, try the 4-7-8 breathing technique. You've got this! 💪",
      positive: "Your positive energy is wonderful to see! Keep nurturing what brings you joy. ✨",
      default: "Every day is a new opportunity for growth and self-compassion. Be gentle with yourself. 🤗"
    };

    let reminderKey = 'default';
    if (energy && energy < 4) reminderKey = 'low_energy';
    else if (stress && stress > 7) reminderKey = 'high_stress';
    else if (mood && ['happy', 'excited', 'grateful'].includes(mood)) reminderKey = 'positive';

    return new Response(JSON.stringify({ 
      response: aiResponse,
      reminder: reminderPrompts[reminderKey],
      trends: {
        moodStreak: recentMoods?.length || 0,
        averageEnergy: recentMoods?.reduce((sum, entry) => sum + (entry.mood_value || 5), 0) / (recentMoods?.length || 1)
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in daily-checkin function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      fallbackResponse: "Thank you for checking in! I'm having trouble connecting right now, but I appreciate you taking time for your wellbeing. Keep up the great work! 🌟"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});