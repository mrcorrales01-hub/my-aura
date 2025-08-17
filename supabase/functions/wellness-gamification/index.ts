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

    const { userId, action, data } = await req.json();

    console.log('Wellness gamification request:', { userId, action, data });

    let achievements = [];
    let xpGained = 0;

    switch (action) {
      case 'complete_music_session':
        // Award XP for music session completion
        xpGained = 10;
        
        // Check for music achievements
        const { data: musicSessions } = await supabase
          .from('user_music_sessions')
          .select('*')
          .eq('user_id', userId)
          .eq('completed', true);

        if (musicSessions) {
          const completedCount = musicSessions.length;
          
          // First music session
          if (completedCount === 1) {
            achievements.push({
              name: 'First Melody',
              description: 'Completed your first music session',
              category: 'music',
              points: 25,
              icon: '🎵'
            });
          }
          
          // Music streak achievements
          if (completedCount === 5) {
            achievements.push({
              name: 'Music Explorer',
              description: 'Completed 5 music sessions',
              category: 'music',
              points: 50,
              icon: '🎶'
            });
          }
          
          if (completedCount === 20) {
            achievements.push({
              name: 'Harmony Master',
              description: 'Completed 20 music sessions',
              category: 'music',
              points: 100,
              icon: '🎼'
            });
          }
          
          // Category-specific achievements
          const meditationSessions = musicSessions.filter(s => s.session_context === 'meditation');
          if (meditationSessions.length === 10) {
            achievements.push({
              name: 'Meditation Melody',
              description: 'Completed 10 meditation music sessions',
              category: 'music',
              points: 75,
              icon: '🧘‍♀️'
            });
          }
        }
        break;

      case 'complete_video_session':
        // Award XP for video session completion
        xpGained = 15;
        
        // Check for video achievements
        const { data: videoSessions } = await supabase
          .from('user_video_sessions')
          .select('*')
          .eq('user_id', userId)
          .eq('completed', true);

        if (videoSessions) {
          const completedCount = videoSessions.length;
          
          // First video session
          if (completedCount === 1) {
            achievements.push({
              name: 'First Flow',
              description: 'Completed your first video exercise',
              category: 'video',
              points: 25,
              icon: '📹'
            });
          }
          
          // Video streak achievements
          if (completedCount === 5) {
            achievements.push({
              name: 'Movement Seeker',
              description: 'Completed 5 video exercises',
              category: 'video',
              points: 50,
              icon: '🏃‍♀️'
            });
          }
          
          if (completedCount === 15) {
            achievements.push({
              name: 'Wellness Warrior',
              description: 'Completed 15 video exercises',
              category: 'video',
              points: 100,
              icon: '💪'
            });
          }
          
          // Difficulty-based achievements
          const advancedSessions = videoSessions.filter(s => {
            // Would need to join with video_exercises table to get difficulty
            return s.difficulty_rating >= 4;
          });
          
          if (advancedSessions.length === 5) {
            achievements.push({
              name: 'Challenge Conqueror',
              description: 'Completed 5 challenging video exercises',
              category: 'video',
              points: 75,
              icon: '🏆'
            });
          }
        }
        break;

      case 'create_playlist':
        // Award XP for playlist creation
        xpGained = 20;
        
        achievements.push({
          name: 'Playlist Pioneer',
          description: 'Created your first custom playlist',
          category: 'music',
          points: 30,
          icon: '📝'
        });
        break;

      case 'daily_wellness_combo':
        // Check if user completed music + video in same day
        const today = new Date().toDateString();
        
        const { data: todayMusic } = await supabase
          .from('user_music_sessions')
          .select('*')
          .eq('user_id', userId)
          .gte('played_at', new Date(today).toISOString())
          .eq('completed', true);

        const { data: todayVideo } = await supabase
          .from('user_video_sessions')
          .select('*')
          .eq('user_id', userId)
          .gte('started_at', new Date(today).toISOString())
          .eq('completed', true);

        if (todayMusic && todayMusic.length > 0 && todayVideo && todayVideo.length > 0) {
          xpGained = 30;
          achievements.push({
            name: 'Wellness Combo',
            description: 'Completed both music and video sessions today',
            category: 'daily',
            points: 50,
            icon: '🌟'
          });
        }
        break;

      case 'mindful_week':
        // Check for consistent wellness activities over a week
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const { data: weekMusic } = await supabase
          .from('user_music_sessions')
          .select('played_at')
          .eq('user_id', userId)
          .gte('played_at', weekAgo.toISOString())
          .eq('completed', true);

        const { data: weekVideo } = await supabase
          .from('user_video_sessions')
          .select('started_at')
          .eq('user_id', userId)
          .gte('started_at', weekAgo.toISOString())
          .eq('completed', true);

        const totalSessions = (weekMusic?.length || 0) + (weekVideo?.length || 0);
        
        if (totalSessions >= 7) {
          xpGained = 100;
          achievements.push({
            name: 'Mindful Week',
            description: 'Completed wellness activities for 7 days straight',
            category: 'streak',
            points: 150,
            icon: '🔥'
          });
        }
        break;
    }

    // Save achievements to database
    for (const achievement of achievements) {
      // Check if user already has this achievement
      const { data: existing } = await supabase
        .from('user_achievements')
        .select('id')
        .eq('user_id', userId)
        .eq('achievement_name', achievement.name)
        .single();

      if (!existing) {
        await supabase
          .from('user_achievements')
          .insert({
            user_id: userId,
            achievement_name: achievement.name,
            achievement_type: achievement.category,
            description: achievement.description,
            points_earned: achievement.points,
            total_xp: achievement.points,
            metadata: { icon: achievement.icon }
          });

        console.log(`Awarded achievement: ${achievement.name} to user ${userId}`);
      }
    }

    // Update user's total XP if any was gained
    if (xpGained > 0) {
      // Get current XP
      const { data: currentStats } = await supabase
        .from('user_achievements')
        .select('total_xp')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const newTotalXP = (currentStats?.total_xp || 0) + xpGained;

      // Insert XP gain record
      await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_name: `${action}_xp`,
          achievement_type: 'xp_gain',
          description: `Gained ${xpGained} XP from ${action}`,
          points_earned: xpGained,
          total_xp: newTotalXP,
          metadata: { action, xp_gained: xpGained }
        });
    }

    return new Response(JSON.stringify({
      achievements,
      xpGained,
      totalAchievements: achievements.length,
      message: achievements.length > 0 
        ? `Congratulations! You earned ${achievements.length} new achievement${achievements.length > 1 ? 's' : ''}!`
        : xpGained > 0 
        ? `Great job! You gained ${xpGained} XP!`
        : 'Keep up the great work!'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in wellness-gamification:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      achievements: [],
      xpGained: 0
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});