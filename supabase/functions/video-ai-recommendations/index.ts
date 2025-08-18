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
    const { mood, preferences = {}, recentSessions = [], skillLevel = 'beginner' } = await req.json();

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

    // Fetch available video exercises
    const { data: videos, error } = await supabaseClient
      .from('video_exercises')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // AI-powered recommendation logic for video exercises
    const moodToCategories = {
      'anxious': ['breathing', 'mindfulness', 'grounding'],
      'stressed': ['breathing', 'stretching', 'mindfulness'],
      'sad': ['gentle_movement', 'mindfulness', 'self_compassion'],
      'happy': ['energetic', 'dance', 'strength'],
      'tired': ['gentle', 'restorative', 'breathing'],
      'calm': ['mindfulness', 'meditation', 'gentle'],
      'angry': ['intense_workout', 'boxing', 'running'],
      'overwhelmed': ['breathing', 'grounding', 'simple']
    };

    const moodToIntensity = {
      'anxious': ['low', 'gentle'],
      'stressed': ['moderate', 'calming'],
      'sad': ['gentle', 'nurturing'],
      'happy': ['moderate', 'energetic'],
      'tired': ['low', 'restorative'],
      'calm': ['gentle', 'mindful'],
      'angry': ['high', 'intense'],
      'overwhelmed': ['low', 'simple']
    };

    // Score videos based on mood and user data
    const scoredVideos = videos?.map(video => {
      let score = 0;
      
      // Mood-based scoring
      if (mood && moodToCategories[mood]) {
        if (moodToCategories[mood].includes(video.category)) {
          score += 15;
        }
        
        const moodIntensities = moodToIntensity[mood] || [];
        if (moodIntensities.includes(video.intensity_level)) {
          score += 10;
        }
      }

      // Skill level matching
      if (video.difficulty_level === skillLevel) {
        score += 12;
      } else if (skillLevel === 'beginner' && video.difficulty_level === 'intermediate') {
        score += 5; // Slight progression challenge
      } else if (skillLevel === 'intermediate' && video.difficulty_level === 'advanced') {
        score += 5;
      } else if (skillLevel === 'advanced' && video.difficulty_level === 'beginner') {
        score -= 5; // Too easy for advanced users
      }

      // Duration preferences
      if (preferences.preferred_duration) {
        const durationDiff = Math.abs(video.duration_seconds - preferences.preferred_duration * 60);
        if (durationDiff < 120) { // Within 2 minutes
          score += 8;
        } else if (durationDiff < 300) { // Within 5 minutes
          score += 4;
        }
      }

      // Recent session diversity (avoid repetition)
      const wasRecentlyCompleted = recentSessions.some(session => 
        session.video_id === video.id
      );
      if (wasRecentlyCompleted) {
        score -= 8;
      }

      // Time-based recommendations
      const hour = new Date().getHours();
      if (hour < 8) {
        // Early morning - gentle awakening
        if (video.category === 'morning_flow' || video.category === 'gentle_stretching') {
          score += 10;
        }
      } else if (hour >= 8 && hour < 12) {
        // Morning - energizing
        if (video.category === 'energizing' || video.category === 'strength') {
          score += 8;
        }
      } else if (hour >= 12 && hour < 17) {
        // Afternoon - focus and energy
        if (video.category === 'focus' || video.category === 'midday_boost') {
          score += 6;
        }
      } else if (hour >= 17 && hour < 21) {
        // Evening - stress relief
        if (video.category === 'stress_relief' || video.category === 'unwinding') {
          score += 8;
        }
      } else {
        // Night - calming and restorative
        if (video.category === 'restorative' || video.category === 'bedtime') {
          score += 10;
        }
      }

      // Category preferences
      if (preferences.preferred_categories && preferences.preferred_categories.includes(video.category)) {
        score += 10;
      }

      if (preferences.disliked_categories && preferences.disliked_categories.includes(video.category)) {
        score -= 15;
      }

      // Progressive difficulty (encourage growth)
      const completedCount = recentSessions.filter(s => s.completed_at).length;
      if (completedCount > 10 && video.difficulty_level === 'intermediate' && skillLevel === 'beginner') {
        score += 3; // Encourage progression
      }

      // Mood-specific exercise benefits
      if (mood === 'anxious' && video.category === 'breathing') {
        score += 12; // Breathing exercises are excellent for anxiety
      }
      if (mood === 'sad' && video.category === 'gentle_movement') {
        score += 10; // Gentle movement helps with depression
      }
      if (mood === 'stressed' && video.category === 'mindfulness') {
        score += 11; // Mindfulness reduces stress
      }

      return { ...video, recommendation_score: score };
    }) || [];

    // Sort by score and return top recommendations
    const recommendations = scoredVideos
      .sort((a, b) => b.recommendation_score - a.recommendation_score)
      .slice(0, 8)
      .map(video => ({
        ...video,
        recommendation_reason: generateVideoRecommendationReason(video, mood, preferences, skillLevel)
      }));

    return new Response(JSON.stringify({ 
      recommendations,
      mood_context: mood,
      skill_level: skillLevel,
      total_available: videos?.length || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Video AI Recommendations Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateVideoRecommendationReason(video, mood, preferences, skillLevel) {
  const reasons = [];
  
  if (mood) {
    if (mood === 'anxious' && video.category === 'breathing') {
      reasons.push('Breathing exercises help reduce anxiety');
    } else if (mood === 'stressed' && video.category === 'mindfulness') {
      reasons.push('Mindfulness practice reduces stress');
    } else if (mood === 'sad' && video.category === 'gentle_movement') {
      reasons.push('Gentle movement can lift your mood');
    } else if (mood === 'tired' && video.category === 'restorative') {
      reasons.push('Restorative practice for when you\'re tired');
    }
  }
  
  if (video.difficulty_level === skillLevel) {
    reasons.push(`Perfect for your ${skillLevel} level`);
  }
  
  if (video.recommendation_score > 20) {
    reasons.push('Highly personalized for you');
  }
  
  const hour = new Date().getHours();
  if (hour < 8 && video.category === 'morning_flow') {
    reasons.push('Great way to start your day');
  } else if (hour > 18 && video.category === 'stress_relief') {
    reasons.push('Perfect for evening unwinding');
  }
  
  if (video.duration_seconds <= 300) {
    reasons.push('Quick and effective');
  }
  
  return reasons.length > 0 ? reasons.join(' • ') : 'Recommended based on your preferences';
}