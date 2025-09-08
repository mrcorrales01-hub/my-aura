import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { format, subDays, startOfDay, isSameDay } from 'date-fns';

interface StreakHeatmapProps {
  userId?: string;
  onStreakChange?: (streak: number) => void;
}

interface MoodEntry {
  created_at: string;
  mood_value: number;
}

// Simple confetti function
const triggerConfetti = () => {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'];
  const confettiCount = 15;
  
  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    confetti.style.position = 'fixed';
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.top = '-10px';
    confetti.style.width = '10px';
    confetti.style.height = '10px';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.pointerEvents = 'none';
    confetti.style.zIndex = '9999';
    confetti.style.borderRadius = '50%';
    confetti.style.animation = `confetti-fall 2s linear forwards`;
    
    document.body.appendChild(confetti);
    
    setTimeout(() => {
      confetti.remove();
    }, 2000);
  }
};

// Add CSS animation for confetti
const style = document.createElement('style');
style.textContent = `
  @keyframes confetti-fall {
    0% {
      transform: translateY(-10px) rotate(0deg);
      opacity: 1;
    }
    100% {
      transform: translateY(100vh) rotate(360deg);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

export const StreakHeatmap: React.FC<StreakHeatmapProps> = ({ 
  userId,
  onStreakChange 
}) => {
  const { t } = useTranslation('home');
  const { toast } = useToast();
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const weeks = 8;
  const days = weeks * 7;
  const today = new Date();
  const startDate = subDays(today, days - 1);

  // Generate array of dates for the last 8 weeks
  const dateArray = Array.from({ length: days }, (_, index) => 
    subDays(today, days - 1 - index)
  );

  useEffect(() => {
    loadMoodData();
  }, [userId]);

  const loadMoodData = async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('mood_entries')
        .select('created_at, mood_value')
        .eq('user_id', userId)
        .gte('created_at', format(startDate, 'yyyy-MM-dd'))
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMoodEntries(data || []);
      calculateStreak(data || []);
    } catch (error) {
      console.error('Error loading mood data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStreak = (entries: MoodEntry[]) => {
    let streak = 0;
    let currentDate = startOfDay(today);
    
    // Count consecutive days with mood entries, working backwards from today
    while (true) {
      const hasEntry = entries.some(entry => 
        isSameDay(new Date(entry.created_at), currentDate)
      );
      
      if (hasEntry) {
        streak++;
        currentDate = subDays(currentDate, 1);
      } else {
        break;
      }
    }

    const previousStreak = currentStreak;
    setCurrentStreak(streak);
    onStreakChange?.(streak);

    // Trigger confetti if streak increased
    if (streak > previousStreak && previousStreak > 0) {
      triggerConfetti();
      toast({
        title: t('streak.increased'),
        description: t('streak.newStreak', { count: streak }),
      });
    }
  };

  const getMoodForDate = (date: Date) => {
    return moodEntries.find(entry => 
      isSameDay(new Date(entry.created_at), date)
    );
  };

  const getIntensityClass = (moodValue?: number) => {
    if (!moodValue) return 'fill-muted-foreground/10';
    
    if (moodValue >= 8) return 'fill-green-500';
    if (moodValue >= 6) return 'fill-green-400';
    if (moodValue >= 4) return 'fill-yellow-400';
    if (moodValue >= 2) return 'fill-orange-400';
    return 'fill-red-400';
  };

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-32 mb-4"></div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 56 }).map((_, i) => (
              <div key={i} className="w-3 h-3 bg-muted rounded-sm"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">{t('streak.title')}</h3>
          <div className="text-sm font-medium text-primary">
            {currentStreak} {t('streak.days')}
          </div>
        </div>
        
        {/* Weekday labels */}
        <div className="grid grid-cols-7 gap-1 text-xs text-muted-foreground">
          {weekDays.map((day, index) => (
            <div key={index} className="text-center">
              {day}
            </div>
          ))}
        </div>
        
        {/* Heatmap grid */}
        <div className="grid grid-cols-7 gap-1">
          {dateArray.map((date, index) => {
            const mood = getMoodForDate(date);
            const isToday = isSameDay(date, today);
            
            return (
              <div
                key={index}
                className="w-3 h-3 rounded-sm relative group cursor-pointer"
                title={`${format(date, 'MMM d')}: ${mood ? `Mood ${mood.mood_value}/10` : 'No entry'}`}
              >
                <svg viewBox="0 0 12 12" className="w-full h-full">
                  <rect
                    width="12"
                    height="12"
                    rx="1"
                    className={`${getIntensityClass(mood?.mood_value)} ${
                      isToday ? 'stroke-current stroke-1' : ''
                    }`}
                  />
                </svg>
              </div>
            );
          })}
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{t('streak.less')}</span>
          <div className="flex items-center space-x-1">
            {[0, 2, 4, 6, 8].map((value) => (
              <div key={value} className="w-2 h-2 rounded-sm">
                <svg viewBox="0 0 8 8" className="w-full h-full">
                  <rect width="8" height="8" rx="1" className={getIntensityClass(value || undefined)} />
                </svg>
              </div>
            ))}
          </div>
          <span>{t('streak.more')}</span>
        </div>
      </div>
    </Card>
  );
};