import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

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
    const { content, contentType, contentId } = await req.json();
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log(`Moderating ${contentType} content:`, { contentId, contentLength: content.length });

    // Use OpenAI's moderation API for initial screening
    const moderationResponse = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: content,
      }),
    });

    const moderationData = await moderationResponse.json();
    console.log('OpenAI moderation result:', moderationData);

    const isFlagged = moderationData.results[0]?.flagged || false;
    const categories = moderationData.results[0]?.categories || {};
    const categoryScores = moderationData.results[0]?.category_scores || {};

    // Enhanced AI analysis for mental health context
    let contextualAnalysis = null;
    if (isFlagged || Object.values(categoryScores).some((score: any) => score > 0.3)) {
      const analysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
              content: `You are a content moderator for a mental health support community. Analyze content for:
              1. Self-harm or suicidal ideation (immediate concern)
              2. Harassment or bullying
              3. Misinformation about mental health
              4. Spam or irrelevant content
              5. Inappropriate sharing of personal information
              
              Consider that users may be sharing struggles, which is healthy. Only flag genuine concerns.
              
              Respond with JSON: {
                "action": "approve|flag|block",
                "reason": "brief explanation",
                "priority": "low|medium|high",
                "suggestions": "helpful guidance for improvement if flagged"
              }`
            },
            {
              role: 'user',
              content: content
            }
          ],
          temperature: 0.1,
          max_tokens: 200,
        }),
      });

      const analysisData = await analysisResponse.json();
      console.log('Contextual analysis result:', analysisData);
      
      try {
        contextualAnalysis = JSON.parse(analysisData.choices[0]?.message?.content || '{}');
      } catch (e) {
        console.error('Error parsing contextual analysis:', e);
        contextualAnalysis = { action: 'flag', reason: 'Analysis failed', priority: 'medium' };
      }
    }

    // Determine final moderation status
    let moderationStatus = 'approved';
    let moderationFlags: string[] = [];

    if (isFlagged) {
      moderationFlags = Object.keys(categories).filter(key => categories[key]);
      moderationStatus = 'blocked';
    }

    if (contextualAnalysis) {
      if (contextualAnalysis.action === 'block') {
        moderationStatus = 'blocked';
        moderationFlags.push('contextual_analysis');
      } else if (contextualAnalysis.action === 'flag') {
        moderationStatus = 'flagged';
        moderationFlags.push('needs_review');
      }
    }

    // Update the content in the database
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    
    const tableName = contentType === 'post' ? 'community_posts' : 'community_comments';
    const { error: updateError } = await supabase
      .from(tableName)
      .update({
        moderation_status: moderationStatus,
        moderation_flags: moderationFlags,
      })
      .eq('id', contentId);

    if (updateError) {
      console.error('Error updating moderation status:', updateError);
      throw updateError;
    }

    // If content is high priority (self-harm, suicide), create a crisis interaction
    if (contextualAnalysis?.priority === 'high' && moderationStatus === 'blocked') {
      const { data: postData } = await supabase
        .from(tableName)
        .select('user_id')
        .eq('id', contentId)
        .single();

      if (postData) {
        await supabase
          .from('crisis_interactions')
          .insert({
            user_id: postData.user_id,
            crisis_level: 'high',
            action_taken: 'content_blocked_ai_moderation',
            notes: `Content blocked due to ${contextualAnalysis.reason}. Suggestions: ${contextualAnalysis.suggestions || 'None'}`
          });
      }
    }

    console.log(`Content ${contentId} moderated: ${moderationStatus}`);

    return new Response(JSON.stringify({
      status: moderationStatus,
      flags: moderationFlags,
      analysis: contextualAnalysis,
      openai_flagged: isFlagged,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in content-moderation function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      status: 'error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});