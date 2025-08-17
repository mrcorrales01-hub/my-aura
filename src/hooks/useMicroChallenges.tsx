import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface MicroChallenge {
  id: string;
  user_id: string;
  challenge_type: string;
  title: string;
  description: string;
  duration_seconds: number;
  instructions: any;
  reward_coins: number;
  challenge_date: string;
  completed_at?: string;
  effectiveness_rating?: number;
}

export const useMicroChallenges = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [todaysChallenges, setTodaysChallenges] = useState<MicroChallenge[]>([]);
  const [completedChallenges, setCompletedChallenges] = useState<MicroChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChallenge, setActiveChallenge] = useState<MicroChallenge | null>(null);

  const challengeTemplates = [
    {
      type: 'breathing',
      title: 'Deep Breath Reset',
      description: 'Take 5 deep, mindful breaths',
      duration_seconds: 60,
      instructions: {
        steps: [
          'Sit comfortably with your back straight',
          'Inhale slowly for 4 counts',
          'Hold your breath for 4 counts',
          'Exhale slowly for 6 counts',
          'Repeat 5 times'
        ],
        visual_cue: 'breathing_circle'
      },
      reward_coins: 5
    },
    {
      type: 'gratitude',
      title: 'Gratitude Moment',
      description: 'Write down 3 things you\'re grateful for',
      duration_seconds: 90,
      instructions: {
        steps: [
          'Think of something small that made you smile today',
          'Consider a person who positively impacts your life',
          'Appreciate something about yourself',
          'Write each one down briefly'
        ],
        prompt: 'What brought you joy today?'
      },
      reward_coins: 7
    },
    {
      type: 'meditation',
      title: 'Mindful Minute',
      description: 'One minute of focused awareness',
      duration_seconds: 60,
      instructions: {
        steps: [
          'Close your eyes or soften your gaze',
          'Focus on your breath naturally',
          'When thoughts arise, gently return to breath',
          'Stay present for the full minute'
        ],
        audio_guide: 'mindful_minute_guide'
      },
      reward_coins: 6
    },
    {
      type: 'movement',
      title: 'Energy Boost',
      description: 'Quick body movement to energize',
      duration_seconds: 120,
      instructions: {
        steps: [
          'Stand up and stretch your arms overhead',
          'Do 10 shoulder rolls backwards',
          'March in place for 30 seconds',
          'Take 3 deep breaths with arm movements'
        ],
        animation: 'movement_guide'
      },
      reward_coins: 8
    }
  ];

  useEffect(() => {
    if (user) {
      fetchTodaysChallenges();
      fetchCompletedChallenges();
    }
  }, [user]);

  const fetchTodaysChallenges = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('micro_challenges')
        .select('*')
        .eq('user_id', user!.id)
        .eq('challenge_date', today)
        .order('created_at');

      if (error) throw error;

      // If no challenges for today, generate them
      if (!data || data.length === 0) {
        await generateDailyChallenges();
      } else {
        setTodaysChallenges(data);
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
    }
  };

  const fetchCompletedChallenges = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('micro_challenges')
        .select('*')
        .eq('user_id', user!.id)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setCompletedChallenges(data || []);
    } catch (error) {
      console.error('Error fetching completed challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateDailyChallenges = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Select 3 random challenge types for today
      const shuffledTemplates = [...challengeTemplates].sort(() => 0.5 - Math.random());
      const selectedTemplates = shuffledTemplates.slice(0, 3);

      const challengesToCreate = selectedTemplates.map(template => ({
        user_id: user.id,
        challenge_type: template.type,
        title: template.title,
        description: template.description,
        duration_seconds: template.duration_seconds,
        instructions: template.instructions,
        reward_coins: template.reward_coins,
        challenge_date: today
      }));

      const { data, error } = await supabase
        .from('micro_challenges')
        .insert(challengesToCreate)
        .select();

      if (error) throw error;

      setTodaysChallenges(data || []);

      toast({
        title: "New Daily Challenges! 🎯",
        description: "3 micro-challenges ready for you today",
      });
    } catch (error) {
      console.error('Error generating challenges:', error);
      toast({
        title: "Error",
        description: "Failed to generate daily challenges",
        variant: "destructive"
      });
    }
  };

  const startChallenge = async (challenge: MicroChallenge) => {
    setActiveChallenge(challenge);
    
    toast({
      title: `Starting: ${challenge.title} ⏱️`,
      description: `${challenge.duration_seconds} seconds of wellness`,
    });
  };

  const completeChallenge = async (
    challengeId: string, 
    effectivenessRating?: number
  ) => {
    try {
      const { error } = await supabase
        .from('micro_challenges')
        .update({
          completed_at: new Date().toISOString(),
          effectiveness_rating: effectivenessRating
        })
        .eq('id', challengeId);

      if (error) throw error;

      const challenge = todaysChallenges.find(c => c.id === challengeId);
      if (challenge) {
        // Award coins
        await awardCoins(challenge.reward_coins, 'micro_challenge', challengeId);
        
        toast({
          title: "Challenge Complete! 🎉",
          description: `+${challenge.reward_coins} Mental Health Coins earned`,
        });
      }

      setActiveChallenge(null);
      await fetchTodaysChallenges();
      await fetchCompletedChallenges();

      return true;
    } catch (error) {
      console.error('Error completing challenge:', error);
      toast({
        title: "Error",
        description: "Failed to complete challenge",
        variant: "destructive"
      });
      return false;
    }
  };

  const awardCoins = async (amount: number, source: string, sourceId: string) => {
    try {
      await supabase
        .from('mental_health_coins')
        .insert({
          user_id: user!.id,
          coin_type: 'earned',
          amount: amount,
          source_activity: source,
          source_id: sourceId,
          description: `Completed micro-challenge`
        });
    } catch (error) {
      console.error('Error awarding coins:', error);
    }
  };

  const getTodayProgress = () => {
    const completed = todaysChallenges.filter(c => c.completed_at).length;
    const total = todaysChallenges.length;
    const coinsEarned = todaysChallenges
      .filter(c => c.completed_at)
      .reduce((sum, c) => sum + c.reward_coins, 0);

    return {
      completed,
      total,
      coinsEarned,
      progress: total > 0 ? (completed / total) * 100 : 0
    };
  };

  const getWeeklyStats = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const weeklyCompleted = completedChallenges.filter(
      c => new Date(c.completed_at!) >= oneWeekAgo
    );

    const totalCompleted = weeklyCompleted.length;
    const totalCoins = weeklyCompleted.reduce((sum, c) => sum + c.reward_coins, 0);
    const avgRating = weeklyCompleted.length > 0
      ? weeklyCompleted.reduce((sum, c) => sum + (c.effectiveness_rating || 0), 0) / weeklyCompleted.length
      : 0;

    return {
      totalCompleted,
      totalCoins,
      avgRating: Math.round(avgRating * 10) / 10,
      streak: calculateStreak()
    };
  };

  const calculateStreak = () => {
    // Calculate consecutive days with completed challenges
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      const hasCompletedChallenge = completedChallenges.some(
        c => c.challenge_date === dateStr
      );
      
      if (hasCompletedChallenge) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  return {
    todaysChallenges,
    completedChallenges,
    activeChallenge,
    loading,
    challengeTemplates,
    startChallenge,
    completeChallenge,
    generateDailyChallenges,
    getTodayProgress,
    getWeeklyStats,
    fetchTodaysChallenges,
    fetchCompletedChallenges
  };
};