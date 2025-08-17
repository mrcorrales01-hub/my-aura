import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId, analysisType = 'comprehensive' } = await req.json();

    if (!userId) {
      throw new Error('User ID is required');
    }

    console.log('Generating AI predictions for user:', userId);

    // Fetch user data for analysis
    const [moodData, conversationData, appointmentData, profileData] = await Promise.all([
      supabase.from('mood_entries').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(30),
      supabase.from('conversations').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20),
      supabase.from('appointments').select('*').eq('client_id', userId).order('scheduled_at', { ascending: false }).limit(10),
      supabase.from('profiles').select('*').eq('id', userId).single()
    ]);

    if (moodData.error) throw moodData.error;
    if (conversationData.error) throw conversationData.error;
    if (appointmentData.error) throw appointmentData.error;
    if (profileData.error) throw profileData.error;

    const analysisData = {
      moods: moodData.data || [],
      conversations: conversationData.data || [],
      appointments: appointmentData.data || [],
      profile: profileData.data,
      ageGroup: profileData.data?.age_group || 'adult'
    };

    // Generate predictions using OpenAI
    const predictions = await generatePredictions(analysisData, analysisType);

    // Save predictions to database
    const savedPredictions = await Promise.all(
      predictions.map(async (prediction: any) => {
        const { data, error } = await supabase
          .from('ai_predictions')
          .insert({
            user_id: userId,
            prediction_type: prediction.type,
            content: prediction.content,
            confidence_score: prediction.confidence,
            based_on_data: prediction.basedOnData,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      })
    );

    return new Response(JSON.stringify({ predictions: savedPredictions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-predictions function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generatePredictions(data: any, analysisType: string) {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const systemPrompt = `You are an AI therapeutic assistant analyzing patient data to provide personalized therapy recommendations. 

Patient Profile:
- Age Group: ${data.ageGroup}
- Recent Mood Entries: ${data.moods.length}
- Conversation History: ${data.conversations.length} interactions
- Therapy Sessions: ${data.appointments.length} appointments

Analysis Type: ${analysisType}

Based on the provided data, generate 3-5 specific, actionable predictions/recommendations. Each should include:
1. Type (therapy_step, exercise, mood_forecast)
2. Content (detailed recommendation)
3. Confidence score (0.0-1.0)
4. Summary of data used

Format as JSON array with objects containing: type, content, confidence, basedOnData`;

  const userPrompt = `
Mood Data: ${JSON.stringify(data.moods.slice(0, 10))}
Recent Conversations: ${JSON.stringify(data.conversations.slice(0, 5).map(c => ({ message: c.message, response: c.response, context: c.context })))}
Appointment History: ${JSON.stringify(data.appointments.slice(0, 5).map(a => ({ status: a.status, notes: a.session_notes, rating: a.client_rating })))}

Generate personalized therapy predictions.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_completion_tokens: 1500,
      temperature: 0.7
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const result = await response.json();
  const content = result.choices[0].message.content;

  try {
    return JSON.parse(content);
  } catch (e) {
    console.error('Error parsing OpenAI response:', content);
    // Fallback predictions
    return [
      {
        type: 'therapy_step',
        content: 'Continue with regular mood tracking and consider scheduling a follow-up session.',
        confidence: 0.8,
        basedOnData: { source: 'mood_patterns', count: data.moods.length }
      }
    ];
  }
}