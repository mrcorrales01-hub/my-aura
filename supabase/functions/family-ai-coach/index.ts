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

    const { familyAccountId, sessionType, issueDescription, participants, action = 'suggest_exercises' } = await req.json();

    if (!familyAccountId) {
      throw new Error('Family account ID is required');
    }

    console.log('Processing family AI coach request:', { sessionType, action });

    // Fetch family data
    const [familyData, participantProfiles, previousSessions] = await Promise.all([
      supabase.from('family_accounts').select('*').eq('id', familyAccountId).single(),
      supabase.from('profiles').select('*').in('id', participants || []),
      supabase.from('family_sessions').select('*').eq('family_account_id', familyAccountId).order('created_at', { ascending: false }).limit(5)
    ]);

    if (familyData.error) throw familyData.error;
    if (participantProfiles.error) throw participantProfiles.error;
    if (previousSessions.error) throw previousSessions.error;

    const contextData = {
      family: familyData.data,
      participants: participantProfiles.data || [],
      previousSessions: previousSessions.data || [],
      currentIssue: issueDescription,
      sessionType
    };

    let aiResponse;
    
    switch (action) {
      case 'suggest_exercises':
        aiResponse = await generateExerciseSuggestions(contextData);
        break;
      case 'analyze_dynamics':
        aiResponse = await analyzeFamilyDynamics(contextData);
        break;
      case 'create_session_plan':
        aiResponse = await createSessionPlan(contextData);
        break;
      default:
        aiResponse = await generateExerciseSuggestions(contextData);
    }

    // Create or update family session
    const sessionData = {
      family_account_id: familyAccountId,
      session_type: sessionType,
      participants: participants || [],
      issue_description: issueDescription,
      ai_suggestions: aiResponse.suggestions || [],
      created_at: new Date().toISOString()
    };

    const { data: session, error: sessionError } = await supabase
      .from('family_sessions')
      .insert(sessionData)
      .select()
      .single();

    if (sessionError) throw sessionError;

    return new Response(JSON.stringify({
      session,
      aiResponse
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in family-ai-coach function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateExerciseSuggestions(contextData: any) {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const systemPrompt = `You are a family therapy AI specialist. Based on the provided family context, suggest specific therapeutic exercises and activities.

  Family Type: ${contextData.family.account_type}
  Session Type: ${contextData.sessionType}
  Participants: ${contextData.participants.length} family members
  Current Issue: ${contextData.currentIssue}

  Generate practical, evidence-based family therapy exercises. Consider:
  - Age-appropriate activities for all participants
  - Communication improvement techniques
  - Conflict resolution strategies
  - Bonding and trust-building exercises
  
  Format response as JSON with: { suggestions: [{ type, title, description, duration, materials, steps }] }`;

  const userPrompt = `
  Family Details:
  ${JSON.stringify(contextData.participants.map(p => ({ age_group: p.age_group, relationship_type: p.relationship_type })))}
  
  Previous Sessions:
  ${JSON.stringify(contextData.previousSessions.map(s => ({ issue: s.issue_description, exercises: s.exercises_completed })))}
  
  Current Issue: "${contextData.currentIssue}"
  
  Generate 3-5 specific family therapy exercises.`;

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
      max_completion_tokens: 2000
    }),
  });

  const result = await response.json();
  const content = result.choices[0].message.content;

  try {
    return JSON.parse(content);
  } catch (e) {
    return {
      suggestions: [
        {
          type: 'communication',
          title: 'Family Check-In Circle',
          description: 'A structured conversation where each family member shares their feelings and experiences.',
          duration: '15-20 minutes',
          materials: 'None required',
          steps: [
            'Sit in a circle facing each other',
            'Each person takes 2-3 minutes to share how they\'re feeling',
            'Others listen without interrupting',
            'End with one thing everyone is grateful for'
          ]
        }
      ]
    };
  }
}

async function analyzeFamilyDynamics(contextData: any) {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const systemPrompt = `You are a family dynamics analyst. Analyze the family structure and interaction patterns to provide insights.

  Provide analysis in JSON format: { analysis: { strengths: [], challenges: [], recommendations: [], patterns: [] } }`;

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
        { role: 'user', content: JSON.stringify(contextData) }
      ],
      max_completion_tokens: 1500
    }),
  });

  const result = await response.json();
  try {
    return JSON.parse(result.choices[0].message.content);
  } catch (e) {
    return {
      analysis: {
        strengths: ['Active participation in therapy'],
        challenges: ['Communication barriers'],
        recommendations: ['Focus on active listening exercises'],
        patterns: ['Need more data for pattern analysis']
      }
    };
  }
}

async function createSessionPlan(contextData: any) {
  return {
    plan: {
      duration: '45-60 minutes',
      phases: [
        { name: 'Check-in', duration: '10 minutes', activities: ['Mood sharing'] },
        { name: 'Main Activity', duration: '30 minutes', activities: ['Family exercise'] },
        { name: 'Reflection', duration: '15 minutes', activities: ['Discussion and planning'] }
      ]
    }
  };
}