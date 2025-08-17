import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Coins, 
  ShoppingBag, 
  TrendingUp, 
  Gift,
  Percent,
  Crown,
  Package,
  History,
  Star,
  Lock,
  CheckCircle
} from 'lucide-react';
import { useMentalHealthCoins } from '@/hooks/useMentalHealthCoins';

const SmartRewardsSystem = () => {
  const {
    balance,
    transactions,
    rewardStore,
    loading,
    redeemReward,
    getAffordableRewards,
    getTransactionsByType,
    getWeeklyEarnings,
    getMonthlyStats
  } = useMentalHealthCoins();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const weeklyEarnings = getWeeklyEarnings();
  const monthlyStats = getMonthlyStats();
  const affordableRewards = getAffordableRewards();

  const rewardCategories = [
    { id: 'all', name: 'All Rewards', icon: Gift },
    { id: 'discount', name: 'Discounts', icon: Percent },
    { id: 'content', name: 'Premium Content', icon: Crown },
    { id: 'feature', name: 'Features', icon: Star },
    { id: 'physical', name: 'Physical Items', icon: Package }
  ];

  const rewardIcons = {
    discount: Percent,
    content: Crown,
    feature: Star,
    physical: Package
  };

  const getRewardIcon = (type: string) => {
    return rewardIcons[type as keyof typeof rewardIcons] || Gift;
  };

  const filteredRewards = selectedCategory === 'all' 
    ? rewardStore 
    : rewardStore.filter(reward => reward.type === selectedCategory);

  const handleRedeemReward = async (rewardId: string) => {
    const success = await redeemReward(rewardId);
    if (success) {
      // Reward redeemed successfully
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
          Mental Health Rewards 🪙
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Earn coins through wellness activities and redeem them for premium content, discounts, and more
        </p>
      </div>

      {/* Balance & Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
              <Coins className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">{balance}</div>
              <div className="text-sm text-muted-foreground">Total Balance</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{weeklyEarnings}</div>
              <div className="text-sm text-muted-foreground">This Week</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Gift className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{affordableRewards.length}</div>
              <div className="text-sm text-muted-foreground">Available</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{monthlyStats.spent}</div>
              <div className="text-sm text-muted-foreground">Spent This Month</div>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="rewards" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rewards">Reward Store</TabsTrigger>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="rewards" className="space-y-6">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {rewardCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center space-x-2"
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{category.name}</span>
                </Button>
              );
            })}
          </div>

          {/* Rewards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRewards.map((reward) => {
              const IconComponent = getRewardIcon(reward.type);
              const canAfford = balance >= reward.cost;
              const isLimited = reward.availability === 'limited';
              const isOneTime = reward.availability === 'one_time';
              
              return (
                <Card 
                  key={reward.id}
                  className={`p-4 transition-all duration-300 ${
                    canAfford ? 'hover:shadow-lg hover:shadow-glow' : 'opacity-60'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 flex items-center justify-center">
                        <IconComponent className="w-6 h-6 text-purple-600" />
                      </div>
                      
                      {isLimited && (
                        <Badge variant="destructive" className="text-xs">
                          Limited
                        </Badge>
                      )}
                      {isOneTime && (
                        <Badge variant="secondary" className="text-xs">
                          One Time
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{reward.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {reward.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1 text-yellow-600">
                        <Coins className="w-4 h-4" />
                        <span className="font-semibold">{reward.cost}</span>
                      </div>
                      
                      <Button
                        size="sm"
                        onClick={() => handleRedeemReward(reward.id)}
                        disabled={!canAfford}
                        className={canAfford ? "bg-purple-600 hover:bg-purple-700" : ""}
                      >
                        {canAfford ? (
                          <>
                            <ShoppingBag className="w-3 h-3 mr-1" />
                            Redeem
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3 mr-1" />
                            Locked
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="space-y-4">
            {transactions.slice(0, 20).map((transaction) => (
              <Card key={transaction.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      transaction.coin_type === 'earned' 
                        ? 'bg-green-100 text-green-600'
                        : transaction.coin_type === 'spent'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {transaction.coin_type === 'earned' ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : transaction.coin_type === 'spent' ? (
                        <ShoppingBag className="w-4 h-4" />
                      ) : (
                        <Gift className="w-4 h-4" />
                      )}
                    </div>
                    
                    <div>
                      <div className="font-medium">{transaction.description}</div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {transaction.source_activity.replace('_', ' ')} • {' '}
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className={`font-semibold ${
                    transaction.coin_type === 'earned' 
                      ? 'text-green-600'
                      : transaction.coin_type === 'spent'
                      ? 'text-red-600'
                      : 'text-blue-600'
                  }`}>
                    {transaction.coin_type === 'spent' ? '-' : '+'}
                    {transaction.amount}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                Monthly Overview
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Coins Earned</span>
                  <span className="font-semibold text-green-600">+{monthlyStats.earned}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Coins Spent</span>
                  <span className="font-semibold text-red-600">-{monthlyStats.spent}</span>
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-medium">Net Change</span>
                  <span className={`font-bold ${
                    monthlyStats.net >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {monthlyStats.net >= 0 ? '+' : ''}{monthlyStats.net}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center">
                <History className="w-5 h-5 mr-2 text-blue-600" />
                Activity Breakdown
              </h3>
              
              <div className="space-y-3">
                {['micro_challenge', 'meditation', 'therapy', 'music_session'].map((activity) => {
                  const activityTransactions = getTransactionsByType('earned')
                    .filter(t => t.source_activity === activity);
                  const total = activityTransactions.reduce((sum, t) => sum + t.amount, 0);
                  
                  return (
                    <div key={activity} className="flex justify-between items-center">
                      <span className="text-muted-foreground capitalize">
                        {activity.replace('_', ' ')}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">
                          {activityTransactions.length}x
                        </span>
                        <span className="font-semibold text-green-600">+{total}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SmartRewardsSystem;