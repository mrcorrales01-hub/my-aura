import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smile, Meh, Frown, Heart, Zap, Cloud } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useMoodTracking, type Mood } from "@/hooks/useMoodTracking";

const MoodTracker = () => {
  const { t } = useLanguage();
  const { saveMood, loading, hasMoodToday } = useMoodTracking();
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  
  const moods: Mood[] = [
    { id: 'amazing', label: t('mood.amazing'), icon: 'Zap', color: 'coral', description: t('mood.amazingDesc'), value: 5 },
    { id: 'good', label: t('mood.good'), icon: 'Smile', color: 'wellness-primary', description: t('mood.goodDesc'), value: 4 },
    { id: 'neutral', label: t('mood.neutral'), icon: 'Meh', color: 'calm', description: t('mood.neutralDesc'), value: 3 },
    { id: 'low', label: t('mood.low'), icon: 'Cloud', color: 'lavender', description: t('mood.lowDesc'), value: 2 },
    { id: 'difficult', label: t('mood.difficult'), icon: 'Frown', color: 'muted-foreground', description: t('mood.difficultDesc'), value: 1 }
  ];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap': return Zap;
      case 'Smile': return Smile;
      case 'Meh': return Meh;
      case 'Cloud': return Cloud;
      case 'Frown': return Frown;
      default: return Heart;
    }
  };

  const handleSaveMood = async () => {
    if (selectedMood) {
      const success = await saveMood(selectedMood);
      if (success) {
        setSelectedMood(null);
      }
    }
  };

  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            {t('mood.title')} <span className="bg-gradient-primary bg-clip-text text-transparent">{t('mood.today')}</span>
          </h2>
          <p className="text-xl text-foreground/70">
            {t('mood.subtitle')}
          </p>
          {hasMoodToday && (
            <div className="mt-4 text-wellness-primary font-medium">
              {t('mood.alreadyRecorded')}
            </div>
          )}
        </div>

        <Card className="p-8 bg-card/90 backdrop-blur-sm shadow-soft">
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {moods.map((mood) => {
              const IconComponent = getIcon(mood.icon);
              const isSelected = selectedMood?.id === mood.id;
              
              return (
                <button
                  key={mood.id}
                  onClick={() => setSelectedMood(mood)}
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                    isSelected 
                      ? 'border-wellness-primary bg-wellness-primary/10 shadow-wellness' 
                      : 'border-border hover:border-wellness-primary/50 hover:bg-wellness-primary/5'
                  }`}
                >
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                    isSelected ? 'bg-wellness-primary' : 'bg-muted'
                  }`}>
                    <IconComponent className={`w-6 h-6 ${
                      isSelected ? 'text-white' : 'text-muted-foreground'
                    }`} />
                  </div>
                  <p className={`font-medium ${
                    isSelected ? 'text-wellness-primary' : 'text-foreground'
                  }`}>
                    {mood.label}
                  </p>
                </button>
              );
            })}
          </div>

          {selectedMood && (
            <div className="text-center bg-wellness-primary/5 rounded-xl p-6 mb-6 animate-in slide-in-from-bottom-4">
              <p className="text-foreground/80 mb-4">
                {selectedMood.description}
              </p>
              <div className="flex items-center justify-center gap-2 text-wellness-primary">
                <Heart className="w-4 h-4 fill-current" />
                <span className="text-sm font-medium">{t('mood.supportMessage')}</span>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="wellness" 
              size="lg" 
              disabled={!selectedMood || loading}
              onClick={handleSaveMood}
              className="disabled:opacity-50"
            >
              {loading ? t('common.saving') : t('mood.saveMood')}
            </Button>
            <Button variant="outline" size="lg">
              {t('mood.viewHistory')}
            </Button>
          </div>
        </Card>

        <div className="text-center mt-8">
          <p className="text-sm text-foreground/60">
            💡 <strong>{t('common.tip')}:</strong> {t('mood.dailyTip')}
          </p>
        </div>
      </div>
    </section>
  );
};

export default MoodTracker;