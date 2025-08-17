import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, 
  Brain, 
  Zap, 
  CloudRain, 
  Sun, 
  Loader2,
  CheckCircle,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Slider } from '@/components/ui/slider';

interface CheckinResponse {
  response: string;
  reminder: string;
  trends: {
    moodStreak: number;
    averageEnergy: number;
  };
}

const DailyCheckin = () => {
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [energy, setEnergy] = useState([5]);
  const [stress, setStress] = useState([5]);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [checkinComplete, setCheckinComplete] = useState(false);
  const [aiResponse, setAiResponse] = useState<CheckinResponse | null>(null);
  const { user, session } = useAuth();
  const { toast } = useToast();

  const moodOptions = [
    { id: 'amazing', emoji: '🤩', label: 'Amazing', color: 'bg-green-500' },
    { id: 'happy', emoji: '😊', label: 'Happy', color: 'bg-green-400' },
    { id: 'good', emoji: '🙂', label: 'Good', color: 'bg-blue-400' },
    { id: 'okay', emoji: '😐', label: 'Okay', color: 'bg-yellow-400' },
    { id: 'meh', emoji: '😑', label: 'Meh', color: 'bg-gray-400' },
    { id: 'down', emoji: '😔', label: 'Down', color: 'bg-orange-400' },
    { id: 'stressed', emoji: '😰', label: 'Stressed', color: 'bg-red-400' },
    { id: 'anxious', emoji: '😨', label: 'Anxious', color: 'bg-purple-400' }
  ];

  const handleSubmitCheckin = async () => {
    if (!selectedMood || !session) {
      toast({
        title: "Please complete the check-in",
        description: "Select a mood to continue",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('daily-checkin', {
        body: {
          mood: selectedMood,
          energy: energy[0],
          stress: stress[0],
          notes: notes.trim(),
          checkinType: 'daily'
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw error;
      }

      setAiResponse(data);
      setCheckinComplete(true);

      toast({
        title: "Check-in Complete! 🌟",
        description: "Thank you for taking time for your wellbeing",
        variant: "default",
      });

    } catch (error) {
      console.error('Error submitting check-in:', error);
      toast({
        title: "Check-in Error",
        description: "Unable to save your check-in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetCheckin = () => {
    setSelectedMood('');
    setEnergy([5]);
    setStress([5]);
    setNotes('');
    setCheckinComplete(false);
    setAiResponse(null);
  };

  const getEnergyLabel = (value: number) => {
    if (value <= 2) return 'Very Low';
    if (value <= 4) return 'Low';
    if (value <= 6) return 'Moderate';
    if (value <= 8) return 'High';
    return 'Very High';
  };

  const getStressLabel = (value: number) => {
    if (value <= 2) return 'Very Relaxed';
    if (value <= 4) return 'Calm';
    if (value <= 6) return 'Moderate';
    if (value <= 8) return 'Stressed';
    return 'Very Stressed';
  };

  if (checkinComplete && aiResponse) {
    return (
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Success Header */}
        <Card className="bg-gradient-to-r from-green-500/10 to-aura-primary/10 border-green-500/20">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <CardTitle className="text-xl text-green-700 dark:text-green-400">
              Daily Check-in Complete!
            </CardTitle>
            <p className="text-foreground/70">
              Thanks for taking time to check in with yourself today
            </p>
          </CardHeader>
        </Card>

        {/* AI Response */}
        <Card className="bg-card/50 backdrop-blur-sm border-aura-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-aura-primary">
              <Brain className="w-5 h-5" />
              <span>Auri's Response</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-aura-primary/5 rounded-lg p-4 mb-4">
              <p className="text-foreground/90 leading-relaxed">
                {aiResponse.response}
              </p>
            </div>
            
            {aiResponse.reminder && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                <p className="text-amber-700 dark:text-amber-400 text-sm">
                  💡 {aiResponse.reminder}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trends */}
        {aiResponse.trends && (
          <Card className="bg-card/50 backdrop-blur-sm border-aura-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-aura-primary">
                <TrendingUp className="w-5 h-5" />
                <span>Your Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-aura-primary/5 rounded-lg">
                  <div className="text-2xl font-bold text-aura-primary mb-1">
                    {aiResponse.trends.moodStreak}
                  </div>
                  <div className="text-sm text-foreground/70">Check-in streak</div>
                </div>
                <div className="text-center p-4 bg-aura-secondary/5 rounded-lg">
                  <div className="text-2xl font-bold text-aura-secondary mb-1">
                    {Math.round(aiResponse.trends.averageEnergy * 10) / 10}
                  </div>
                  <div className="text-sm text-foreground/70">Average energy</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={resetCheckin}
            variant="outline"
            className="flex-1"
          >
            New Check-in
          </Button>
          <Button 
            onClick={() => window.location.href = '/chat'}
            className="flex-1 bg-aura-primary hover:bg-aura-primary/90 text-white"
          >
            Chat with Auri
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-aura-primary/10 to-aura-primary/5 border-aura-primary/20">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-aura-gradient flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-xl text-aura-primary">Daily Emotional Check-in</CardTitle>
          <p className="text-foreground/70">
            Take a moment to reflect on how you're feeling right now
          </p>
          <Badge variant="secondary" className="mx-auto bg-aura-primary/10 text-aura-primary">
            <Calendar className="w-3 h-3 mr-1" />
            Today's Check-in
          </Badge>
        </CardHeader>
      </Card>

      {/* Mood Selection */}
      <Card className="bg-card/50 backdrop-blur-sm border-aura-primary/20">
        <CardHeader>
          <CardTitle className="text-lg text-aura-primary">How are you feeling?</CardTitle>
          <p className="text-sm text-foreground/70">Choose the mood that best describes you right now</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {moodOptions.map((mood) => (
              <Button
                key={mood.id}
                variant={selectedMood === mood.id ? "default" : "outline"}
                className={`h-16 flex-col space-y-1 transition-all duration-300 ${
                  selectedMood === mood.id 
                    ? `${mood.color} text-white shadow-lg scale-105` 
                    : 'border-aura-primary/20 hover:bg-aura-primary/5'
                }`}
                onClick={() => setSelectedMood(mood.id)}
              >
                <span className="text-xl">{mood.emoji}</span>
                <span className="text-xs">{mood.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Energy & Stress Levels */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-card/50 backdrop-blur-sm border-aura-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-aura-primary">
              <Zap className="w-5 h-5" />
              <span>Energy Level</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-aura-primary">{energy[0]}/10</div>
              <div className="text-sm text-foreground/70">{getEnergyLabel(energy[0])}</div>
            </div>
            <Slider
              value={energy}
              onValueChange={setEnergy}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-aura-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-aura-primary">
              <CloudRain className="w-5 h-5" />
              <span>Stress Level</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-aura-primary">{stress[0]}/10</div>
              <div className="text-sm text-foreground/70">{getStressLabel(stress[0])}</div>
            </div>
            <Slider
              value={stress}
              onValueChange={setStress}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
          </CardContent>
        </Card>
      </div>

      {/* Additional Notes */}
      <Card className="bg-card/50 backdrop-blur-sm border-aura-primary/20">
        <CardHeader>
          <CardTitle className="text-lg text-aura-primary">Anything else on your mind?</CardTitle>
          <p className="text-sm text-foreground/70">Optional - share any thoughts, concerns, or highlights from today</p>
        </CardHeader>
        <CardContent>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="I'm feeling... Today I... I'm grateful for..."
            className="min-h-20 resize-none"
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button 
        onClick={handleSubmitCheckin}
        disabled={!selectedMood || isLoading}
        className="w-full bg-aura-primary hover:bg-aura-primary/90 text-white py-6 text-lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processing Check-in...
          </>
        ) : (
          <>
            <Heart className="w-5 h-5 mr-2" />
            Complete Check-in
          </>
        )}
      </Button>

      <div className="text-center text-xs text-foreground/50">
        Your responses are private and encrypted. Only you can see your check-in data.
      </div>
    </div>
  );
};

export default DailyCheckin;