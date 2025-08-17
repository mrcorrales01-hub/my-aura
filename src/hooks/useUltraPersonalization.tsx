import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface AuriPersonality {
  empathy_level: number; // 1-10
  energy_level: number; // 1-10
  formality: number; // 1-10 (casual to formal)
  humor: number; // 1-10
  directness: number; // 1-10
  supportiveness: number; // 1-10
}

interface VoicePreferences {
  voice_id: string;
  speech_rate: number; // 0.5-2.0
  pitch: number; // -20 to 20
  tone: 'calm' | 'energetic' | 'warm' | 'professional' | 'friendly';
  accent?: string;
}

interface VisualPreferences {
  color_scheme: 'auto' | 'calm' | 'energetic' | 'minimal' | 'vibrant';
  animation_level: 'none' | 'minimal' | 'moderate' | 'full';
  font_size: 'small' | 'medium' | 'large';
  contrast: 'normal' | 'high';
  reduce_motion: boolean;
}

interface InteractionStyle {
  response_length: 'brief' | 'moderate' | 'detailed';
  conversation_style: 'structured' | 'flowing' | 'interactive';
  feedback_frequency: 'minimal' | 'moderate' | 'frequent';
  goal_reminders: 'none' | 'gentle' | 'regular' | 'persistent';
}

interface MoodAdaptations {
  calm_mode: {
    colors: string[];
    music_tempo: 'slow' | 'medium';
    interaction_pace: 'slow' | 'normal';
  };
  energized_mode: {
    colors: string[];
    music_tempo: 'upbeat' | 'fast';
    interaction_pace: 'normal' | 'fast';
  };
  anxious_mode: {
    colors: string[];
    music_tempo: 'slow' | 'calming';
    interaction_pace: 'slow';
    extra_reassurance: boolean;
  };
  focused_mode: {
    colors: string[];
    minimal_distractions: boolean;
    structured_responses: boolean;
  };
}

interface UltraPersonalization {
  id?: string;
  user_id: string;
  auri_personality: AuriPersonality;
  voice_preferences: VoicePreferences;
  visual_preferences: VisualPreferences;
  interaction_style: InteractionStyle;
  mood_adaptations: MoodAdaptations;
  created_at?: string;
  updated_at?: string;
}

