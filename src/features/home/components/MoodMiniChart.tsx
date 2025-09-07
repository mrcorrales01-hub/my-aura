import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useMoodHistory } from '../api/homeQueries';

export const MoodMiniChart = () => {
  const { t } = useTranslation('home');
  const { data: moodHistory, isLoading, error, refetch } = useMoodHistory(7);

  const { average, trend, chartData } = useMemo(() => {
    if (!moodHistory || moodHistory.length === 0) {
      return { average: 0, trend: 'stable', chartData: [] };
    }

    // Group by date and calculate daily averages
    const dailyMoods = moodHistory.reduce((acc, mood) => {
      const date = new Date(mood.recorded_at).toDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(mood.mood_value);
      return acc;
    }, {} as Record<string, number[]>);

    const dailyAverages = Object.entries(dailyMoods).map(([date, values]) => ({
      date,
      average: values.reduce((sum, val) => sum + val, 0) / values.length,
    }));

    const avg = dailyAverages.reduce((sum, day) => sum + day.average, 0) / dailyAverages.length;

    // Calculate trend
    let trendValue = 'stable';
    if (dailyAverages.length >= 2) {
      const recent = dailyAverages.slice(-3);
      const older = dailyAverages.slice(0, -3);
      if (recent.length > 0 && older.length > 0) {
        const recentAvg = recent.reduce((sum, day) => sum + day.average, 0) / recent.length;
        const olderAvg = older.reduce((sum, day) => sum + day.average, 0) / older.length;
        const diff = recentAvg - olderAvg;
        if (diff > 0.5) trendValue = 'up';
        else if (diff < -0.5) trendValue = 'down';
      }
    }

    return {
      average: avg,
      trend: trendValue,
      chartData: dailyAverages,
    };
  }, [moodHistory]);

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendText = () => {
    switch (trend) {
      case 'up':
        return t('mood.trendUp');
      case 'down':
        return t('mood.trendDown');
      default:
        return t('mood.trendStable');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            <Skeleton className="h-4 w-24" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full mb-2" />
          <Skeleton className="h-4 w-32" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{t('mood.trend7d')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-2">{t('error.failed')}</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              {t('error.retry')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!moodHistory || moodHistory.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{t('mood.trend7d')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">{t('empty.none')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{t('mood.trend7d')}</CardTitle>
        <CardDescription>
          {t('mood.average', { average: average.toFixed(1) })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Simple SVG chart */}
        <div className="h-20 mb-2">
          <svg className="w-full h-full" viewBox="0 0 200 80">
            {chartData.length > 1 && (
              <polyline
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                points={chartData
                  .map((point, index) => {
                    const x = (index / (chartData.length - 1)) * 180 + 10;
                    const y = 70 - ((point.average - 1) / 9) * 60;
                    return `${x},${y}`;
                  })
                  .join(' ')}
              />
            )}
            {chartData.map((point, index) => {
              const x = (index / Math.max(chartData.length - 1, 1)) * 180 + 10;
              const y = 70 - ((point.average - 1) / 9) * 60;
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="3"
                  fill="hsl(var(--primary))"
                />
              );
            })}
          </svg>
        </div>

        <div className="flex items-center gap-2 text-sm">
          {getTrendIcon()}
          <span className="text-muted-foreground">{getTrendText()}</span>
        </div>
      </CardContent>
    </Card>
  );
};