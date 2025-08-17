import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId, analysisType = 'comprehensive', lookbackDays = 14 } = await req.json();

    if (!userId) {
      throw new Error('User ID is required');
    }

    console.log(`Running early warning analysis for user ${userId}`);

    // Fetch user data for analysis
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - lookbackDays * 24 * 60 * 60 * 1000);

    // Get mood entries
    const { data: moodData } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    // Get conversations
    const { data: conversationData } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    // Get wearable data
    const { data: wearableData } = await supabase
      .from('wearable_data')
      .select('*')
      .eq('user_id', userId)
      .gte('recorded_at', startDate.toISOString())
      .order('recorded_at', { ascending: false });

    // Analyze patterns and generate risk factors
    const riskFactors = analyzeRiskPatterns(moodData || [], conversationData || [], wearableData || []);
    
    // Generate alerts based on analysis
    const newAlerts = await generateAlerts(supabase, userId, riskFactors);

    return new Response(
      JSON.stringify({
        success: true,
        riskFactors,
        newAlerts,
        analysisDate: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in early warning analysis:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function analyzeRiskPatterns(moodData: any[], conversationData: any[], wearableData: any[]) {
  const riskFactors = {
    moodDecline: false,
    sleepDisruption: false,
    activityDecrease: false,
    stressIncrease: false,
    socialWithdrawal: false,
    conversationPatterns: false,
  };

  // Analyze mood decline
  if (moodData.length >= 5) {
    const recentMoods = moodData.slice(0, 5).map(m => m.mood_value);
    const earlierMoods = moodData.slice(5, 10).map(m => m.mood_value);
    
    if (recentMoods.length && earlierMoods.length) {
      const recentAvg = recentMoods.reduce((a, b) => a + b, 0) / recentMoods.length;
      const earlierAvg = earlierMoods.reduce((a, b) => a + b, 0) / earlierMoods.length;
      
      if (recentAvg < earlierAvg - 1.5) {
        riskFactors.moodDecline = true;
      }
    }
  }

  // Analyze sleep disruption
  const sleepData = wearableData.filter(d => d.data_type === 'sleep_duration');
  if (sleepData.length >= 3) {
    const avgSleep = sleepData.reduce((sum, d) => sum + d.value, 0) / sleepData.length;
    if (avgSleep < 6 || avgSleep > 10) {
      riskFactors.sleepDisruption = true;
    }
  }

  // Analyze activity decrease
  const activityData = wearableData.filter(d => d.data_type === 'steps');
  if (activityData.length >= 3) {
    const avgSteps = activityData.reduce((sum, d) => sum + d.value, 0) / activityData.length;
    if (avgSteps < 3000) {
      riskFactors.activityDecrease = true;
    }
  }

  // Analyze conversation patterns
  if (conversationData.length < 3 && moodData.length > 0) {
    riskFactors.socialWithdrawal = true;
  }

  // Simple conversation pattern analysis
  if (conversationData.length > 0) {
    const negativeKeywords = ['sad', 'depressed', 'anxious', 'worried', 'hopeless'];
    const hasNegativePatterns = conversationData.some(conv => 
      negativeKeywords.some(keyword => 
        conv.message?.toLowerCase().includes(keyword) ||
        conv.response?.toLowerCase().includes(keyword)
      )
    );
    
    if (hasNegativePatterns) {
      riskFactors.conversationPatterns = true;
    }
  }

  return riskFactors;
}

async function generateAlerts(supabase: any, userId: string, riskFactors: any) {
  const alerts = [];
  const riskCount = Object.values(riskFactors).filter(Boolean).length;
  
  if (riskCount >= 3) {
    // High risk - multiple factors
    alerts.push({
      user_id: userId,
      alert_type: 'depression_risk',
      severity_level: 'high',
      contributing_factors: Object.keys(riskFactors).filter(key => riskFactors[key]),
      ai_reasoning: 'Multiple risk factors detected including mood decline and behavioral changes',
      confidence_score: 0.8,
      recommended_actions: [
        'Consider speaking with a mental health professional',
        'Increase social connections and support',
        'Focus on sleep hygiene and regular exercise'
      ]
    });
  } else if (riskCount >= 2) {
    // Medium risk
    alerts.push({
      user_id: userId,
      alert_type: 'burnout_risk',
      severity_level: 'medium',
      contributing_factors: Object.keys(riskFactors).filter(key => riskFactors[key]),
      ai_reasoning: 'Some concerning patterns detected in your wellness data',
      confidence_score: 0.6,
      recommended_actions: [
        'Practice stress management techniques',
        'Maintain regular sleep schedule',
        'Continue using wellness tracking features'
      ]
    });
  }

  // Store alerts in database
  if (alerts.length > 0) {
    const { error } = await supabase
      .from('early_warning_alerts')
      .insert(alerts);
    
    if (error) {
      console.error('Error storing alerts:', error);
    }
  }

  return alerts;
}