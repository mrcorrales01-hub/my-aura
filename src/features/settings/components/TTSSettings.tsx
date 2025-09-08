import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { Volume2 } from 'lucide-react';

interface TTSSettingsProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
}

export const TTSSettings: React.FC<TTSSettingsProps> = ({
  enabled,
  onEnabledChange
}) => {
  const { t } = useTranslation('settings');

  const isSupported = 'speechSynthesis' in window;

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Volume2 className="w-5 h-5 text-primary" />
          <div className="flex-1">
            <Label htmlFor="tts-toggle" className="text-sm font-medium">
              {t('tts.title')}
            </Label>
            <p className="text-xs text-muted-foreground">
              {t('tts.description')}
            </p>
          </div>
          <Switch
            id="tts-toggle"
            checked={enabled && isSupported}
            onCheckedChange={onEnabledChange}
            disabled={!isSupported}
          />
        </div>
        
        {!isSupported && (
          <p className="text-xs text-muted-foreground">
            {t('tts.notSupported')}
          </p>
        )}
      </div>
    </Card>
  );
};