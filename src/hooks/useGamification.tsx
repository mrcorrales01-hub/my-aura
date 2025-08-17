import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  badge_icon: string;
  badge_color: string;
  points: number;
  is_secret: boolean;
  requirements: any;
  unlocked?: boolean;
  progress?: number;
  unlocked_at?: string;
}

interface UserStats {
  level: number;
  totalXP: number;
  xpToNextLevel: number;
  streakCount: number;
  totalQuests: number;
  totalRoleplaysSessions: number;
  totalMoodEntries: number;
}

export const useGamification = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    level: 1,
    totalXP: 0,
    xpToNextLevel: 100,
    streakCount: 0,
    totalQuests: 0,
    totalRoleplaysSessions: 0,
    totalMoodEntries: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAchievements();
      fetchUserStats();
    }
  }, [user]);

  const fetchAchievements = async () => {
    try {
      // Get all available achievements
      const { data: allAchievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .order('category', { ascending: true });

      if (achievementsError) throw achievementsError;

      // Get user's unlocked achievements
      const { data: userAchievements, error: userError } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user!.id);

      if (userError) throw userError;

      // Merge achievements with user progress
      const mergedAchievements = allAchievements?.map(achievement => {
        const userAchievement = userAchievements?.find(ua => ua.achievement_name === achievement.name);
        return {
          ...achievement,
          unlocked: !!userAchievement,
          unlocked_at: userAchievement?.unlocked_at,
          progress: calculateProgress(achievement, userAchievement)
        };
      }) || [];

      setAchievements(mergedAchievements);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  const fetchUserStats = async () => {
    try {
      setLoading(true);

      // Get user achievements for XP calculation
      const { data: userAchievements, error: achievementsError } = await supabase
        .from('user_achievements')
        .select('points_earned, total_xp, current_level, streak_count')
        .eq('user_id', user!.id);

      if (achievementsError) throw achievementsError;

      // Get quest count
      const { count: questCount, error: questError } = await supabase
        .from('daily_quests')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id)
        .not('completed_at', 'is', null);

      if (questError) throw questError;

      // Get roleplay sessions count
      const { count: roleplayCount, error: roleplayError } = await supabase
        .from('roleplay_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id);

      if (roleplayError) throw roleplayError;

      // Get mood entries count
      const { count: moodCount, error: moodError } = await supabase
        .from('mood_entries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id);

      if (moodError) throw moodError;

      const totalXP = userAchievements?.reduce((sum, ua) => sum + (ua.total_xp || 0), 0) || 0;
      const currentLevel = Math.floor(totalXP / 100) + 1;
      const xpToNextLevel = 100 - (totalXP % 100);

      setUserStats({
        level: currentLevel,
        totalXP,
        xpToNextLevel,
        streakCount: userAchievements?.[0]?.streak_count || 0,
        totalQuests: questCount || 0,
        totalRoleplaysSessions: roleplayCount || 0,
        totalMoodEntries: moodCount || 0
      });

    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (achievement: Achievement, userAchievement: any) => {
    if (userAchievement?.unlocked_at) return 100;

    const requirements = achievement.requirements;
    let progress = 0;

    // Calculate progress based on requirements
    if (requirements.quests_completed) {
      progress = Math.min((userStats.totalQuests / requirements.quests_completed) * 100, 100);
    } else if (requirements.roleplay_sessions) {
      progress = Math.min((userStats.totalRoleplaysSessions / requirements.roleplay_sessions) * 100, 100);
    } else if (requirements.mood_streak) {
      progress = Math.min((userStats.streakCount / requirements.mood_streak) * 100, 100);
    }

    return Math.round(progress);
  };

  const awardAchievement = async (achievementName: string, customPoints?: number) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('award_achievement', {
        p_user_id: user.id,
        p_achievement_name: achievementName,
        p_points: customPoints
      });

      if (error) throw error;

      if (data) {
        const achievement = achievements.find(a => a.name === achievementName);
        if (achievement) {
          toast({
            title: "🏆 Achievement Unlocked!",
            description: `${achievement.badge_icon} ${achievement.name}: ${achievement.description}`,
          });
        }

        // Refresh achievements and stats
        await fetchAchievements();
        await fetchUserStats();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error awarding achievement:', error);
      return false;
    }
  };

  const completeQuest = async (questTitle: string, points: number = 10) => {
    if (!user) return false;

    try {
      // Mark quest as completed
      const { error } = await supabase
        .from('daily_quests')
        .upsert({
          user_id: user.id,
          title: questTitle,
          quest_type: 'daily',
          description: `Completed: ${questTitle}`,
          points,
          completed_at: new Date().toISOString(),
          quest_date: new Date().toISOString().split('T')[0]
        });

      if (error) throw error;

      // Check for achievements
      const newQuestCount = userStats.totalQuests + 1;
      
      if (newQuestCount === 1) {
        await awardAchievement('First Steps');
      } else if (newQuestCount === 7) {
        await awardAchievement('Weekly Warrior');
      } else if (newQuestCount === 50) {
        await awardAchievement('Quest Champion');
      }

      // Refresh stats
      await fetchUserStats();

      toast({
        title: "Quest Completed! 🎉",
        description: `You earned ${points} XP for "${questTitle}"`,
      });

      return true;
    } catch (error) {
      console.error('Error completing quest:', error);
      return false;
    }
  };

  const completeRoleplaySession = async (sessionTitle: string, scenarioType: string, confidenceRating?: number) => {
    if (!user) return false;

    try {
      // Save roleplay session
      const { error } = await supabase
        .from('roleplay_sessions')
        .insert({
          user_id: user.id,
          scenario_title: sessionTitle,
          scenario_type: scenarioType,
          confidence_rating: confidenceRating,
          completed_at: new Date().toISOString(),
          duration_minutes: 5 // Default duration
        });

      if (error) throw error;

      // Check for achievements
      const newSessionCount = userStats.totalRoleplaysSessions + 1;
      
      if (newSessionCount === 1) {
        await awardAchievement('Conversation Starter');
      } else if (newSessionCount === 10) {
        await awardAchievement('Roleplay Expert');
      }

      // Check for unique scenarios achievement
      const { data: uniqueScenarios } = await supabase
        .from('roleplay_sessions')
        .select('scenario_type')
        .eq('user_id', user.id);

      const uniqueCount = new Set(uniqueScenarios?.map(s => s.scenario_type)).size;
      if (uniqueCount >= 5) {
        await awardAchievement('Social Butterfly');
      }

      await fetchUserStats();

      toast({
        title: "Roleplay Complete! 🎭",
        description: `Great practice session: "${sessionTitle}"`,
      });

      return true;
    } catch (error) {
      console.error('Error completing roleplay session:', error);
      return false;
    }
  };

  const logMoodEntry = async (moodValue: number, notes?: string) => {
    if (!user) return false;

    try {
      // This is handled by the mood tracking system
      // Check for mood-related achievements
      const consecutiveDays = await checkMoodStreak();
      
      if (consecutiveDays === 3) {
        await awardAchievement('Mood Tracker');
      } else if (consecutiveDays === 30) {
        await awardAchievement('Mood Master');
      }

      await fetchUserStats();
      return true;
    } catch (error) {
      console.error('Error processing mood entry:', error);
      return false;
    }
  };

  const checkMoodStreak = async (): Promise<number> => {
    if (!user) return 0;

    try {
      const { data, error } = await supabase
        .from('mood_entries')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30);

      if (error || !data) return 0;

      let streak = 0;
      const today = new Date();
      
      for (let i = 0; i < data.length; i++) {
        const entryDate = new Date(data[i].created_at);
        const daysDiff = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === i) {
          streak++;
        } else {
          break;
        }
      }

      return streak;
    } catch (error) {
      console.error('Error checking mood streak:', error);
      return 0;
    }
  };

  return {
    achievements,
    userStats,
    loading,
    fetchAchievements,
    fetchUserStats,
    awardAchievement,
    completeQuest,
    completeRoleplaySession,
    logMoodEntry,
    checkMoodStreak
  };
};