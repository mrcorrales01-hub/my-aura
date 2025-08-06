import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, Bell, Palette, Brain, Sparkles, LogOut } from 'lucide-react';

const Settings = () => {
  const { user, signOut } = useAuth();
  const { openCustomerPortal, subscribed, subscription_tier } = useSubscription();
  const { toast } = useToast();

  const [preferences, setPreferences] = useState({
    theme_preference: 'light',
    ai_tone: 'empathetic',
    auri_enabled: true,
    auri_tone: 'soothing',
    intention: 'emotional_wellbeing'
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setPreferences({
          theme_preference: data.theme_preference || 'light',
          ai_tone: data.ai_tone || 'empathetic',
          auri_enabled: data.auri_enabled ?? true,
          auri_tone: data.auri_tone || 'soothing',
          intention: data.intention || 'emotional_wellbeing'
        });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const updatePreferences = async (newPreferences: Partial<typeof preferences>) => {
    if (!user) return;

    setLoading(true);
    try {
      const updatedPreferences = { ...preferences, ...newPreferences };
      setPreferences(updatedPreferences);

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          ...updatedPreferences,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Settings updated",
        description: "Your preferences have been saved."
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: "Error",
        description: "Failed to update settings.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out."
    });
  };

  return (
    <div className="min-h-screen bg-background py-8 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-wellness-primary">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Account</span>
            </CardTitle>
            <CardDescription>Your account information and subscription status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Email</Label>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            
            <div>
              <Label>Subscription Status</Label>
              <div className="flex items-center space-x-2 mt-1">
                <p className="text-sm">
                  {subscribed ? `${subscription_tier} Plan` : 'Free Plan'}
                </p>
                {subscribed && (
                  <Button variant="outline" size="sm" onClick={openCustomerPortal}>
                    Manage Subscription
                  </Button>
                )}
              </div>
            </div>

            <Separator />
            
            <Button variant="destructive" onClick={handleSignOut} className="flex items-center space-x-2">
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </CardContent>
        </Card>

        {/* Theme & Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="h-5 w-5" />
              <span>Theme & Appearance</span>
            </CardTitle>
            <CardDescription>Customize how Aura looks and feels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select
                value={preferences.theme_preference}
                onValueChange={(value) => updatePreferences({ theme_preference: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* AI Assistant */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <span>AI Assistant</span>
            </CardTitle>
            <CardDescription>Customize how the AI coach communicates with you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Communication Style</Label>
              <Select
                value={preferences.ai_tone}
                onValueChange={(value) => updatePreferences({ ai_tone: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="empathetic">Soft & Empathetic</SelectItem>
                  <SelectItem value="direct">Clear & Direct</SelectItem>
                  <SelectItem value="conversational">Warm & Conversational</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Focus Area</Label>
              <Select
                value={preferences.intention}
                onValueChange={(value) => updatePreferences({ intention: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="emotional_wellbeing">Feel Better Emotionally</SelectItem>
                  <SelectItem value="relationships">Improve Relationships</SelectItem>
                  <SelectItem value="confidence">Build Confidence</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Auri Companion */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5" />
              <span>Auri Companion</span>
            </CardTitle>
            <CardDescription>Configure your personal AI companion</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Auri</Label>
                <p className="text-sm text-muted-foreground">
                  Show Auri companion throughout the app
                </p>
              </div>
              <Switch
                checked={preferences.auri_enabled}
                onCheckedChange={(checked) => updatePreferences({ auri_enabled: checked })}
              />
            </div>

            {preferences.auri_enabled && (
              <div className="space-y-2">
                <Label>Auri's Personality</Label>
                <Select
                  value={preferences.auri_tone}
                  onValueChange={(value) => updatePreferences({ auri_tone: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="soothing">Soothing & Calm</SelectItem>
                    <SelectItem value="playful">Playful & Fun</SelectItem>
                    <SelectItem value="professional">Professional & Focused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;