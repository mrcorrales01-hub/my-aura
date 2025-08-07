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
import { useTheme } from '@/contexts/ThemeContext';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { languages } from '@/hooks/useLanguage';

// Remove interface - using the one from useUserPreferences hook

export const EnhancedSettings = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { currentLanguage, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { preferences, loading, updatePreferences } = useUserPreferences();
  
  const [saving, setSaving] = useState(false);
  const [localPreferences, setLocalPreferences] = useState({
    theme_preference: 'auto' as 'light' | 'dark' | 'auto',
    language_preference: currentLanguage,
    ai_tone: 'supportive',
    auri_tone: 'soothing',
    auri_enabled: true,
    notification_enabled: true
  });

  // Load user preferences
  useEffect(() => {
    if (preferences) {
      setLocalPreferences({
        theme_preference: (preferences.theme_preference || theme) as 'light' | 'dark' | 'auto',
        language_preference: preferences.language_preference || currentLanguage,
        ai_tone: preferences.ai_tone || 'supportive',
        auri_tone: preferences.auri_tone || 'soothing',
        auri_enabled: preferences.auri_enabled ?? true,
        notification_enabled: true
      });
    }
  }, [preferences, theme, currentLanguage]);

  const savePreferences = async () => {
    if (!user) return;

    setSaving(true);
    try {
      await updatePreferences(localPreferences);
      
      toast({
        title: t('common.success'),
        description: t('settings.changesSaved')
      });
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: 'Failed to save preferences',
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
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={user?.email || ''}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={user?.email?.split('@')[0] || ''}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="aiTone">{t('settings.aiTone')}</Label>
            <Select 
              value={localPreferences.ai_tone} 
              onValueChange={(value) => setLocalPreferences(prev => ({ ...prev, ai_tone: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="supportive">
                  <div>
                    <div className="font-medium">{t('onboarding.tones.supportive')}</div>
                    <div className="text-sm text-muted-foreground">{t('onboarding.tones.supportiveDesc')}</div>
                  </div>
                </SelectItem>
                <SelectItem value="direct">
                  <div>
                    <div className="font-medium">{t('onboarding.tones.direct')}</div>
                    <div className="text-sm text-muted-foreground">{t('onboarding.tones.directDesc')}</div>
                  </div>
                </SelectItem>
                <SelectItem value="gentle">
                  <div>
                    <div className="font-medium">{t('onboarding.tones.gentle')}</div>
                    <div className="text-sm text-muted-foreground">{t('onboarding.tones.gentleDesc')}</div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Auri Companion</Label>
                <p className="text-sm text-muted-foreground">
                  Your AI companion for emotional support
                </p>
              </div>
              <Switch
                checked={localPreferences.auri_enabled}
                onCheckedChange={(checked) => setLocalPreferences(prev => ({ ...prev, auri_enabled: checked }))}
              />
            </div>

            {localPreferences.auri_enabled && (
              <div className="space-y-2">
                <Label>Auri Personality</Label>
                <Select 
                  value={localPreferences.auri_tone} 
                  onValueChange={(value) => setLocalPreferences(prev => ({ ...prev, auri_tone: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="soothing">Soothing & Calming</SelectItem>
                    <SelectItem value="energetic">Energetic & Motivating</SelectItem>
                    <SelectItem value="wise">Wise & Philosophical</SelectItem>
                    <SelectItem value="playful">Playful & Lighthearted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
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
            <Label htmlFor="theme">{t('settings.theme')}</Label>
            <Select 
              value={localPreferences.theme_preference} 
              onValueChange={(value) => setLocalPreferences(prev => ({ ...prev, theme_preference: value as 'light' | 'dark' | 'auto' }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">{t('nav.light')}</SelectItem>
                <SelectItem value="dark">{t('nav.dark')}</SelectItem>
                <SelectItem value="auto">{t('nav.system')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">{t('settings.language')}</Label>
            <Select 
              value={localPreferences.language_preference} 
              onValueChange={(value) => setLocalPreferences(prev => ({ ...prev, language_preference: value as any }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </span>
                  </SelectItem>
                ))}
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
              checked={localPreferences.notification_enabled}
              onCheckedChange={(checked) => setLocalPreferences(prev => ({ ...prev, notification_enabled: checked }))}
            />
          </div>

        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button 
          onClick={savePreferences} 
          disabled={saving}
          className="flex-1"
        >
          {saving ? 'Saving...' : t('settings.saveChanges')}
        </Button>
        
        <Button 
          onClick={handleSignOut} 
          variant="outline"
          className="flex items-center gap-2"
        >
          <Shield className="h-4 w-4" />
          {t('settings.logout')}
        </Button>
      </div>
    </div>
  );
};