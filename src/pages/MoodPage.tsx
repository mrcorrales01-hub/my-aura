import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Heart, Calendar, TrendingUp } from 'lucide-react';
import { useMoodData } from '@/features/mood/hooks/useMoodData';
import { cn } from '@/lib/utils';

const MoodPage = () => {
  const { t } = useTranslation(['mood', 'common']);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const { saveMood, todaysMood, moodHistory, isLoading } = useMoodData();

  const moodScale = Array.from({ length: 10 }, (_, i) => i + 1);
  
  const moodTags = [
    'happy', 'sad', 'anxious', 'stressed', 'calm', 
    'energetic', 'tired', 'angry', 'excited', 'peaceful'
  ];

  const handleSaveMood = async () => {
    if (selectedMood === null) return;
    
    try {
      await saveMood({
        mood_value: selectedMood,
        tags: selectedTags,
        notes: notes.trim() || undefined
      });
      
      // Reset form
      setSelectedMood(null);
      setSelectedTags([]);
      setNotes('');
    } catch (error) {
      console.error('Failed to save mood:', error);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center py-6">
        <Heart className="w-16 h-16 text-pink-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">{t('mood:title')}</h1>
        <p className="text-muted-foreground">{t('mood:subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mood Input */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('mood:today')}</CardTitle>
              <CardDescription>{t('mood:rate')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Mood Scale */}
              <div className="space-y-4">
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                  {moodScale.map((mood) => (
                    <button
                      key={mood}
                      onClick={() => setSelectedMood(mood)}
                      className={cn(
                        "aspect-square rounded-lg border-2 transition-all duration-200",
                        "flex items-center justify-center text-lg font-semibold",
                        "hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary",
                        selectedMood === mood
                          ? "border-primary bg-primary text-primary-foreground shadow-lg scale-105"
                          : "border-muted-foreground/20 hover:border-primary/50"
                      )}
                    >
                      {mood}
                    </button>
                  ))}
                </div>
                
                {selectedMood && (
                  <div className="text-center">
                    <p className="text-lg font-medium">
                      {t(`mood:scale.${selectedMood}` as any)}
                    </p>
                  </div>
                )}
              </div>

              {/* Mood Tags */}
              <div className="space-y-3">
                <h3 className="font-medium">{t('mood:tags.happy')}</h3>
                <div className="flex flex-wrap gap-2">
                  {moodTags.map((tag) => (
                    <Button
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleTag(tag)}
                    >
                      {t(`mood:tags.${tag}` as any)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('mood:notes')}</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('mood:notesPlaceholder')}
                  rows={3}
                />
              </div>

              {/* Save Button */}
              <Button 
                onClick={handleSaveMood}
                disabled={selectedMood === null || isLoading}
                className="w-full"
              >
                {isLoading ? t('common:status.saving') : t('mood:save')}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Today's Mood */}
          {todaysMood && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Idag</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {todaysMood.mood_value}/10
                </div>
                <p className="text-sm text-muted-foreground">
                  {t(`mood:scale.${todaysMood.mood_value}` as any)}
                </p>
                {todaysMood.tags && todaysMood.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {todaysMood.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {t(`mood:tags.${tag}` as any)}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                {t('mood:insights.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">{t('mood:insights.average')}</span>
                <span className="font-medium">
                  {moodHistory?.length ? 
                    (moodHistory.reduce((sum: number, m: any) => sum + m.mood_value, 0) / moodHistory.length).toFixed(1)
                    : '-'
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Inlägg denna vecka</span>
                <span className="font-medium">
                  {moodHistory?.filter((m: any) => {
                    const date = new Date(m.recorded_at);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return date >= weekAgo;
                  }).length || 0}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Recent History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {t('mood:history')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {moodHistory && moodHistory.length > 0 ? (
                <div className="space-y-2">
                  {moodHistory.slice(0, 5).map((mood: any) => (
                    <div key={mood.id} className="flex justify-between items-center py-2 border-b last:border-0">
                      <span className="text-sm text-muted-foreground">
                        {new Date(mood.recorded_at).toLocaleDateString('sv-SE', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      <span className="font-medium">{mood.mood_value}/10</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">{t('mood:empty.description')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MoodPage;