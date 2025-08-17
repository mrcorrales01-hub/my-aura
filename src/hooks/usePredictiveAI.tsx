import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface AIPrediction {
  id: string;
  prediction_type: string;
  content: string;
  confidence_score: number;
  based_on_data: any;
  status: string;
  expires_at: string;
  created_at: string;
}

export const usePredictiveAI = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [predictions, setPredictions] = useState<AIPrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPredictions();
    }
  }, [user]);

  const fetchPredictions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ai_predictions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPredictions(data || []);
    } catch (error) {
      console.error('Error fetching predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePredictions = async (analysisType: 'comprehensive' | 'mood_focused' | 'therapy_focused' = 'comprehensive') => {
    if (!user) return;

    try {
      setGenerating(true);
      
      const { data, error } = await supabase.functions.invoke('ai-predictions', {
        body: {
          userId: user.id,
          analysisType
        }
      });

      if (error) throw error;

      toast({
        title: "AI Analysis Complete",
        description: `Generated ${data.predictions?.length || 0} personalized recommendations.`,
      });

      await fetchPredictions();
      return data.predictions;
    } catch (error) {
      console.error('Error generating predictions:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to generate predictions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const updatePredictionStatus = async (predictionId: string, status: 'accepted' | 'dismissed') => {
    try {
      const { error } = await supabase
        .from('ai_predictions')
        .update({ status })
        .eq('id', predictionId);

      if (error) throw error;

      setPredictions(prev => prev.filter(p => p.id !== predictionId));
      
      toast({
        title: status === 'accepted' ? "Recommendation Accepted" : "Recommendation Dismissed",
        description: status === 'accepted' ? "We'll track your progress on this recommendation." : "Thanks for the feedback!",
      });
    } catch (error) {
      console.error('Error updating prediction status:', error);
      toast({
        title: "Update Error",
        description: "Failed to update recommendation status.",
        variant: "destructive",
      });
    }
  };

  const getPredictionsByType = (type: string) => {
    return predictions.filter(p => p.prediction_type === type);
  };

  const getHighConfidencePredictions = (threshold: number = 0.8) => {
    return predictions.filter(p => p.confidence_score >= threshold);
  };

  return {
    predictions,
    loading,
    generating,
    fetchPredictions,
    generatePredictions,
    updatePredictionStatus,
    getPredictionsByType,
    getHighConfidencePredictions
  };
};