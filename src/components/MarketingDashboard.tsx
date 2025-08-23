import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  TrendingUp,
  Users,
  MessageSquare,
  Mail,
  Share2,
  Target,
  Bell,
  Calendar,
  BarChart3,
  Gift,
  Megaphone,
  Settings,
  Send,
  UserPlus,
  Award,
  Zap
} from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'push' | 'sms' | 'in_app';
  status: 'draft' | 'scheduled' | 'active' | 'completed';
  subject: string;
  content: string;
  target_audience: string;
  scheduled_at?: string;
  sent_count: number;
  open_rate: number;
  click_rate: number;
  created_at: string;
}

interface ReferralStats {
  total_referrals: number;
  successful_conversions: number;
  total_rewards_given: number;
  top_referrers: {
    user_id: string;
    referral_count: number;
    rewards_earned: number;
  }[];
}

const MarketingDashboard = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [createCampaignOpen, setCreateCampaignOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    type: 'email' as Campaign['type'],
    subject: '',
    content: '',
    target_audience: 'all',
    scheduled_at: ''
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchMarketingData();
  }, []);

  const fetchMarketingData = async () => {
    try {
      // Fetch campaigns (mock data for now - would come from a campaigns table)
      const mockCampaigns: Campaign[] = [
        {
          id: '1',
          name: 'Welcome Onboarding Series',
          type: 'email',
          status: 'active',
          subject: 'Welcome to My Aura - Your Journey Begins',
          content: 'Welcome email content...',
          target_audience: 'new_users',
          sent_count: 1250,
          open_rate: 68.5,
          click_rate: 12.3,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Mood Check-in Reminder',
          type: 'push',
          status: 'active',
          subject: 'How are you feeling today?',
          content: 'Push notification content...',
          target_audience: 'active_users',
          sent_count: 3420,
          open_rate: 45.2,
          click_rate: 8.7,
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Premium Feature Highlight',
          type: 'in_app',
          status: 'scheduled',
          subject: 'Unlock Advanced AI Coaching',
          content: 'In-app banner content...',
          target_audience: 'free_users',
          scheduled_at: new Date(Date.now() + 86400000).toISOString(),
          sent_count: 0,
          open_rate: 0,
          click_rate: 0,
          created_at: new Date().toISOString()
        }
      ];
      setCampaigns(mockCampaigns);

      // Fetch referral stats (mock data)
      const mockReferralStats: ReferralStats = {
        total_referrals: 1847,
        successful_conversions: 723,
        total_rewards_given: 14560,
        top_referrers: [
          { user_id: 'user1', referral_count: 23, rewards_earned: 460 },
          { user_id: 'user2', referral_count: 19, rewards_earned: 380 },
          { user_id: 'user3', referral_count: 15, rewards_earned: 300 }
        ]
      };
      setReferralStats(mockReferralStats);

    } catch (error) {
      console.error('Error fetching marketing data:', error);
      toast({
        title: "Error",
        description: "Failed to load marketing data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async () => {
    try {
      // In a real app, this would save to a campaigns table
      const campaign: Campaign = {
        id: Date.now().toString(),
        ...newCampaign,
        status: 'draft',
        sent_count: 0,
        open_rate: 0,
        click_rate: 0,
        created_at: new Date().toISOString()
      };

      setCampaigns([...campaigns, campaign]);
      setCreateCampaignOpen(false);
      setNewCampaign({
        name: '',
        type: 'email',
        subject: '',
        content: '',
        target_audience: 'all',
        scheduled_at: ''
      });

      toast({
        title: "Campaign Created",
        description: "Your marketing campaign has been created successfully.",
      });
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast({
        title: "Error",
        description: "Failed to create campaign.",
        variant: "destructive",
      });
    }
  };

  const sendTestNotification = async (type: string) => {
    try {
      // Mock implementation - would integrate with real push notification service
      toast({
        title: "Test Notification Sent",
        description: `Test ${type} notification sent to your device.`,
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast({
        title: "Error",
        description: "Failed to send test notification.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-primary/5 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary/5 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Marketing & Retention Dashboard</h1>
            <p className="text-xl text-muted-foreground">
              Manage campaigns, referrals, and user engagement
            </p>
          </div>
          <Dialog open={createCampaignOpen} onOpenChange={setCreateCampaignOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-primary/80">
                <Megaphone className="w-4 h-4 mr-2" />
                Create Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Marketing Campaign</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Campaign Name</Label>
                    <Input
                      value={newCampaign.name}
                      onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                      placeholder="e.g., Summer Wellness Challenge"
                    />
                  </div>
                  <div>
                    <Label>Campaign Type</Label>
                    <Select value={newCampaign.type} onValueChange={(value: Campaign['type']) => setNewCampaign({...newCampaign, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="push">Push Notification</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="in_app">In-App Message</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Subject/Title</Label>
                  <Input
                    value={newCampaign.subject}
                    onChange={(e) => setNewCampaign({...newCampaign, subject: e.target.value})}
                    placeholder="Engaging subject line..."
                  />
                </div>

                <div>
                  <Label>Content</Label>
                  <Textarea
                    value={newCampaign.content}
                    onChange={(e) => setNewCampaign({...newCampaign, content: e.target.value})}
                    placeholder="Campaign message content..."
                    rows={4}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Target Audience</Label>
                    <Select value={newCampaign.target_audience} onValueChange={(value) => setNewCampaign({...newCampaign, target_audience: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="new_users">New Users (< 7 days)</SelectItem>
                        <SelectItem value="active_users">Active Users</SelectItem>
                        <SelectItem value="inactive_users">Inactive Users</SelectItem>
                        <SelectItem value="free_users">Free Tier Users</SelectItem>
                        <SelectItem value="premium_users">Premium Users</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Schedule For (Optional)</Label>
                    <Input
                      type="datetime-local"
                      value={newCampaign.scheduled_at}
                      onChange={(e) => setNewCampaign({...newCampaign, scheduled_at: e.target.value})}
                    />
                  </div>
                </div>

                <Button onClick={createCampaign} disabled={!newCampaign.name || !newCampaign.subject}>
                  Create Campaign
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="campaigns" className="space-y-6">
          <TabsList>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="analytics">A/B Testing</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="space-y-6">
            {/* Campaign Stats */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Send className="w-8 h-8 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">12</p>
                      <p className="text-sm text-muted-foreground">Active Campaigns</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-8 h-8 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">48,392</p>
                      <p className="text-sm text-muted-foreground">Total Messages Sent</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-8 h-8 text-purple-500" />
                    <div>
                      <p className="text-2xl font-bold">64.2%</p>
                      <p className="text-sm text-muted-foreground">Avg Open Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Target className="w-8 h-8 text-orange-500" />
                    <div>
                      <p className="text-2xl font-bold">11.8%</p>
                      <p className="text-sm text-muted-foreground">Avg Click Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Campaigns List */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Recent Campaigns</h2>
              {campaigns.map((campaign) => (
                <Card key={campaign.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold">{campaign.name}</h3>
                          <Badge 
                            variant={
                              campaign.status === 'active' ? 'default' :
                              campaign.status === 'completed' ? 'secondary' :
                              campaign.status === 'scheduled' ? 'outline' : 'secondary'
                            }
                          >
                            {campaign.status}
                          </Badge>
                          <Badge variant="outline">{campaign.type}</Badge>
                        </div>
                        <p className="text-muted-foreground">{campaign.subject}</p>
                        <p className="text-sm text-muted-foreground">
                          Target: {campaign.target_audience.replace('_', ' ')}
                        </p>
                      </div>
                      
                      <div className="text-right space-y-1">
                        <div className="flex space-x-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Sent: </span>
                            <span className="font-medium">{campaign.sent_count.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Opens: </span>
                            <span className="font-medium">{campaign.open_rate}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Clicks: </span>
                            <span className="font-medium">{campaign.click_rate}%</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <BarChart3 className="w-4 h-4 mr-1" />
                            Analytics
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="referrals" className="space-y-6">
            {/* Referral Stats */}
            {referralStats && (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2">
                        <Share2 className="w-8 h-8 text-blue-500" />
                        <div>
                          <p className="text-2xl font-bold">{referralStats.total_referrals.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">Total Referrals</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2">
                        <UserPlus className="w-8 h-8 text-green-500" />
                        <div>
                          <p className="text-2xl font-bold">{referralStats.successful_conversions.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">Successful Conversions</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2">
                        <Gift className="w-8 h-8 text-purple-500" />
                        <div>
                          <p className="text-2xl font-bold">${(referralStats.total_rewards_given / 100).toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">Rewards Given</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Top Referrers */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Award className="w-5 h-5" />
                      <span>Top Referrers</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {referralStats.top_referrers.map((referrer, index) => (
                        <div key={referrer.user_id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">User {referrer.user_id.slice(-6)}</p>
                              <p className="text-sm text-muted-foreground">
                                {referrer.referral_count} referrals
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600">
                              ${(referrer.rewards_earned / 100).toFixed(2)}
                            </p>
                            <p className="text-xs text-muted-foreground">earned</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            {/* Push Notification Testing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Push Notification Testing</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Test Notifications</h3>
                    <div className="space-y-2">
                      <Button 
                        onClick={() => sendTestNotification('welcome')} 
                        variant="outline" 
                        className="w-full justify-start"
                      >
                        <Bell className="w-4 h-4 mr-2" />
                        Welcome Notification
                      </Button>
                      <Button 
                        onClick={() => sendTestNotification('mood_reminder')} 
                        variant="outline" 
                        className="w-full justify-start"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Mood Check-in Reminder
                      </Button>
                      <Button 
                        onClick={() => sendTestNotification('streak_celebration')} 
                        variant="outline" 
                        className="w-full justify-start"
                      >
                        <Award className="w-4 h-4 mr-2" />
                        Streak Celebration
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">Notification Settings</h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>• Delivery rate: 94.2%</p>
                      <p>• Average open rate: 18.7%</p>
                      <p>• Opt-out rate: 2.1%</p>
                      <p>• Best send time: 2-4 PM local time</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* A/B Testing */}
            <Card>
              <CardHeader>
                <CardTitle>A/B Testing Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">A/B Testing Module</p>
                  <p className="text-sm">
                    Test different onboarding flows, upgrade prompts, and feature presentations.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MarketingDashboard;