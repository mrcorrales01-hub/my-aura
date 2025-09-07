import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Settings, Globe, Bell, Shield, Download, LogOut } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n/index';

const SettingsPage = () => {
  const { t, i18n } = useTranslation(['settings', 'common']);
  const { user, signOut } = useAuthContext();
  const [notifications, setNotifications] = useState(true);
  const [analytics, setAnalytics] = useState(true);

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
    localStorage.setItem('aura-lang', language);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const languageNames = {
    sv: 'Svenska',
    en: 'English', 
    es: 'Español',
    no: 'Norsk',
    da: 'Dansk',
    fi: 'Suomi'
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center py-6">
        <Settings className="w-16 h-16 text-gray-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Inställningar</h1>
        <p className="text-muted-foreground">Anpassa din My Aura-upplevelse</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Language Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Språk
              </CardTitle>
              <CardDescription>
                Välj ditt önskade språk för appen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Label>Appspråk</Label>
                <Select 
                  value={i18n.language} 
                  onValueChange={handleLanguageChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_LANGUAGES.map(lang => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notiser
              </CardTitle>
              <CardDescription>
                Hantera dina notifieringsinställningar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Påminnelser om humörspårning</Label>
                  <p className="text-sm text-muted-foreground">
                    Få dagliga påminnelser att registrera ditt humör
                  </p>
                </div>
                <Switch 
                  checked={notifications} 
                  onCheckedChange={setNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Uppmuntrande meddelanden</Label>
                  <p className="text-sm text-muted-foreground">
                    Få positiva meddelanden och tips
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Integritet & Säkerhet
              </CardTitle>
              <CardDescription>
                Kontrollera dina integritets- och säkerhetsinställningar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Analysdata</Label>
                  <p className="text-sm text-muted-foreground">
                    Hjälp oss förbättra appen genom anonymiserad data
                  </p>
                </div>
                <Switch 
                  checked={analytics} 
                  onCheckedChange={setAnalytics}
                />
              </div>
              
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Ladda ner mina data
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle>Konto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">E-post</Label>
                <p className="font-medium">{user?.email}</p>
              </div>
              
              <div>
                <Label className="text-sm text-muted-foreground">Medlem sedan</Label>
                <p className="font-medium">
                  {new Date(user?.created_at || '').toLocaleDateString('sv-SE')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Konto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" disabled>
                Ändra lösenord
              </Button>
              
              <Button variant="outline" className="w-full justify-start" disabled>
                Radera konto
              </Button>
              
              <Button 
                variant="destructive" 
                className="w-full justify-start"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logga ut
              </Button>
            </CardContent>
          </Card>

          {/* App Info */}
          <Card>
            <CardHeader>
              <CardTitle>App-information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Version</span>
                <span>2.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Byggnummer</span>
                <span>240120</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;