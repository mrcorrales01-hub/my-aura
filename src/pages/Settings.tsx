import React from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/features/settings/LanguageSwitcher';
import { TTSSettings } from '@/features/settings/components/TTSSettings';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { DemoControls } from '@/components/DemoControls';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Loader2 } from 'lucide-react';
import { useDataExport } from '@/hooks/useDataExport';

const Settings = () => {
  const { t } = useTranslation(['settings']);
  const { exportUserData, isExporting } = useDataExport();
  
  const [ttsEnabled, setTtsEnabled] = React.useState(() => {
    return localStorage.getItem('tts-enabled') === 'true';
  });

  const handleTTSChange = (enabled: boolean) => {
    setTtsEnabled(enabled);
    localStorage.setItem('tts-enabled', enabled.toString());
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">{t('settings.title')}</h1>
        
        <div className="max-w-2xl space-y-6">
          <LanguageSwitcher />
          <TTSSettings enabled={ttsEnabled} onEnabledChange={handleTTSChange} />
          <DemoControls />
          
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.dataExport')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {t('settings.dataExportDescription')}
              </p>
              <Button 
                onClick={exportUserData} 
                disabled={isExporting}
                className="w-full"
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {t('settings.exportButton')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Settings;