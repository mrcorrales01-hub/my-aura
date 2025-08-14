import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Smile, Meh, Frown, Heart, Zap, Cloud, Calendar, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/hooks/useI18n";
import { useMoodTracking } from "@/hooks/useMoodTracking";

const Checkin = () => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [reflection, setReflection] = useState("");
  const [showTrends, setShowTrends] = useState(false);
  const { toast } = useToast();
  const { t } = useI18n();
  const { saveMoodEntry, isLoading } = useMoodTracking();
  
  const moods = [
    { id: 'amazing', label: 'Amazing', icon: Zap, color: 'bg-yellow-500', description: 'Feeling fantastic and energized', value: 5 },
    { id: 'good', label: 'Good', icon: Smile, color: 'bg-green-500', description: 'Feeling positive and optimistic', value: 4 },
    { id: 'neutral', label: 'Neutral', icon: Meh, color: 'bg-blue-500', description: 'Feeling balanced and calm', value: 3 },
    { id: 'low', label: 'Low', icon: Cloud, color: 'bg-purple-500', description: 'Feeling down or tired', value: 2 },
    { id: 'difficult', label: 'Difficult', icon: Frown, color: 'bg-red-500', description: 'Having a challenging time', value: 1 }
  ];

  // Mock data för trends
  const weeklyTrends = [
    { day: 'Mån', mood: 'good', level: 4 },
    { day: 'Tis', mood: 'amazing', level: 5 },
    { day: 'Ons', mood: 'neutral', level: 3 },
    { day: 'Tor', mood: 'good', level: 4 },
    { day: 'Fre', mood: 'amazing', level: 5 },
    { day: 'Lör', mood: 'low', level: 2 },
    { day: 'Sön', mood: 'neutral', level: 3 }
  ];

  const handleSaveMood = async () => {
    if (!selectedMood) return;
    
    const selectedMoodData = moods.find(m => m.id === selectedMood);
    if (!selectedMoodData) return;

    const success = await saveMoodEntry(selectedMoodData.id, selectedMoodData.value, reflection || undefined);
    
    if (success) {
      toast({
        title: 'Mood saved!',
        description: 'Thank you for checking in.',
      });
      
      // Reset form
      setSelectedMood(null);
      setReflection("");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Calendar className="w-8 h-8 text-wellness-primary" />
          <h1 className="text-3xl font-bold text-foreground">
            {t('checkin.title')}
          </h1>
        </div>
        <p className="text-xl text-foreground/70">
          {t('checkin.subtitle')}
        </p>
      </div>

      {/* Mood Selection */}
      <Card className="p-8 bg-card/90 backdrop-blur-sm">
        <h2 className="text-2xl font-semibold mb-6 text-center">{t('checkin.selectMood')}</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {moods.map((mood) => {
            const IconComponent = mood.icon;
            const isSelected = selectedMood === mood.id;
            
            return (
              <button
                key={mood.id}
                onClick={() => setSelectedMood(mood.id)}
                className={`p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                  isSelected 
                    ? 'border-wellness-primary bg-wellness-primary/10 shadow-wellness' 
                    : 'border-border hover:border-wellness-primary/50 hover:bg-wellness-primary/5'
                }`}
              >
                <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                  isSelected ? 'bg-wellness-primary' : mood.color
                }`}>
                  <IconComponent className={`w-6 h-6 ${
                    isSelected ? 'text-white' : 'text-white'
                  }`} />
                </div>
                <p className={`font-medium text-sm ${
                  isSelected ? 'text-wellness-primary' : 'text-foreground'
                }`}>
                  {mood.label}
                </p>
              </button>
            );
          })}
        </div>

        {selectedMood && (
          <div className="bg-wellness-primary/5 rounded-xl p-6 mb-6">
            <p className="text-foreground/80 mb-4 text-center">
              {moods.find(m => m.id === selectedMood)?.description}
            </p>
            <div className="flex items-center justify-center gap-2 text-wellness-primary">
              <Heart className="w-4 h-4 fill-current" />
              <span className="text-sm font-medium">{t('checkin.shareDesc')}</span>
            </div>
          </div>
        )}

        {/* Reflection */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-foreground">
            {t('checkin.reflection')}
          </label>
          <Textarea
            placeholder={t('checkin.reflectionPlaceholder')}
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            className="min-h-[100px] resize-none"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button 
            variant="default" 
            size="lg" 
            onClick={handleSaveMood}
            disabled={!selectedMood || isLoading}
            className="disabled:opacity-50"
          >
            {isLoading ? "Saving..." : "Save Mood"}
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => setShowTrends(!showTrends)}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            {showTrends ? t('checkin.hideTrends') : t('checkin.showTrends')}
          </Button>
        </div>
      </Card>

      {/* Weekly Trends */}
      {showTrends && (
        <Card className="p-8 bg-card/90 backdrop-blur-sm">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-wellness-primary" />
            {t('checkin.weekOverview')}
          </h3>
          
          <div className="grid grid-cols-7 gap-4 mb-6">
            {weeklyTrends.map((day, index) => {
              const mood = moods.find(m => m.id === day.mood);
              const IconComponent = mood?.icon || Meh;
              
              return (
                <div key={index} className="text-center">
                  <div className="text-xs text-muted-foreground mb-2">{day.day}</div>
                  <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${mood?.color || 'bg-muted'} mb-2`}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <div className="w-full bg-muted rounded-full h-1">
                    <div 
                      className="bg-wellness-primary h-1 rounded-full transition-all duration-300"
                      style={{ width: `${(day.level / 5) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-wellness-primary/5 rounded-xl p-4">
            <p className="text-sm text-foreground/80">
              <strong>{t('common.aiInsight')}:</strong> {t('checkin.aiInsight')}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Checkin;