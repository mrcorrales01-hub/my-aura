import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSaveMood } from '../api/homeQueries';

interface MoodQuickInputProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MoodQuickInput = ({ open, onOpenChange }: MoodQuickInputProps) => {
  const { t } = useTranslation('home');
  const [moodValue, setMoodValue] = useState([5]);
  const [tags, setTags] = useState('');
  const [notes, setNotes] = useState('');
  const saveMood = useSaveMood();

  const handleSave = async () => {
    const tagsArray = tags.split(',').map(tag => tag.trim()).filter(Boolean);
    
    await saveMood.mutateAsync({
      mood_value: moodValue[0],
      tags: tagsArray.length > 0 ? tagsArray : undefined,
      notes: notes.trim() || undefined,
    });

    // Reset form
    setMoodValue([5]);
    setTags('');
    setNotes('');
    onOpenChange(false);
  };

  const getMoodColor = (value: number) => {
    if (value <= 3) return 'text-red-500';
    if (value <= 6) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getMoodEmoji = (value: number) => {
    if (value <= 2) return '😢';
    if (value <= 4) return '😔';
    if (value <= 6) return '😐';
    if (value <= 8) return '🙂';
    return '😄';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            {t('mood.logQuick')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t('mood.rate')}</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-center">
                <span className={`text-4xl ${getMoodColor(moodValue[0])}`}>
                  {getMoodEmoji(moodValue[0])}
                </span>
              </div>
              <Slider
                value={moodValue}
                onValueChange={setMoodValue}
                max={10}
                min={1}
                step={1}
                className="w-full"
                aria-label={t('mood.rate')}
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>1</span>
                <span className={`font-medium ${getMoodColor(moodValue[0])}`}>
                  {moodValue[0]}
                </span>
                <span>10</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">{t('mood.tags')}</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="happy, energetic, stressed"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t('mood.notes')}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How are you feeling today?"
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={saveMood.isPending}
            >
              {t('error.cancel', { defaultValue: 'Cancel' })}
            </Button>
            <Button 
              onClick={handleSave}
              disabled={saveMood.isPending}
            >
              {saveMood.isPending ? t('loading') : t('mood.save')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};