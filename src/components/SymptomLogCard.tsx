import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Activity } from 'lucide-react';

const SYMPTOM_TAGS = ['pain', 'sleep', 'anxiety', 'mood', 'focus', 'other'];

export const SymptomLogCard = () => {
  const { t } = useTranslation(['visit', 'common']);
  const { toast } = useToast();
  const [intensity, setIntensity] = useState([5]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: t('common:error'),
          description: t('common:signInRequired'),
          variant: 'destructive'
        });
        return;
      }

      const { error } = await supabase
        .from('symptom_logs')
        .insert({
          user_id: session.user.id,
          intensity: intensity[0],
          tags: selectedTags,
          note: note.trim() || null
        });

      if (error) throw error;

      toast({
        title: t('visit:save'),
        description: 'Symptom logged successfully'
      });

      // Reset form
      setIntensity([5]);
      setSelectedTags([]);
      setNote('');
    } catch (error) {
      console.error('Error logging symptom:', error);
      toast({
        title: t('common:error'),
        description: 'Failed to log symptom',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5" />
          {t('visit:logSymptom')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            {t('visit:intensity')}: {intensity[0]}
          </label>
          <Slider
            value={intensity}
            onValueChange={setIntensity}
            max={10}
            min={0}
            step={1}
            className="w-full"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            {t('visit:tags')}
          </label>
          <div className="flex flex-wrap gap-2">
            {SYMPTOM_TAGS.map(tag => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleTag(tag)}
              >
                {t(`visit:${tag}`)}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            {t('visit:note')}
          </label>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional notes about symptoms..."
            className="min-h-[80px]"
          />
        </div>

        <Button 
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full"
        >
          {t('visit:save')}
        </Button>
      </CardContent>
    </Card>
  );
};