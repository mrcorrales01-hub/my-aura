import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Smile, 
  Meh, 
  Frown, 
  Heart, 
  Zap, 
  Moon,
  Sun,
  Cloud,
  Sparkles
} from 'lucide-react';

const moodOptions = [
  { id: 'joyful', icon: Sparkles, label: 'Joyful', color: 'text-yellow-500' },
  { id: 'happy', icon: Smile, label: 'Happy', color: 'text-green-500' },
  { id: 'content', icon: Sun, label: 'Content', color: 'text-blue-400' },
  { id: 'neutral', icon: Meh, label: 'Neutral', color: 'text-gray-500' },
  { id: 'tired', icon: Moon, label: 'Tired', color: 'text-purple-400' },
  { id: 'sad', icon: Cloud, label: 'Sad', color: 'text-blue-600' },
  { id: 'anxious', icon: Zap, label: 'Anxious', color: 'text-orange-500' },
  { id: 'overwhelmed', icon: Frown, label: 'Overwhelmed', color: 'text-red-500' },
];

export const MoodTracker = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [moodValue, setMoodValue] = useState([5]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user || !selectedMood) {
      toast({
        title: 'Please select a mood',
        description: 'Choose how you\'re feeling right now.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('mood_entries')
        .insert({
          user_id: user.id,
          mood_id: selectedMood,
          mood_value: moodValue[0],
          notes: notes.trim() || null,
        });

      if (error) throw error;

      toast({
        title: 'Mood logged!',
        description: 'Thank you for checking in.',
      });

      // Reset form
      setSelectedMood(null);
      setMoodValue([5]);
      setNotes('');

    } catch (error) {
      console.error('Error saving mood:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your mood. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          Daily Mood Check-in
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-sm font-medium mb-3">How are you feeling?</h3>
          <div className="grid grid-cols-4 gap-3">
            {moodOptions.map((mood) => {
              const Icon = mood.icon;
              return (
                <Button
                  key={mood.id}
                  variant={selectedMood === mood.id ? "default" : "outline"}
                  className="h-20 flex-col gap-2"
                  onClick={() => setSelectedMood(mood.id)}
                >
                  <Icon className={`h-6 w-6 ${selectedMood === mood.id ? '' : mood.color}`} />
                  <span className="text-xs">{mood.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-3">
            Rate your overall mood (1-10)
          </h3>
          <div className="space-y-3">
            <Slider
              value={moodValue}
              onValueChange={setMoodValue}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 - Very Low</span>
              <span className="font-medium">Current: {moodValue[0]}</span>
              <span>10 - Excellent</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-3">
            Notes (optional)
          </h3>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What's on your mind? Any thoughts about your mood today..."
            className="min-h-20"
          />
        </div>

        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting || !selectedMood}
          className="w-full"
        >
          {isSubmitting ? 'Saving...' : 'Log Mood'}
        </Button>
      </CardContent>
    </Card>
  );
};