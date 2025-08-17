import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface MentalHealthCoin {
  id: string;
  user_id: string;
  amount: number;
  coin_type: string;
  source_activity: string;
  source_id?: string;
  description?: string;
  created_at: string;
}

interface CoinTransaction {
  id: string;
  type: 'earned' | 'spent';
  amount: number;
  description: string;
  activity: string;
  timestamp: string;
}

interface RewardItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  type: 'discount' | 'premium_unlock' | 'exclusive_access' | 'physical_item';
  category: string;
  icon: string;
  availability: 'unlimited' | 'limited' | 'monthly';
  remaining?: number;
}

export const useMentalHealthCoins = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [coins, setCoins] = useState<MentalHealthCoin[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<CoinTransaction[]>([]);

  const rewardCatalog: RewardItem[] = [
    {
      id: 'therapy_discount_10',
      name: '10% Therapy Discount',
      description: 'Get 10% off your next therapy session',
      cost: 50,
      type: 'discount',
      category: 'therapy',
      icon: '🎯',
      availability: 'unlimited'
    },
    {
      id: 'therapy_discount_25',
      name: '25% Therapy Discount', 
      description: 'Get 25% off your next therapy session',
      cost: 120,
      type: 'discount',
      category: 'therapy',
      icon: '💎',
      availability: 'limited',
      remaining: 5
    },
    {
      id: 'premium_music_week',
      name: 'Premium Music Access',
      description: '1 week of premium music library access',
      cost: 75,
      type: 'premium_unlock',
      category: 'content',
      icon: '🎵',
      availability: 'unlimited'
    },
    {
      id: 'premium_videos_week',
      name: 'Premium Video Access',
      description: '1 week of premium exercise videos',
      cost: 80,
      type: 'premium_unlock',
      category: 'content',
      icon: '🎬',
      availability: 'unlimited'
    },
    {
      id: 'early_feature_access',
      name: 'Beta Feature Access',
      description: 'Get early access to new features',
      cost: 200,
      type: 'exclusive_access',
      category: 'features',
      icon: '🚀',
      availability: 'monthly',
      remaining: 10
    },
    {
      id: 'wellness_journal',
      name: 'Premium Wellness Journal',
      description: 'Physical wellness journal shipped to you',
      cost: 500,
      type: 'physical_item',
      category: 'merchandise',
      icon: '📔',
      availability: 'limited',
      remaining: 3
    },
    {
      id: 'meditation_cushion',
      name: 'Meditation Cushion',
      description: 'Eco-friendly meditation cushion',
      cost: 800,
      type: 'physical_item',
      category: 'merchandise',
      icon: '🧘',
      availability: 'limited',
      remaining: 2
    }
  ];

  // Fetch user's coin data
  const fetchCoinsData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data: coinsData, error } = await supabase
        .from('mental_health_coins')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setCoins(coinsData || []);
      
      // Calculate balance
      const totalBalance = (coinsData || []).reduce((sum, coin) => sum + coin.amount, 0);
      setBalance(totalBalance);
      
      // Create recent transactions view
      const transactions: CoinTransaction[] = (coinsData || []).slice(0, 10).map(coin => ({
        id: coin.id,
        type: coin.amount > 0 ? 'earned' : 'spent',
        amount: Math.abs(coin.amount),
        description: coin.description || `${coin.source_activity} activity`,
        activity: coin.source_activity,
        timestamp: coin.created_at
      }));
      
      setRecentTransactions(transactions);
      
    } catch (error: any) {
      console.error('Error fetching coins data:', error);
      toast({
        title: "Error loading coins",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Award coins for activities
  const awardCoins = async (
    amount: number,
    sourceActivity: string,
    description?: string,
    sourceId?: string
  ) => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('mental_health_coins')
        .insert({
          user_id: user.id,
          amount,
          coin_type: 'wellness',
          source_activity: sourceActivity,
          source_id: sourceId,
          description: description || `Earned from ${sourceActivity}`
        });
      
      if (error) throw error;
      
      // Refresh data
      await fetchCoinsData();
      
      toast({
        title: `+${amount} Wellness Coins! 🪙`,
        description: description || `Great job with ${sourceActivity}!`,
      });
      
      return true;
    } catch (error: any) {
      console.error('Error awarding coins:', error);
      toast({
        title: "Error awarding coins",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  // Spend coins
  const spendCoins = async (
    amount: number,
    sourceActivity: string,
    description?: string,
    sourceId?: string
  ) => {
    if (!user) return false;
    
    if (balance < amount) {
      toast({
        title: "Insufficient coins",
        description: `You need ${amount} coins but only have ${balance}`,
        variant: "destructive",
      });
      return false;
    }
    
    try {
      const { error } = await supabase
        .from('mental_health_coins')
        .insert({
          user_id: user.id,
          amount: -amount, // Negative for spending
          coin_type: 'wellness',
          source_activity: sourceActivity,
          source_id: sourceId,
          description: description || `Spent on ${sourceActivity}`
        });
      
      if (error) throw error;
      
      // Refresh data
      await fetchCoinsData();
      
      toast({
        title: `Spent ${amount} coins! 💰`,
        description: description || `Redeemed: ${sourceActivity}`,
      });
      
      return true;
    } catch (error: any) {
      console.error('Error spending coins:', error);
      toast({
        title: "Error spending coins",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  // Redeem reward
  const redeemReward = async (reward: RewardItem) => {
    if (!user) return false;
    
    if (balance < reward.cost) {
      toast({
        title: "Insufficient coins",
        description: `You need ${reward.cost} coins but only have ${balance}`,
        variant: "destructive",
      });
      return false;
    }
    
    if (reward.availability === 'limited' && reward.remaining === 0) {
      toast({
        title: "Reward unavailable",
        description: "This reward is out of stock",
        variant: "destructive",
      });
      return false;
    }
    
    const success = await spendCoins(
      reward.cost,
      `reward_redemption`,
      `Redeemed: ${reward.name}`,
      reward.id
    );
    
    if (success) {
      // Execute reward-specific logic
      switch (reward.type) {
        case 'discount':
          await storeUserDiscount(reward);
          break;
        case 'premium_unlock':
          await unlockPremiumContent(reward);
          break;
        case 'exclusive_access':
          await grantExclusiveAccess(reward);
          break;
        case 'physical_item':
          await requestPhysicalItem(reward);
          break;
      }
      
      toast({
        title: "Reward redeemed! 🎉",
        description: `${reward.name} has been activated`,
      });
    }
    
    return success;
  };

  const storeUserDiscount = async (reward: RewardItem) => {
    // Store discount in user preferences or separate table
    try {
      console.log('Discount stored:', reward.id);
      // TODO: Implement user_discounts table and insert logic when needed
    } catch (error) {
      console.error('Error storing discount:', error);
    }
  };

  const unlockPremiumContent = async (reward: RewardItem) => {
    // Update user preferences to include premium access
    try {
      console.log('Premium content unlocked:', reward.id);
      // TODO: Implement premium access system when needed
    } catch (error) {
      console.error('Error unlocking premium content:', error);
    }
  };

  const grantExclusiveAccess = async (reward: RewardItem) => {
    try {
      console.log('Exclusive access granted:', reward.id);
      // TODO: Implement exclusive access system when needed
    } catch (error) {
      console.error('Error granting exclusive access:', error);
    }
  };

  const requestPhysicalItem = async (reward: RewardItem) => {
    try {
      console.log('Physical item requested:', reward.id);
      // TODO: Implement shipping system when needed
    } catch (error) {
      console.error('Error requesting physical item:', error);
    }
  };

  const getAffordableRewards = () => {
    return rewardCatalog.filter(reward => 
      reward.cost <= balance && 
      (reward.availability !== 'limited' || (reward.remaining && reward.remaining > 0))
    );
  };

  const getRewardsByCategory = (category: string) => {
    return rewardCatalog.filter(reward => reward.category === category);
  };

  const formatCoinsDisplay = (amount: number) => {
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}k`;
    }
    return amount.toString();
  };

  const getCoinEarningRate = (activity: string): number => {
    const rates: Record<string, number> = {
      'mood_checkin': 5,
      'journal_entry': 8,
      'meditation_session': 12,
      'music_session': 10,
      'video_exercise': 15,
      'therapy_session': 25,
      'daily_streak': 20,
      'weekly_goals': 30,
      'community_post': 8,
      'helping_others': 15,
      'milestone_achievement': 50
    };
    
    return rates[activity] || 5;
  };

  // Analytics functions
  const getTotalEarned = () => {
    return coins.filter(coin => coin.amount > 0).reduce((sum, coin) => sum + coin.amount, 0);
  };

  const getTotalSpent = () => {
    return Math.abs(coins.filter(coin => coin.amount < 0).reduce((sum, coin) => sum + coin.amount, 0));
  };

  const getTransactionsByType = (type: 'earned' | 'spent') => {
    return coins.filter(coin => type === 'earned' ? coin.amount > 0 : coin.amount < 0);
  };

  const getWeeklyEarnings = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return coins
      .filter(coin => 
        coin.amount > 0 && 
        new Date(coin.created_at) >= oneWeekAgo
      )
      .reduce((sum, coin) => sum + coin.amount, 0);
  };

  const getMonthlyStats = () => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const monthlyCoins = coins.filter(coin => new Date(coin.created_at) >= oneMonthAgo);
    
    return {
      earned: monthlyCoins.filter(coin => coin.amount > 0).reduce((sum, coin) => sum + coin.amount, 0),
      spent: Math.abs(monthlyCoins.filter(coin => coin.amount < 0).reduce((sum, coin) => sum + coin.amount, 0)),
      transactions: monthlyCoins.length
    };
  };

  // Load data on mount
  useEffect(() => {
    if (user) {
      fetchCoinsData();
    }
  }, [user]);

  return {
    // State
    coins,
    balance,
    loading,
    recentTransactions,
    rewardCatalog,
    
    // Functions
    awardCoins,
    spendCoins,
    redeemReward,
    getAffordableRewards,
    getRewardsByCategory,
    formatCoinsDisplay,
    getCoinEarningRate,
    
    // Analytics
    getTotalEarned,
    getTotalSpent,
    getTransactionsByType,
    getWeeklyEarnings,
    getMonthlyStats,
    fetchCoinsData
  };
};