import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, Mic, MicOff, Volume2, Settings } from 'lucide-react';
import { useI18n } from '@/hooks/useMultilingualI18n';
import { MultilingualChat } from './MultilingualChat';
import { supabase } from '@/integrations/supabase/client';

interface AIPersonality {
  id: string;
  name: string;
  description: string;
  supportedLanguages: string[];
  culturalContext: string;
}

const aiPersonalities: AIPersonality[] = [
  {
    id: 'auri-global',
    name: 'Auri (Global)',
    description: 'Culturally-aware wellness coach',
    supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'sv'],
    culturalContext: 'western'
  },
  {
    id: 'auri-mena',
    name: 'Auri (MENA)',
    description: 'Middle East & North Africa specialized',
    supportedLanguages: ['ar', 'fa', 'tr'],
    culturalContext: 'mena'
  },
  {
    id: 'auri-asia',
    name: 'Auri (Asia-Pacific)',
    description: 'Asian cultural context specialist',
    supportedLanguages: ['zh-CN', 'zh-TW', 'ja', 'ko', 'hi', 'bn', 'th', 'vi'],
    culturalContext: 'asian'
  },
  {
    id: 'auri-sea',
    name: 'Auri (Southeast Asia)',
    description: 'Southeast Asian cultural specialist',
    supportedLanguages: ['tl', 'vi', 'th'],
    culturalContext: 'sea'
  }
];

export const MultilingualAI: React.FC = () => {
  const { t, currentLanguage, languages, currentLang } = useI18n();
  const [selectedPersonality, setSelectedPersonality] = useState<string>('auri-global');
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [autoTranslate, setAutoTranslate] = useState(true);

  // Get appropriate AI personality based on current language
  useEffect(() => {
    const compatiblePersonality = aiPersonalities.find(p => 
      p.supportedLanguages.includes(currentLanguage)
    );
    
    if (compatiblePersonality && compatiblePersonality.id !== selectedPersonality) {
      setSelectedPersonality(compatiblePersonality.id);
    }
  }, [currentLanguage]);

  const currentPersonality = aiPersonalities.find(p => p.id === selectedPersonality) || aiPersonalities[0];

  const handleVoiceToggle = async () => {
    if (!voiceEnabled) {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setVoiceEnabled(true);
      } catch (error) {
        console.error('Microphone access denied:', error);
      }
    } else {
      setVoiceEnabled(false);
      setIsListening(false);
    }
  };

  const handleStartListening = () => {
    if (!voiceEnabled) return;
    setIsListening(true);
    // Voice recognition logic would go here
  };

  const handleStopListening = () => {
    setIsListening(false);
    // Stop voice recognition
  };

  return (
    <div className="h-full flex flex-col gap-4">
      {/* AI Configuration Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            {t('chat.title')} - {t('advanced.translation')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Current Language Display */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('settings.language')}</label>
              <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                <span className="text-lg">{currentLang.flag}</span>
                <div>
                  <div className="font-medium">{currentLang.nativeName}</div>
                  <div className="text-xs text-muted-foreground">{currentLang.name}</div>
                </div>
              </div>
            </div>

            {/* AI Personality Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">AI Personality</label>
              <Select value={selectedPersonality} onValueChange={setSelectedPersonality}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {aiPersonalities.map((personality) => (
                    <SelectItem key={personality.id} value={personality.id}>
                      <div>
                        <div className="font-medium">{personality.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {personality.description}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Voice & Translation Controls */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Controls</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={voiceEnabled ? "default" : "outline"}
                  size="sm"
                  onClick={handleVoiceToggle}
                  className="flex items-center gap-1"
                >
                  {voiceEnabled ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3" />}
                  Voice
                </Button>
                
                <Button
                  variant={autoTranslate ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAutoTranslate(!autoTranslate)}
                  className="flex items-center gap-1"
                >
                  <Globe className="w-3 h-3" />
                  Translate
                </Button>
              </div>
            </div>
          </div>

          {/* Cultural Context Info */}
          <div className="mt-4 p-3 bg-muted/50 rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{currentPersonality.culturalContext}</Badge>
              <span className="text-sm font-medium">{currentPersonality.description}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Optimized for cultural context and communication styles in your region.
              Supports: {currentPersonality.supportedLanguages.map(lang => {
                const l = languages.find(language => language.code === lang);
                return l ? `${l.flag} ${l.name}` : lang;
              }).join(', ')}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Multilingual Chat Interface */}
      <div className="flex-1">
        <MultilingualChat
          title={`${currentPersonality.name} - ${currentLang.nativeName}`}
          context="coaching"
          onTranslationToggle={setAutoTranslate}
        />
      </div>

      {/* Voice Control Bar (when voice is enabled) */}
      {voiceEnabled && (
        <Card>
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                <span className="text-sm">
                  {isListening ? 'Listening...' : 'Voice ready'}
                </span>
                {isListening && (
                  <div className="animate-pulse w-2 h-2 bg-red-500 rounded-full" />
                )}
              </div>
              
              <Button
                variant={isListening ? "destructive" : "default"}
                size="sm"
                onClick={isListening ? handleStopListening : handleStartListening}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                {isListening ? 'Stop' : 'Speak'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};