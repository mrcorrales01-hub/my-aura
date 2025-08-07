import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';
import { LoadingButton } from '@/components/ui/loading-button';
import { UserCircle, Settings, Shield, Bell, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

interface UserPreferences {
  user_id: string;
  display_name?: string;
  theme_preference?: string;
  notification_enabled?: boolean;
  language_preference?: string;
  communication_style?: string;
  relationship_status?: string;
  main_concerns?: string[];
  privacy_level?: string;
  updated_at?: string;
}

export const EnhancedSettings = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { currentLanguage, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({
    user_id: user?.id || '',
    display_name: '',
    theme_preference: 'system',
    notification_enabled: true,
    language_preference: currentLanguage,
    communication_style: 'supportive',
    relationship_status: 'single',
    main_concerns: [],
    privacy_level: 'normal'
  });

  // Load user preferences
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          setPreferences({
            ...preferences,
            ...data
          });
        }
      } catch (error: any) {
        toast({
          title: 'Error loading preferences',
          description: error.message,
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [user]);

  const savePreferences = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          ...preferences,
          user_id: user.id,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Update language if changed
      if (preferences.language_preference && preferences.language_preference !== currentLanguage) {
        await setLanguage(preferences.language_preference as any);
      }

      // Update theme if changed
      if (preferences.theme_preference && preferences.theme_preference !== theme) {
        setTheme(preferences.theme_preference);
      }

      toast({
        title: 'Settings saved',
        description: 'Your preferences have been updated successfully'
      });
    } catch (error: any) {
      toast({
        title: 'Error saving settings',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Signed out',
        description: 'You have been signed out successfully'
      });
    } catch (error: any) {
      toast({
        title: 'Error signing out',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="grid gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-muted rounded w-1/3"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
                <div className="h-10 bg-muted rounded"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <Settings className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCircle className="w-5 h-5" />
            Profile
          </CardTitle>
          <CardDescription>
            Manage your personal information and display preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={preferences.display_name || ''}
              onChange={(e) => setPreferences(prev => ({ ...prev, display_name: e.target.value }))}
              placeholder="How you'd like to be addressed"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="relationshipStatus">Relationship Status</Label>
            <Select 
              value={preferences.relationship_status} 
              onValueChange={(value) => setPreferences(prev => ({ ...prev, relationship_status: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="dating">Dating</SelectItem>
                <SelectItem value="relationship">In a relationship</SelectItem>
                <SelectItem value="married">Married</SelectItem>
                <SelectItem value="complicated">It's complicated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="concerns">Main Areas of Focus</Label>
            <Textarea
              id="concerns"
              value={preferences.main_concerns?.join(', ') || ''}
              onChange={(e) => setPreferences(prev => ({ 
                ...prev, 
                main_concerns: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
              }))}
              placeholder="e.g., anxiety, communication, self-esteem"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            Appearance & Language
          </CardTitle>
          <CardDescription>
            Customize how Aura looks and speaks to you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select 
              value={preferences.theme_preference} 
              onValueChange={(value) => setPreferences(prev => ({ ...prev, theme_preference: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select 
              value={preferences.language_preference} 
              onValueChange={(value) => setPreferences(prev => ({ ...prev, language_preference: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">🇺🇸 English</SelectItem>
                <SelectItem value="es">🇪🇸 Español</SelectItem>
                <SelectItem value="sv">🇸🇪 Svenska</SelectItem>
                <SelectItem value="fr">🇫🇷 Français</SelectItem>
                <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
                <SelectItem value="pt">🇧🇷 Português</SelectItem>
                <SelectItem value="zh">🇨🇳 简体中文</SelectItem>
                <SelectItem value="ja">🇯🇵 日本語</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="communicationStyle">Communication Style</Label>
            <Select 
              value={preferences.communication_style} 
              onValueChange={(value) => setPreferences(prev => ({ ...prev, communication_style: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="supportive">Supportive & Warm</SelectItem>
                <SelectItem value="direct">Direct & Clear</SelectItem>
                <SelectItem value="gentle">Gentle & Patient</SelectItem>
                <SelectItem value="motivational">Motivational & Energetic</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privacy & Notifications
          </CardTitle>
          <CardDescription>
            Control your privacy and notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications for check-ins and reminders
              </p>
            </div>
            <Switch
              checked={preferences.notification_enabled}
              onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, notification_enabled: checked }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="privacy">Privacy Level</Label>
            <Select 
              value={preferences.privacy_level} 
              onValueChange={(value) => setPreferences(prev => ({ ...prev, privacy_level: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minimal">Minimal - Essential data only</SelectItem>
                <SelectItem value="normal">Normal - Standard experience</SelectItem>
                <SelectItem value="enhanced">Enhanced - Personalized features</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <LoadingButton 
          onClick={savePreferences} 
          loading={saving}
          className="flex-1"
          variant="wellness"
        >
          Save All Changes
        </LoadingButton>
        
        <Button 
          onClick={handleSignOut} 
          variant="outline"
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
};