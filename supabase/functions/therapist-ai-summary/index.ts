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
    const { patientId, timeRange = '30' } = await req.json();
    
    console.log('Generating AI summary for patient:', patientId);

    // Get patient conversations
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('message, response, created_at, context, ai_tone')
      .eq('user_id', patientId)
      .gte('created_at', new Date(Date.now() - parseInt(timeRange) * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(50);

    if (convError) {
      console.error('Error fetching conversations:', convError);
      throw new Error('Failed to fetch conversations');
    }

    // Get mood entries
    const { data: moodEntries, error: moodError } = await supabase
      .from('mood_entries')
      .select('mood_value, mood_id, notes, created_at')
      .eq('user_id', patientId)
      .gte('created_at', new Date(Date.now() - parseInt(timeRange) * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (moodError) {
      console.error('Error fetching mood entries:', moodError);
      throw new Error('Failed to fetch mood entries');
    }

    // Get patient profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', patientId)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      throw new Error('Failed to fetch profile');
    }

    // Prepare data for AI analysis
    const conversationSummary = conversations?.map(c => ({
      topic: c.context || 'general',
      userMessage: c.message,
      aiResponse: c.response,
      tone: c.ai_tone,
      date: c.created_at
    })) || [];

    const moodSummary = moodEntries?.map(m => ({
      mood: m.mood_value,
      moodType: m.mood_id,
      notes: m.notes,
      date: m.created_at
    })) || [];

    // Generate AI summary using OpenAI
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `
    As a mental health professional, analyze the following patient data and provide a comprehensive summary for a therapist:

    Patient: ${profile.full_name}
    Time Range: Last ${timeRange} days
    
    MOOD DATA (${moodSummary.length} entries):
    ${moodSummary.map(m => `• ${m.date}: Mood ${m.mood}/10 (${m.moodType}) - ${m.notes || 'No notes'}`).join('\n')}

    AI CONVERSATION DATA (${conversationSummary.length} conversations):
    ${conversationSummary.map(c => `• ${c.date} [${c.topic}]: "${c.userMessage.substring(0, 100)}..." -> AI responded with ${c.tone} tone`).join('\n')}

    Please provide:
    1. MOOD TRENDS: Average mood, patterns, concerning dips
    2. KEY THEMES: Main topics discussed, recurring concerns
    3. BEHAVIORAL PATTERNS: Communication style, help-seeking behavior
    4. CLINICAL INSIGHTS: Potential areas of concern, progress indicators
    5. RECOMMENDATIONS: Suggested therapeutic focus areas

    Format as professional clinical summary suitable for therapist review.
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          {
            role: 'system',
            content: 'You are a clinical psychology AI assistant helping therapists understand their patients better. Provide professional, ethical, and clinically relevant insights.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_completion_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiSummary = data.choices[0].message.content;

    // Compile final summary
    const summary = {
      patientName: profile.full_name,
      timeRange: `${timeRange} days`,
      dataPoints: {
        totalConversations: conversationSummary.length,
        totalMoodEntries: moodSummary.length,
        averageMood: moodSummary.length > 0 ? 
          (moodSummary.reduce((sum, m) => sum + m.mood, 0) / moodSummary.length).toFixed(1) : 'N/A'
      },
      aiAnalysis: aiSummary,
      lastUpdated: new Date().toISOString()
    };

    console.log('AI summary generated successfully');

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in therapist-ai-summary function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error',
      details: 'Failed to generate patient summary'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});