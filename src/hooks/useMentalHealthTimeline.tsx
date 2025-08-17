import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface TimelineEntry {
  id: string;
  date: Date;
  overallScore: number;
  moodAverage?: number;
  sleepQuality?: number;
  stressLevel?: number;
  activityLevel?: number;
  aiInsights: {
    summary: string;
    trends: string[];
    recommendations: string[];
  };
  wearableContributions: {
    heartRate?: number;
    sleep?: number;
    activity?: number;
    stress?: number;
  };
}

interface TimelineStats {
  currentScore: number;
  weeklyTrend: 'improving' | 'stable' | 'declining';
  monthlyAverage: number;
  bestDay: TimelineEntry | null;
  challengingDay: TimelineEntry | null;
}

export const useMentalHealthTimeline = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [stats, setStats] = useState<TimelineStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<'week' | 'month' | '3months' | '6months'>('month');

  // Fetch timeline data
  const fetchTimeline = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (dateRange) {
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case '3months':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case '6months':
          startDate.setMonth(endDate.getMonth() - 6);
          break;
      }

      const { data, error } = await supabase
        .from('mental_health_timeline')
        .select('*')
        .eq('user_id', user.id)
        .gte('timeline_date', startDate.toISOString().split('T')[0])
        .lte('timeline_date', endDate.toISOString().split('T')[0])
        .order('timeline_date', { ascending: false });

      if (error) throw error;

      const timelineEntries: TimelineEntry[] = (data || []).map(entry => ({
        id: entry.id,
        date: new Date(entry.timeline_date),
        overallScore: entry.overall_score,
        moodAverage: entry.mood_average,
        sleepQuality: entry.sleep_quality,
        stressLevel: entry.stress_level,
        activityLevel: entry.activity_level,
        aiInsights: (entry.ai_insights as any) || {
          summary: 'No insights available',
          trends: [],
          recommendations: []
        },
        wearableContributions: (entry.wearable_contributions as any) || {},
      }));

      setTimeline(timelineEntries);
      calculateStats(timelineEntries);

    } catch (error) {
      console.error('Error fetching timeline:', error);
      toast({
        title: "Error loading timeline",
        description: "Failed to load your mental health timeline.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, dateRange, toast]);

  // Calculate timeline statistics
  const calculateStats = (entries: TimelineEntry[]) => {
    if (entries.length === 0) {
      setStats(null);
      return;
    }

    const currentScore = entries[0]?.overallScore || 0;
    const monthlyAverage = entries.reduce((sum, entry) => sum + entry.overallScore, 0) / entries.length;
    
    // Calculate weekly trend
    const recentEntries = entries.slice(0, 7);
    const olderEntries = entries.slice(7, 14);
    
    let weeklyTrend: 'improving' | 'stable' | 'declining' = 'stable';
    
    if (recentEntries.length > 0 && olderEntries.length > 0) {
      const recentAvg = recentEntries.reduce((sum, entry) => sum + entry.overallScore, 0) / recentEntries.length;
      const olderAvg = olderEntries.reduce((sum, entry) => sum + entry.overallScore, 0) / olderEntries.length;
      
      if (recentAvg > olderAvg + 0.5) {
        weeklyTrend = 'improving';
      } else if (recentAvg < olderAvg - 0.5) {
        weeklyTrend = 'declining';
      }
    }

    // Find best and most challenging days
    const sortedByScore = [...entries].sort((a, b) => b.overallScore - a.overallScore);
    const bestDay = sortedByScore[0] || null;
    const challengingDay = sortedByScore[sortedByScore.length - 1] || null;

    setStats({
      currentScore,
      weeklyTrend,
      monthlyAverage,
      bestDay,
      challengingDay,
    });
  };

  // Generate timeline entry (usually called daily)
  const generateTimelineEntry = async (date: Date = new Date()) => {
    if (!user) return;

    try {
      // Fetch recent data to calculate score
      const endDate = date;
      const startDate = new Date(date);
      startDate.setDate(startDate.getDate() - 1);

      // Get mood data
      const { data: moodData } = await supabase
        .from('mood_entries')
        .select('mood_value')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      // Get wearable data
      const { data: wearableData } = await supabase
        .from('wearable_data')
        .select('*')
        .eq('user_id', user.id)
        .gte('recorded_at', startDate.toISOString())
        .lte('recorded_at', endDate.toISOString());

      // Calculate metrics
      const moodAverage = moodData?.length ? 
        moodData.reduce((sum, entry) => sum + entry.mood_value, 0) / moodData.length : null;

      let sleepQuality = null;
      let activityLevel = null;
      let stressLevel = null;
      const wearableContributions: any = {};

      if (wearableData?.length) {
        const sleepData = wearableData.filter(d => d.data_type === 'sleep_duration');
        const activityData = wearableData.filter(d => d.data_type === 'steps');
        const stressData = wearableData.filter(d => d.data_type === 'stress_level');

        if (sleepData.length) {
          sleepQuality = sleepData.reduce((sum, d) => sum + d.value, 0) / sleepData.length;
          wearableContributions.sleep = sleepQuality;
        }

        if (activityData.length) {
          const avgSteps = activityData.reduce((sum, d) => sum + d.value, 0) / activityData.length;
          activityLevel = Math.min(10, avgSteps / 1000); // Normalize to 1-10 scale
          wearableContributions.activity = activityLevel;
        }

        if (stressData.length) {
          stressLevel = stressData.reduce((sum, d) => sum + d.value, 0) / stressData.length;
          wearableContributions.stress = stressLevel;
        }
      }

      // Calculate overall score
      let overallScore = 5; // Base score
      
      if (moodAverage) overallScore += (moodAverage - 5) * 0.4;
      if (sleepQuality) overallScore += (sleepQuality - 7) * 0.2;
      if (activityLevel) overallScore += (activityLevel - 5) * 0.2;
      if (stressLevel) overallScore -= (stressLevel - 5) * 0.2;

      overallScore = Math.max(1, Math.min(10, overallScore));

      // Generate AI insights (placeholder)
      const aiInsights = {
        summary: generateAISummary(overallScore, moodAverage, sleepQuality, activityLevel, stressLevel),
        trends: generateTrends(overallScore),
        recommendations: generateRecommendations(overallScore, stressLevel)
      };

      // Store in database
      const { error } = await supabase
        .from('mental_health_timeline')
        .upsert({
          user_id: user.id,
          timeline_date: date.toISOString().split('T')[0],
          overall_score: overallScore,
          mood_average: moodAverage,
          sleep_quality: sleepQuality,
          stress_level: stressLevel,
          activity_level: activityLevel,
          ai_insights: aiInsights,
          wearable_contributions: wearableContributions,
        });

      if (error) throw error;

      // Refresh timeline
      await fetchTimeline();

      return { overallScore, aiInsights };

    } catch (error) {
      console.error('Error generating timeline entry:', error);
      throw error;
    }
  };

  // Helper functions for AI insights
  const generateAISummary = (score: number, mood?: number, sleep?: number, activity?: number, stress?: number) => {
    if (score >= 8) {
      return "You're having an excellent day! Your mental health indicators are looking very positive.";
    } else if (score >= 6) {
      return "You're doing well today. There are some positive patterns in your wellness data.";
    } else if (score >= 4) {
      return "Today seems to be a mixed bag. Some areas are doing well while others might need attention.";
    } else {
      return "Today appears to be challenging. Consider reaching out for support and practicing self-care.";
    }
  };

  const generateTrends = (score: number) => {
    const trends = [];
    if (score >= 7) trends.push("Positive mental wellness trend");
    if (score < 4) trends.push("Concerning downward trend");
    trends.push("Data being tracked consistently");
    return trends;
  };

  const generateRecommendations = (score: number, stress?: number) => {
    const recommendations = [];
    if (score < 5) {
      recommendations.push("Consider talking to your AI coach");
      recommendations.push("Practice mindfulness or meditation");
    }
    if (stress && stress > 7) {
      recommendations.push("Try stress-reduction techniques");
      recommendations.push("Consider taking breaks throughout your day");
    }
    recommendations.push("Keep tracking your daily mood");
    return recommendations;
  };

  // Share timeline with healthcare provider
  const shareTimeline = async (providerEmail: string, dateRange: { start: Date; end: Date }) => {
    if (!user) return;

    try {
      // Filter timeline data for the specified range
      const filteredData = timeline.filter(entry => 
        entry.date >= dateRange.start && entry.date <= dateRange.end
      );

      // Generate shareable report
      const report = {
        patient: user.user_metadata?.full_name || 'Anonymous',
        dateRange: {
          start: dateRange.start.toISOString().split('T')[0],
          end: dateRange.end.toISOString().split('T')[0]
        },
        summary: stats,
        timeline: filteredData,
        generatedAt: new Date().toISOString(),
      };

      // In a real implementation, this would send an email or create a secure link
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mental-health-timeline-${dateRange.start.toISOString().split('T')[0]}.json`;
      a.click();

      toast({
        title: "Timeline exported",
        description: "Your mental health timeline has been exported successfully.",
      });
    } catch (error) {
      console.error('Error sharing timeline:', error);
      toast({
        title: "Export failed",
        description: "Failed to export your timeline. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchTimeline();
    }
  }, [user, fetchTimeline]);

  return {
    timeline,
    stats,
    loading,
    dateRange,
    setDateRange,
    generateTimelineEntry,
    shareTimeline,
    fetchTimeline,
  };
};