export const useUltraPersonalization = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [personalization, setPersonalization] = useState<UltraPersonalization | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentMoodMode, setCurrentMoodMode] = useState<'calm' | 'energized' | 'anxious' | 'focused' | null>(null);

  const defaultPersonalization: Omit<UltraPersonalization, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
    auri_personality: {
      empathy_level: 8,
      energy_level: 6,
      formality: 4,
      humor: 5,
      directness: 6,
      supportiveness: 9
    },
    voice_preferences: {
      voice_id: 'Aria-9BWtsMINqrJLrRacOk9x',
      speech_rate: 1.0,
      pitch: 0,
      tone: 'warm'
    },
    visual_preferences: {
      color_scheme: 'auto',
      animation_level: 'moderate',
      font_size: 'medium',
      contrast: 'normal',
      reduce_motion: false
    },
    interaction_style: {
      response_length: 'moderate',
      conversation_style: 'flowing',
      feedback_frequency: 'moderate',
      goal_reminders: 'regular'
    },
    mood_adaptations: {
      calm_mode: {
        colors: ['#E6F3FF', '#B8E6B8', '#F0E6FF'],
        music_tempo: 'slow',
        interaction_pace: 'slow'
      },
      energized_mode: {
        colors: ['#FFE6CC', '#FFCCCB', '#E6CCFF'],
        music_tempo: 'upbeat',
        interaction_pace: 'normal'
      },
      anxious_mode: {
        colors: ['#E8F5E8', '#F5F5DC', '#E0F6FF'],
        music_tempo: 'calming',
        interaction_pace: 'slow',
        extra_reassurance: true
      },
      focused_mode: {
        colors: ['#F8F8FF', '#F0F8FF', '#F5F5F5'],
        minimal_distractions: true,
        structured_responses: true
      }
    }
  };

  useEffect(() => {
    if (user) {
      fetchPersonalization();
    }
  }, [user]);

  const fetchPersonalization = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('ultra_personalizations')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (data) {
        setPersonalization({
          ...data,
          auri_personality: data.auri_personality as unknown as AuriPersonality,
          interaction_style: data.interaction_style as unknown as InteractionStyle,
          mood_adaptations: data.mood_adaptations as unknown as MoodAdaptations,
          visual_preferences: data.visual_preferences as unknown as VisualPreferences,
          voice_preferences: data.voice_preferences as unknown as VoicePreferences
        });
      } else {
        // Create default personalization
        await createDefaultPersonalization();
      }
    } catch (error) {
      console.error('Error fetching personalization:', error);
      toast({
        title: "Error",
        description: "Failed to load personalization settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createDefaultPersonalization = async () => {
    if (!user) return;

    try {
      const newPersonalization = {
        user_id: user.id,
        ...defaultPersonalization
      };

      const { data, error } = await supabase
        .from('ultra_personalizations')
        .insert(newPersonalization as any)
        .select()
        .single();

      if (error) throw error;

      setPersonalization({
        ...data,
        auri_personality: data.auri_personality as unknown as AuriPersonality,
        interaction_style: data.interaction_style as unknown as InteractionStyle,
        mood_adaptations: data.mood_adaptations as unknown as MoodAdaptations,
        visual_preferences: data.visual_preferences as unknown as VisualPreferences,
        voice_preferences: data.voice_preferences as unknown as VoicePreferences
      });
    } catch (error) {
      console.error('Error creating default personalization:', error);
    }
  };

  const updatePersonalization = async (updates: Partial<UltraPersonalization>) => {
    if (!user || !personalization) return false;

    try {
      setSaving(true);

      const { data, error } = await supabase
        .from('ultra_personalizations')
        .update(updates as any)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setPersonalization({
        ...data,
        auri_personality: data.auri_personality as unknown as AuriPersonality,
        interaction_style: data.interaction_style as unknown as InteractionStyle,
        mood_adaptations: data.mood_adaptations as unknown as MoodAdaptations,
        visual_preferences: data.visual_preferences as unknown as VisualPreferences,
        voice_preferences: data.voice_preferences as unknown as VoicePreferences
      });

      toast({
        title: "Settings Updated! ✨",
        description: "Your personalization preferences have been saved",
      });

      return true;
    } catch (error) {
      console.error('Error updating personalization:', error);
      toast({
        title: "Error",
        description: "Failed to save personalization settings",
        variant: "destructive"
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const updateAuriPersonality = async (personality: Partial<AuriPersonality>) => {
    if (!personalization) return false;

    const updatedPersonality = {
      ...personalization.auri_personality,
      ...personality
    };

    return updatePersonalization({
      auri_personality: updatedPersonality
    });
  };

  const updateVoicePreferences = async (voice: Partial<VoicePreferences>) => {
    if (!personalization) return false;

    const updatedVoice = {
      ...personalization.voice_preferences,
      ...voice
    };

    return updatePersonalization({
      voice_preferences: updatedVoice
    });
  };

  const updateVisualPreferences = async (visual: Partial<VisualPreferences>) => {
    if (!personalization) return false;

    const updatedVisual = {
      ...personalization.visual_preferences,
      ...visual
    };

    return updatePersonalization({
      visual_preferences: updatedVisual
    });
  };

  const updateInteractionStyle = async (interaction: Partial<InteractionStyle>) => {
    if (!personalization) return false;

    const updatedInteraction = {
      ...personalization.interaction_style,
      ...interaction
    };

    return updatePersonalization({
      interaction_style: updatedInteraction
    });
  };

  const adaptToMood = async (mood: 'calm' | 'energized' | 'anxious' | 'focused') => {
    if (!personalization) return false;

    setCurrentMoodMode(mood);

    // Apply mood-specific adaptations
    const moodSettings = personalization.mood_adaptations[`${mood}_mode`];
    
    // Update visual preferences based on mood
    const moodVisualUpdates: Partial<VisualPreferences> = {};
    
    if (mood === 'anxious') {
      moodVisualUpdates.animation_level = 'minimal';
      moodVisualUpdates.reduce_motion = true;
    } else if (mood === 'focused') {
      moodVisualUpdates.animation_level = 'minimal';
    } else if (mood === 'energized') {
      moodVisualUpdates.animation_level = 'full';
    }

    if (Object.keys(moodVisualUpdates).length > 0) {
      await updateVisualPreferences(moodVisualUpdates);
    }

    toast({
      title: `Adapted to ${mood} mode! 🎨`,
      description: "Auri has adjusted to match your current mood",
    });

    return true;
  };

  const resetToDefaults = async () => {
    return updatePersonalization(defaultPersonalization);
  };

  const exportPersonalization = () => {
    if (!personalization) return null;
    
    return JSON.stringify(personalization, null, 2);
  };

  const importPersonalization = async (personalizationJson: string) => {
    try {
      const imported = JSON.parse(personalizationJson);
      const { id, user_id, created_at, updated_at, ...settings } = imported;
      
      return updatePersonalization(settings);
    } catch (error) {
      console.error('Error importing personalization:', error);
      toast({
        title: "Import Failed",
        description: "Invalid personalization data",
        variant: "destructive"
      });
      return false;
    }
  };

  const getPersonalizedPrompt = () => {
    if (!personalization) return '';

    const { auri_personality, interaction_style } = personalization;
    
    let prompt = `You are Auri, an AI wellness coach. Adapt your personality as follows:
    - Empathy level: ${auri_personality.empathy_level}/10
    - Energy level: ${auri_personality.energy_level}/10
    - Formality: ${auri_personality.formality}/10 (1=very casual, 10=very formal)
    - Humor: ${auri_personality.humor}/10
    - Directness: ${auri_personality.directness}/10
    - Supportiveness: ${auri_personality.supportiveness}/10
    
    Response style:
    - Length: ${interaction_style.response_length}
    - Style: ${interaction_style.conversation_style}
    - Feedback: ${interaction_style.feedback_frequency}`;

    if (currentMoodMode) {
      const moodSettings = personalization.mood_adaptations[`${currentMoodMode}_mode`];
      prompt += `\n\nUser's current mood: ${currentMoodMode}. Adapt accordingly.`;
      
      if (currentMoodMode === 'anxious' && 'extra_reassurance' in moodSettings && moodSettings.extra_reassurance) {
        prompt += ` Provide extra reassurance and gentle guidance.`;
      }
      if (currentMoodMode === 'focused' && 'structured_responses' in moodSettings && moodSettings.structured_responses) {
        prompt += ` Keep responses structured and to the point.`;
      }
    }

    return prompt;
  };

  return {
    personalization,
    currentMoodMode,
    loading,
    saving,
    defaultPersonalization,
    updatePersonalization,
    updateAuriPersonality,
    updateVoicePreferences,
    updateVisualPreferences,
    updateInteractionStyle,
    adaptToMood,
    resetToDefaults,
    exportPersonalization,
    importPersonalization,
    getPersonalizedPrompt,
    fetchPersonalization
  };
};