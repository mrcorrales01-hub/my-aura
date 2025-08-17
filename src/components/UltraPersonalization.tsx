import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Settings, 
  Palette, 
  Volume2, 
  Eye,
  MessageSquare,
  Heart,
  Zap,
  User,
  Smile,
  Target,
  Download,
  Upload,
  RotateCcw,
  Save,
  CheckCircle
} from 'lucide-react';
import { useUltraPersonalization } from '@/hooks/useUltraPersonalization';

const UltraPersonalization = () => {
  const {
    personalization,
    currentMoodMode,
    loading,
    saving,
    updateAuriPersonality,
    updateVoicePreferences,
    updateVisualPreferences,
    updateInteractionStyle,
    adaptToMood,
    resetToDefaults,
    exportPersonalization,
    importPersonalization
  } = useUltraPersonalization();

  const [importData, setImportData] = useState('');

  const personalityTraits = [
    { key: 'empathy_level', label: 'Empathy', icon: Heart, description: 'How emotionally understanding Auri is' },
    { key: 'energy_level', label: 'Energy', icon: Zap, description: 'How enthusiastic and energetic responses are' },
    { key: 'formality', label: 'Formality', icon: User, description: 'From casual to very professional' },
    { key: 'humor', label: 'Humor', icon: Smile, description: 'How much humor to include in responses' },
    { key: 'directness', label: 'Directness', icon: Target, description: 'How direct vs gentle the communication is' },
    { key: 'supportiveness', label: 'Support', icon: Heart, description: 'How encouraging and supportive Auri is' }
  ];

  const voiceOptions = [
    { id: 'Aria-9BWtsMINqrJLrRacOk9x', name: 'Aria', description: 'Warm and friendly' },
    { id: 'Roger-CwhRBWXzGAHq8TQ4Fs17', name: 'Roger', description: 'Professional and calm' },
    { id: 'Sarah-EXAVITQu4vr4xnSDxMaL', name: 'Sarah', description: 'Gentle and soothing' },
    { id: 'Charlie-IKne3meq5aSn9XLyUdCD', name: 'Charlie', description: 'Energetic and upbeat' }
  ];

  const colorSchemes = [
    { id: 'auto', name: 'Auto', description: 'Adapts based on mood and time' },
    { id: 'calm', name: 'Calm', description: 'Soft blues and greens' },
    { id: 'energetic', name: 'Energetic', description: 'Vibrant oranges and yellows' },
    { id: 'minimal', name: 'Minimal', description: 'Clean grays and whites' },
    { id: 'vibrant', name: 'Vibrant', description: 'Rich colors and gradients' }
  ];

  const moodModes = [
    { id: 'calm', name: 'Calm Mode', icon: '🧘', description: 'Peaceful, slow-paced interactions' },
    { id: 'energized', name: 'Energized Mode', icon: '⚡', description: 'Upbeat, motivating responses' },
    { id: 'anxious', name: 'Anxious Mode', icon: '💚', description: 'Extra gentle, reassuring support' },
    { id: 'focused', name: 'Focus Mode', icon: '🎯', description: 'Minimal distractions, structured guidance' }
  ];

  const handlePersonalityChange = (key: string, value: number[]) => {
    updateAuriPersonality({ [key]: value[0] });
  };

  const handleExport = () => {
    const data = exportPersonalization();
    if (data) {
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'aura-personalization.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleImport = () => {
    importPersonalization(importData);
    setImportData('');
  };

  if (loading || !personalization) {
    return (
      <div className="space-y-6 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2].map(i => (
              <div key={i} className="h-48 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Ultra Personalization ✨
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Customize every aspect of Auri to perfectly match your personality, preferences, and needs
        </p>
      </div>

      {/* Current Mood Mode */}
      {currentMoodMode && (
        <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">
                {moodModes.find(m => m.id === currentMoodMode)?.icon}
              </div>
              <div>
                <h3 className="font-semibold">
                  {moodModes.find(m => m.id === currentMoodMode)?.name} Active
                </h3>
                <p className="text-sm text-muted-foreground">
                  Auri is adapted to your current mood
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => adaptToMood(currentMoodMode)}>
              Update
            </Button>
          </div>
        </Card>
      )}

      <Tabs defaultValue="personality" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="personality">Personality</TabsTrigger>
          <TabsTrigger value="voice">Voice</TabsTrigger>
          <TabsTrigger value="visual">Visual</TabsTrigger>
          <TabsTrigger value="interaction">Interaction</TabsTrigger>
          <TabsTrigger value="mood">Mood Modes</TabsTrigger>
        </TabsList>

        <TabsContent value="personality" className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-purple-600" />
              Auri's Personality Traits
            </h3>
            
            <div className="space-y-6">
              {personalityTraits.map((trait) => {
                const IconComponent = trait.icon;
                const value = personalization.auri_personality[trait.key as keyof typeof personalization.auri_personality];
                
                return (
                  <div key={trait.key} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <IconComponent className="w-4 h-4 text-purple-600" />
                        <span className="font-medium">{trait.label}</span>
                        <Badge variant="secondary">{value}/10</Badge>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {trait.description}
                    </p>
                    
                    <Slider
                      value={[value]}
                      onValueChange={(newValue) => handlePersonalityChange(trait.key, newValue)}
                      max={10}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Low</span>
                      <span>High</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="voice" className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center">
              <Volume2 className="w-5 h-5 mr-2 text-blue-600" />
              Voice & Speech Settings
            </h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="font-medium">Voice Character</label>
                <Select
                  value={personalization.voice_preferences.voice_id}
                  onValueChange={(value) => updateVoicePreferences({ voice_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {voiceOptions.map((voice) => (
                      <SelectItem key={voice.id} value={voice.id}>
                        <div>
                          <div>{voice.name}</div>
                          <div className="text-xs text-muted-foreground">{voice.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Speech Rate</span>
                  <Badge variant="secondary">{personalization.voice_preferences.speech_rate}x</Badge>
                </div>
                <Slider
                  value={[personalization.voice_preferences.speech_rate]}
                  onValueChange={([value]) => updateVoicePreferences({ speech_rate: value })}
                  max={2}
                  min={0.5}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Slow</span>
                  <span>Fast</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Pitch</span>
                  <Badge variant="secondary">{personalization.voice_preferences.pitch}</Badge>
                </div>
                <Slider
                  value={[personalization.voice_preferences.pitch]}
                  onValueChange={([value]) => updateVoicePreferences({ pitch: value })}
                  max={20}
                  min={-20}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Lower</span>
                  <span>Higher</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-medium">Tone Style</label>
                <Select
                  value={personalization.voice_preferences.tone}
                  onValueChange={(value) => updateVoicePreferences({ tone: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="calm">Calm & Soothing</SelectItem>
                    <SelectItem value="energetic">Energetic & Upbeat</SelectItem>
                    <SelectItem value="warm">Warm & Friendly</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="friendly">Casual & Friendly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="visual" className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center">
              <Eye className="w-5 h-5 mr-2 text-green-600" />
              Visual & Display Settings
            </h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="font-medium">Color Scheme</label>
                <Select
                  value={personalization.visual_preferences.color_scheme}
                  onValueChange={(value) => updateVisualPreferences({ color_scheme: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorSchemes.map((scheme) => (
                      <SelectItem key={scheme.id} value={scheme.id}>
                        <div>
                          <div>{scheme.name}</div>
                          <div className="text-xs text-muted-foreground">{scheme.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="font-medium">Animation Level</label>
                <Select
                  value={personalization.visual_preferences.animation_level}
                  onValueChange={(value) => updateVisualPreferences({ animation_level: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Animations</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="full">Full Animations</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="font-medium">Font Size</label>
                <Select
                  value={personalization.visual_preferences.font_size}
                  onValueChange={(value) => updateVisualPreferences({ font_size: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">High Contrast</label>
                  <p className="text-sm text-muted-foreground">Improve visibility and readability</p>
                </div>
                <Switch
                  checked={personalization.visual_preferences.contrast === 'high'}
                  onCheckedChange={(checked) => 
                    updateVisualPreferences({ contrast: checked ? 'high' : 'normal' })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Reduce Motion</label>
                  <p className="text-sm text-muted-foreground">Minimize animations for sensitive users</p>
                </div>
                <Switch
                  checked={personalization.visual_preferences.reduce_motion}
                  onCheckedChange={(checked) => 
                    updateVisualPreferences({ reduce_motion: checked })
                  }
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="interaction" className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-orange-600" />
              Interaction & Communication Style
            </h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="font-medium">Response Length</label>
                <Select
                  value={personalization.interaction_style.response_length}
                  onValueChange={(value) => updateInteractionStyle({ response_length: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brief">Brief & Concise</SelectItem>
                    <SelectItem value="moderate">Moderate Detail</SelectItem>
                    <SelectItem value="detailed">Detailed Explanations</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="font-medium">Conversation Style</label>
                <Select
                  value={personalization.interaction_style.conversation_style}
                  onValueChange={(value) => updateInteractionStyle({ conversation_style: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="structured">Structured & Organized</SelectItem>
                    <SelectItem value="flowing">Natural & Flowing</SelectItem>
                    <SelectItem value="interactive">Interactive & Engaging</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="font-medium">Feedback Frequency</label>
                <Select
                  value={personalization.interaction_style.feedback_frequency}
                  onValueChange={(value) => updateInteractionStyle({ feedback_frequency: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minimal">Minimal Feedback</SelectItem>
                    <SelectItem value="moderate">Moderate Feedback</SelectItem>
                    <SelectItem value="frequent">Frequent Encouragement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="font-medium">Goal Reminders</label>
                <Select
                  value={personalization.interaction_style.goal_reminders}
                  onValueChange={(value) => updateInteractionStyle({ goal_reminders: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Reminders</SelectItem>
                    <SelectItem value="gentle">Gentle Hints</SelectItem>
                    <SelectItem value="regular">Regular Reminders</SelectItem>
                    <SelectItem value="persistent">Persistent Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="mood" className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center">
              <Palette className="w-5 h-5 mr-2 text-pink-600" />
              Mood-Based Adaptations
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              {moodModes.map((mode) => (
                <Card 
                  key={mode.id}
                  className={`p-4 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    currentMoodMode === mode.id 
                      ? 'ring-2 ring-pink-500 bg-pink-50' 
                      : 'hover:shadow-glow'
                  }`}
                  onClick={() => adaptToMood(mode.id as any)}
                >
                  <div className="text-center space-y-3">
                    <div className="text-4xl">{mode.icon}</div>
                    <div>
                      <h3 className="font-semibold">{mode.name}</h3>
                      <p className="text-sm text-muted-foreground">{mode.description}</p>
                    </div>
                    
                    {currentMoodMode === mode.id && (
                      <Badge className="bg-pink-100 text-pink-700">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Settings Management</h3>
        
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={handleExport}
            className="flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Settings</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={resetToDefaults}
            className="flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset to Defaults</span>
          </Button>
          
          <Button
            variant="outline"
            disabled={saving}
            className="flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Auto-saved'}</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default UltraPersonalization;