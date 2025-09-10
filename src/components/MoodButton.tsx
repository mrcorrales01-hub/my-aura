import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MoodButtonProps {
  value: number;
}

export const MoodButton = ({ value }: MoodButtonProps) => {
  const { t } = useTranslation('mood');
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const onRate = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      const { error } = await supabase
        .from('mood_entries')
        .insert({ 
          user_id: session.user.id,
          mood_id: crypto.randomUUID(),
          mood_value: value
        });

      if (error) {
        console.error('Error saving mood:', error);
        toast({
          title: t('mood:errorSave'),
          variant: "destructive"
        });
        return;
      }

      toast({
        title: t('mood:saved')
      });
    } catch (error) {
      console.error('Error saving mood:', error);
      toast({
        title: t('mood:errorSave'),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="w-8 h-8 p-0"
      onClick={onRate}
      disabled={isLoading}
    >
      {value}
    </Button>
  );
};