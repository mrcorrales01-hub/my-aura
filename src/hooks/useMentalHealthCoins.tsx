import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface CoinTransaction {
  id: string;
  user_id: string;
  coin_type: 'earned' | 'spent' | 'bonus';
  amount: number;
  source_activity: string;
  source_id?: string;
  description: string;
  created_at: string;
}

interface RewardItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  type: 'discount' | 'content' | 'feature' | 'physical';
  availability: 'unlimited' | 'limited' | 'one_time';
  image_url?: string;
}

export const useMentalHealthCoins = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const rewardStore: RewardItem[] = [
    {
      id: 'therapist_discount_10',
      name: '10% Therapist Session Discount',
      description: 'Save 10% on your next therapy session',
      cost: 50,
      type: 'discount',
      availability: 'unlimited'
    },
    {
      id: 'premium_music_week',
      name: 'Premium Music (1 Week)',
      description: 'Access to exclusive premium music collection',
      cost: 25,
      type: 'content',
      availability: 'unlimited'
    },
    {
      id: 'vr_world_unlock',
      name: 'Unlock VR World',
      description: 'Access to exclusive VR therapy environments',
      cost: 75,
      type: 'feature',
      availability: 'unlimited'
    },
    {
      id: 'ai_avatar_custom',
      name: 'Custom AI Avatar',
      description: 'Create your personalized AI companion',
      cost: 100,
      type: 'feature',
      availability: 'one_time'
    },
    {
      id: 'therapist_discount_25',
      name: '25% Therapist Session Discount',
      description: 'Save 25% on your next therapy session',
      cost: 150,
      type: 'discount',
      availability: 'limited'
    },
    {
      id: 'mindfulness_course',
      name: 'Advanced Mindfulness Course',
      description: '30-day guided mindfulness journey',
      cost: 200,
      type: 'content',
      availability: 'unlimited'
    },
    {
      id: 'wellness_box',
      name: 'Wellness Care Package',
      description: 'Physical wellness items shipped to you',
      cost: 500,
      type: 'physical',
      availability: 'limited'
    }
  ];

  useEffect(() => {
    if (user) {
      fetchCoinsData();
    }
  }, [user]);

  const fetchCoinsData = async () => {
    try {
      setLoading(true);

      // Fetch all coin transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('mental_health_coins')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (transactionsError) throw transactionsError;

      setTransactions((transactionsData || []) as CoinTransaction[]);

      // Calculate balance
      const totalBalance = (transactionsData || []).reduce((sum, transaction) => {
        return transaction.coin_type === 'spent' 
          ? sum - transaction.amount 
          : sum + transaction.amount;
      }, 0);

      setBalance(totalBalance);
    } catch (error) {
      console.error('Error fetching coins data:', error);
      toast({
        title: "Error",
        description: "Failed to load coins data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const earnCoins = async (
    amount: number,
    sourceActivity: string,
    description: string,
    sourceId?: string
  ) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('mental_health_coins')
        .insert({
          user_id: user.id,
          coin_type: 'earned',
          amount: amount,
          source_activity: sourceActivity,
          source_id: sourceId,
          description: description
        });

      if (error) throw error;

      await fetchCoinsData();

      toast({
        title: "Coins Earned! 🪙",
        description: `+${amount} Mental Health Coins: ${description}`,
      });

      return true;
    } catch (error) {
      console.error('Error earning coins:', error);
      return false;
    }
  };

  const spendCoins = async (
    amount: number,
    sourceActivity: string,
    description: string,
    sourceId?: string
  ) => {
    if (!user || balance < amount) return false;

    try {
      const { error } = await supabase
        .from('mental_health_coins')
        .insert({
          user_id: user.id,
          coin_type: 'spent',
          amount: amount,
          source_activity: sourceActivity,
          source_id: sourceId,
          description: description
        });

      if (error) throw error;

      await fetchCoinsData();

      toast({
        title: "Purchase Complete! 🛍️",
        description: `Spent ${amount} coins: ${description}`,
      });

      return true;
    } catch (error) {
      console.error('Error spending coins:', error);
      toast({
        title: "Purchase Failed",
        description: "Unable to complete purchase",
        variant: "destructive"
      });
      return false;
    }
  };

  const redeemReward = async (rewardId: string) => {
    const reward = rewardStore.find(r => r.id === rewardId);
    if (!reward || balance < reward.cost) return false;

    const success = await spendCoins(
      reward.cost,
      'reward_redemption',
      `Redeemed: ${reward.name}`,
      rewardId
    );

    if (success) {
      // Handle specific reward types
      switch (reward.type) {
        case 'discount':
          // Store discount for later use
          await storeUserDiscount(reward);
          break;
        case 'content':
          // Unlock premium content
          await unlockPremiumContent(reward);
          break;
        case 'feature':
          // Enable feature for user
          await enableUserFeature(reward);
          break;
        case 'physical':
          // Initiate shipping process
          await initiateShipping(reward);
          break;
      }

      toast({
        title: "Reward Redeemed! 🎁",
        description: `${reward.name} has been added to your account`,
      });
    }

    return success;
  };

  const storeUserDiscount = async (reward: RewardItem) => {
    // Store discount in user preferences or separate table
    try {
      // Note: user_discounts table would need to be created in migration
      console.log('Discount stored:', reward.id);
      // TODO: Implement user_discounts table and insert logic
    } catch (error) {
      console.error('Error storing discount:', error);
    }
  };

  const unlockPremiumContent = async (reward: RewardItem) => {
    // Update user preferences to include premium access
    try {
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 1 week
      
      await supabase
        .from('user_premium_access')
        .upsert({
          user_id: user!.id,
          content_type: reward.id,
          expires_at: expiresAt.toISOString()
        });
    } catch (error) {
      console.error('Error unlocking content:', error);
    }
  };

  const enableUserFeature = async (reward: RewardItem) => {
    // Enable feature in user preferences
    try {
      await supabase
        .from('user_feature_access')
        .upsert({
          user_id: user!.id,
          feature_type: reward.id,
          enabled: true,
          granted_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error enabling feature:', error);
    }
  };

  const initiateShipping = async (reward: RewardItem) => {
    // Create shipping request
    try {
      await supabase
        .from('shipping_requests')
        .insert({
          user_id: user!.id,
          reward_id: reward.id,
          reward_name: reward.name,
          status: 'pending',
          requested_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error initiating shipping:', error);
    }
  };

  const getAffordableRewards = () => {
    return rewardStore.filter(reward => reward.cost <= balance);
  };

  const getTransactionsByType = (type: 'earned' | 'spent' | 'bonus') => {
    return transactions.filter(t => t.coin_type === type);
  };

  const getWeeklyEarnings = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return transactions
      .filter(t => t.coin_type === 'earned' && new Date(t.created_at) >= oneWeekAgo)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getMonthlyStats = () => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const monthlyTransactions = transactions.filter(
      t => new Date(t.created_at) >= oneMonthAgo
    );

    const earned = monthlyTransactions
      .filter(t => t.coin_type === 'earned')
      .reduce((sum, t) => sum + t.amount, 0);

    const spent = monthlyTransactions
      .filter(t => t.coin_type === 'spent')
      .reduce((sum, t) => sum + t.amount, 0);

    return { earned, spent, net: earned - spent };
  };

  return {
    balance,
    transactions,
    rewardStore,
    loading,
    earnCoins,
    spendCoins,
    redeemReward,
    getAffordableRewards,
    getTransactionsByType,
    getWeeklyEarnings,
    getMonthlyStats,
    fetchCoinsData
  };
};