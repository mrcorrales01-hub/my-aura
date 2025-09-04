import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Calendar } from 'lucide-react';

interface MoodEntry {
  id: string;
  date: string;
  mood: number;
  notes?: string;
}

interface MoodChartProps {
  entries: MoodEntry[];
}

export function MoodChart({ entries }: MoodChartProps) {
  const { t } = useTranslation();

  const getMoodEmoji = (mood: number) => {
    if (mood >= 8) return '😄';
    if (mood >= 6) return '😊';
    if (mood >= 4) return '😐';
    if (mood >= 2) return '😔';
    return '😢';
  };

  const getMoodColor = (mood: number) => {
    if (mood >= 8) return 'text-green-500';
    if (mood >= 6) return 'text-blue-500';
    if (mood >= 4) return 'text-yellow-500';
    if (mood >= 2) return 'text-orange-500';
    return 'text-red-500';
  };

  const averageMood = entries.length > 0 
    ? entries.reduce((sum, entry) => sum + entry.mood, 0) / entries.length
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5" />
          <span>{t('mood.history')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            {t('mood.noEntries')}
          </p>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Average Mood</span>
              <div className="flex items-center space-x-2">
                <span className={`text-2xl ${getMoodColor(averageMood)}`}>
                  {getMoodEmoji(averageMood)}
                </span>
                <span className="font-semibold">{averageMood.toFixed(1)}</span>
              </div>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {entries.slice(0, 10).map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{new Date(entry.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xl ${getMoodColor(entry.mood)}`}>
                      {getMoodEmoji(entry.mood)}
                    </span>
                    <span className="font-medium">{entry.mood}/10</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}