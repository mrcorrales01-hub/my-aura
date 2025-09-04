import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Heart } from 'lucide-react';

interface MoodFormProps {
  onSubmit: (mood: number, notes: string) => void;
}

export function MoodForm({ onSubmit }: MoodFormProps) {
  const { t } = useTranslation();
  const [mood, setMood] = useState([5]);
  const [notes, setNotes] = useState('');

  const getMoodEmoji = (value: number) => {
    if (value >= 9) return '😄';
    if (value >= 7) return '😊';
    if (value >= 5) return '😐';
    if (value >= 3) return '😔';
    return '😢';
  };

  const getMoodColor = (value: number) => {
    if (value >= 8) return 'text-green-500';
    if (value >= 6) return 'text-blue-500';
    if (value >= 4) return 'text-yellow-500';
    if (value >= 2) return 'text-orange-500';
    return 'text-red-500';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(mood[0], notes);
    setMood([5]);
    setNotes('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Heart className="h-5 w-5 text-primary" />
          <span>{t('mood.howAreYou')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Label className="text-base font-medium">{t('mood.rate')}</Label>
            
            <div className="flex items-center justify-center space-x-4 mb-4">
              <span className={`text-4xl ${getMoodColor(mood[0])}`}>
                {getMoodEmoji(mood[0])}
              </span>
              <span className="text-2xl font-bold">{mood[0]}/10</span>
            </div>
            
            <Slider
              value={mood}
              onValueChange={setMood}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 - Very Bad</span>
              <span>5 - Neutral</span>
              <span>10 - Excellent</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t('mood.notes')}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How are you feeling? What's on your mind?"
              rows={4}
            />
          </div>

          <Button type="submit" className="w-full">
            {t('mood.save')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}