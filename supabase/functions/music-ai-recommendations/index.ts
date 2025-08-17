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

    const { userId, mood, context, heartRate, timeOfDay } = await req.json();

    console.log('Music AI Recommendations request:', { userId, mood, context, heartRate, timeOfDay });

    // Get user's music session history for personalization
    const { data: sessions } = await supabase
      .from('user_music_sessions')
      .select('track_id, session_context, mood_before, mood_after, completed')
      .eq('user_id', userId)
      .order('played_at', { ascending: false })
      .limit(20);

    // Get user's current mood entries
    const { data: moodEntries } = await supabase
      .from('mood_entries')
      .select('mood_id, mood_value, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    // Get all available tracks
    const { data: allTracks } = await supabase
      .from('music_tracks')
      .select('*')
      .order('created_at', { ascending: false });

    if (!allTracks) {
      throw new Error('No tracks available');
    }

    console.log(`Found ${allTracks.length} tracks to analyze`);

    // Create AI matching criteria based on user data
    const matchingCriteria = {
      mood: mood || 'neutral',
      context: context || 'relaxation',
      timeOfDay,
      heartRate,
      recentSessions: sessions?.slice(0, 5) || [],
      recentMoods: moodEntries?.map(entry => ({
        mood: entry.mood_id,
        value: entry.mood_value,
        timestamp: entry.created_at
      })) || []
    };

    // Score tracks based on AI matching criteria
    const scoredTracks = allTracks.map(track => {
      let score = 0;
      const criteria = track.ai_match_criteria || {};

      // Mood matching (40% weight)
      if (criteria.mood && Array.isArray(criteria.mood)) {
        if (criteria.mood.includes(mood)) {
          score += 40;
        }
      }

      // Context matching (30% weight)
      if (context && track.category === context) {
        score += 30;
      }

      // Time of day matching (20% weight)
      if (criteria.time_of_day) {
        const currentHour = timeOfDay || new Date().getHours();
        if (criteria.time_of_day === 'morning' && currentHour >= 6 && currentHour < 12) {
          score += 20;
        } else if (criteria.time_of_day === 'evening' && currentHour >= 18) {
          score += 20;
        } else if (criteria.time_of_day === 'night' && (currentHour >= 22 || currentHour < 6)) {
          score += 20;
        }
      }

      // Heart rate matching (10% weight)
      if (heartRate && criteria.heart_rate) {
        if (criteria.heart_rate === 'high' && heartRate > 80) {
          score += 10;
        } else if (criteria.heart_rate === 'low' && heartRate < 70) {
          score += 10;
        }
      }

      // Boost score for tracks user hasn't played recently
      const recentlyPlayed = sessions?.some(session => session.track_id === track.id);
      if (!recentlyPlayed) {
        score += 10;
      }

      // Boost score for tracks that match user's successful past sessions
      const successfulSessions = sessions?.filter(session => 
        session.completed && 
        session.mood_after && 
        ['calm', 'relaxed', 'peaceful', 'happy'].includes(session.mood_after)
      );
      
      const hasSuccessfulMatch = successfulSessions?.some(session => {
        const sessionTrack = allTracks.find(t => t.id === session.track_id);
        return sessionTrack?.category === track.category || 
               sessionTrack?.mood_tags.some(tag => track.mood_tags.includes(tag));
      });
      
      if (hasSuccessfulMatch) {
        score += 15;
      }

      return {
        ...track,
        aiScore: score,
        matchReason: score > 50 ? 'Perfect match for your current state' :
                    score > 30 ? 'Good match based on your preferences' :
                    'Recommended for discovery'
      };
    });

    // Sort by AI score and return top recommendations
    const recommendations = scoredTracks
      .sort((a, b) => b.aiScore - a.aiScore)
      .slice(0, 12);

    console.log(`Returning ${recommendations.length} recommendations with scores:`, 
      recommendations.map(r => ({ title: r.title, score: r.aiScore })));

    return new Response(JSON.stringify({
      recommendations,
      matchingCriteria,
      totalTracksAnalyzed: allTracks.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in music-ai-recommendations:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      recommendations: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});