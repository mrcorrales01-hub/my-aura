import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mood, preferences = {}, recentSessions = [] } = await req.json();

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get user from token
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Fetch available music tracks
    const { data: tracks, error } = await supabaseClient
      .from('music_tracks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // AI-powered recommendation logic
    const moodToCategories = {
      'anxious': ['relaxation', 'breathing'],
      'stressed': ['relaxation', 'meditation'],
      'sad': ['uplifting', 'gentle'],
      'happy': ['energetic', 'uplifting'],
      'tired': ['gentle', 'restoration'],
      'calm': ['meditation', 'ambient'],
      'angry': ['calming', 'grounding'],
      'confused': ['clarity', 'focus']
    };

    const moodToTags = {
      'anxious': ['calm', 'grounding', 'peaceful'],
      'stressed': ['relaxing', 'soothing', 'stress-relief'],
      'sad': ['uplifting', 'gentle', 'comfort'],
      'happy': ['joyful', 'energetic', 'positive'],
      'tired': ['restful', 'gentle', 'restorative'],
      'calm': ['peaceful', 'serene', 'meditative'],
      'angry': ['calming', 'cooling', 'patience'],
      'confused': ['clarity', 'focus', 'centering']
    };

    // Score tracks based on mood and preferences
    const scoredTracks = tracks?.map(track => {
      let score = 0;
      
      // Mood-based scoring
      if (mood && moodToCategories[mood]) {
        if (moodToCategories[mood].includes(track.category)) {
          score += 10;
        }
        
        const moodTags = moodToTags[mood] || [];
        const trackTags = track.mood_tags || [];
        const tagMatches = trackTags.filter(tag => moodTags.includes(tag)).length;
        score += tagMatches * 5;
      }

      // Recent session diversity (avoid repetition)
      const wasRecentlyPlayed = recentSessions.some(session => 
        session.track_id === track.id
      );
      if (wasRecentlyPlayed) {
        score -= 5;
      }

      // Preference-based scoring
      if (preferences.preferred_categories && preferences.preferred_categories.includes(track.category)) {
        score += 8;
      }

      if (preferences.disliked_categories && preferences.disliked_categories.includes(track.category)) {
        score -= 10;
      }

      // Time-based recommendations
      const hour = new Date().getHours();
      if (hour < 6 || hour > 22) {
        // Late night/early morning - prefer calming
        if (track.category === 'sleep' || track.category === 'relaxation') {
          score += 7;
        }
      } else if (hour >= 6 && hour < 12) {
        // Morning - prefer energizing but gentle
        if (track.category === 'morning' || track.category === 'focus') {
          score += 7;
        }
      } else if (hour >= 12 && hour < 18) {
        // Afternoon - prefer focus or uplifting
        if (track.category === 'focus' || track.category === 'energetic') {
          score += 5;
        }
      }

      // Duration preferences
      if (preferences.preferred_duration) {
        const durationDiff = Math.abs(track.duration_seconds - preferences.preferred_duration * 60);
        if (durationDiff < 300) { // Within 5 minutes
          score += 3;
        }
      }

      return { ...track, recommendation_score: score };
    }) || [];

    // Sort by score and return top recommendations
    const recommendations = scoredTracks
      .sort((a, b) => b.recommendation_score - a.recommendation_score)
      .slice(0, 10)
      .map(track => ({
        ...track,
        recommendation_reason: generateRecommendationReason(track, mood, preferences)
      }));

    return new Response(JSON.stringify({ 
      recommendations,
      mood_context: mood,
      total_available: tracks?.length || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Music AI Recommendations Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateRecommendationReason(track, mood, preferences) {
  const reasons = [];
  
  if (mood) {
    if (mood === 'anxious' && track.category === 'relaxation') {
      reasons.push('Perfect for reducing anxiety');
    } else if (mood === 'stressed' && track.category === 'meditation') {
      reasons.push('Great for stress relief');
    } else if (mood === 'sad' && track.mood_tags?.includes('uplifting')) {
      reasons.push('May help lift your spirits');
    }
  }
  
  if (track.recommendation_score > 15) {
    reasons.push('Highly recommended for you');
  }
  
  const hour = new Date().getHours();
  if (hour > 20 && track.category === 'sleep') {
    reasons.push('Perfect evening choice');
  }
  
  return reasons.length > 0 ? reasons.join(', ') : 'Matches your current needs';
}