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

    const { userId, mood, goals, activityHistory, timeOfDay } = await req.json();

    console.log('Video AI Recommendations request:', { userId, mood, goals, timeOfDay });

    // Get user's video session history
    const { data: sessions } = await supabase
      .from('user_video_sessions')
      .select('video_id, mood_before, mood_after, completed, difficulty_rating, effectiveness_rating')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(20);

    // Get user's current mood entries
    const { data: moodEntries } = await supabase
      .from('mood_entries')
      .select('mood_id, mood_value, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    // Get user's goals for context
    const { data: userGoals } = await supabase
      .from('user_goals')
      .select('category, status, priority')
      .eq('user_id', userId)
      .eq('status', 'active');

    // Get all available videos
    const { data: allVideos } = await supabase
      .from('video_exercises')
      .select('*')
      .order('created_at', { ascending: false });

    if (!allVideos) {
      throw new Error('No videos available');
    }

    console.log(`Found ${allVideos.length} videos to analyze`);

    // Analyze user's preferences from past sessions
    const completedSessions = sessions?.filter(s => s.completed) || [];
    const highEffectivenessVideos = completedSessions.filter(s => s.effectiveness_rating >= 4);
    const preferredCategories = [...new Set(
      highEffectivenessVideos.map(s => {
        const video = allVideos.find(v => v.id === s.video_id);
        return video?.category;
      }).filter(Boolean)
    )];

    const preferredDifficulty = completedSessions.length > 0 
      ? Math.round(completedSessions.reduce((sum, s) => sum + (s.difficulty_rating || 2), 0) / completedSessions.length)
      : 1;

    // Create AI matching criteria
    const matchingCriteria = {
      mood: mood || 'neutral',
      goals: goals || [],
      timeOfDay,
      preferredCategories,
      preferredDifficulty,
      recentSessions: sessions?.slice(0, 5) || [],
      recentMoods: moodEntries?.map(entry => ({
        mood: entry.mood_id,
        value: entry.mood_value,
        timestamp: entry.created_at
      })) || []
    };

    // Score videos based on AI matching criteria
    const scoredVideos = allVideos.map(video => {
      let score = 0;
      const criteria = video.ai_match_criteria || {};

      // Mood matching (35% weight)
      if (criteria.mood && Array.isArray(criteria.mood)) {
        if (criteria.mood.includes(mood)) {
          score += 35;
        }
      }

      // Category preference matching (25% weight)
      if (preferredCategories.includes(video.category)) {
        score += 25;
      }

      // Difficulty matching (20% weight)
      const difficultyMap = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
      const videoDifficulty = difficultyMap[video.difficulty_level] || 1;
      const difficultyDiff = Math.abs(videoDifficulty - preferredDifficulty);
      
      if (difficultyDiff === 0) {
        score += 20;
      } else if (difficultyDiff === 1) {
        score += 10;
      }

      // Time of day matching (10% weight)
      if (criteria.time_of_day) {
        const currentHour = timeOfDay || new Date().getHours();
        if (criteria.time_of_day === 'morning' && currentHour >= 6 && currentHour < 12) {
          score += 10;
        } else if (criteria.time_of_day === 'evening' && currentHour >= 17) {
          score += 10;
        }
      }

      // Goals alignment (10% weight)
      if (userGoals && userGoals.length > 0) {
        const hasGoalAlignment = userGoals.some(goal => {
          if (goal.category === 'mental_health' && ['mindfulness', 'breathing'].includes(video.category)) {
            return true;
          }
          if (goal.category === 'physical_health' && video.category === 'stretching') {
            return true;
          }
          if (goal.category === 'personal_growth' && video.category === 'journaling') {
            return true;
          }
          return false;
        });
        
        if (hasGoalAlignment) {
          score += 10;
        }
      }

      // Boost for videos not recently watched
      const recentlyWatched = sessions?.some(session => session.video_id === video.id);
      if (!recentlyWatched) {
        score += 10;
      }

      // Boost for videos in effective categories from past sessions
      if (highEffectivenessVideos.length > 0) {
        const hasEffectiveMatch = highEffectivenessVideos.some(session => {
          const sessionVideo = allVideos.find(v => v.id === session.video_id);
          return sessionVideo?.category === video.category;
        });
        
        if (hasEffectiveMatch) {
          score += 15;
        }
      }

      // Context-specific boosts
      if (criteria.context) {
        if (criteria.context === 'work' && mood === 'stressed' && video.category === 'breathing') {
          score += 15;
        }
        if (criteria.stress_level === 'high' && ['mindfulness', 'breathing'].includes(video.category)) {
          score += 15;
        }
      }

      // Duration preference (shorter videos for beginners or stressed users)
      if (mood === 'stressed' || mood === 'anxious') {
        if (video.duration_seconds <= 300) { // 5 minutes or less
          score += 10;
        }
      }

      return {
        ...video,
        aiScore: score,
        matchReason: score > 60 ? 'Perfectly matched to your current needs' :
                    score > 40 ? 'Great match based on your history' :
                    score > 20 ? 'Good option to try something new' :
                    'Recommended for variety'
      };
    });

    // Sort by AI score and return top recommendations
    const recommendations = scoredVideos
      .sort((a, b) => b.aiScore - a.aiScore)
      .slice(0, 12);

    console.log(`Returning ${recommendations.length} recommendations with scores:`, 
      recommendations.map(r => ({ title: r.title, score: r.aiScore, category: r.category })));

    return new Response(JSON.stringify({
      recommendations,
      matchingCriteria,
      totalVideosAnalyzed: allVideos.length,
      userPreferences: {
        preferredCategories,
        preferredDifficulty: ['beginner', 'intermediate', 'advanced'][preferredDifficulty - 1] || 'beginner',
        completedSessions: completedSessions.length
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in video-ai-recommendations:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      recommendations: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});