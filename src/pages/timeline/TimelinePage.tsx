import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkline } from '@/components/Sparkline';
import { buildTimeline } from '@/features/timeline/build';
import { getResults } from '@/features/screeners/store';

export default function TimelinePage() {
  const { t } = useTranslation(['timeline', 'screeners']);
  
  const timelineData = buildTimeline();
  const recentResults = getResults().slice(-10).reverse();
  
  const values = timelineData.map(d => d.v).filter(v => v > 0);
  const stats = values.length ? {
    min: Math.min(...values),
    max: Math.max(...values),
    avg: values.reduce((a, b) => a + b, 0) / values.length
  } : null;

  return (
    <div className="space-y-6 p-4 pb-24">
      <h1 className="text-2xl font-semibold">{t('title')}</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('last30')}</CardTitle>
          <p className="text-sm text-muted-foreground">{t('legend')}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Sparkline data={timelineData} width={320} height={64} className="w-full" />
            
            {stats && (
              <div className="flex gap-2">
                <Badge variant="secondary">
                  {t('min')}: {stats.min.toFixed(1)}
                </Badge>
                <Badge variant="secondary">
                  {t('max')}: {stats.max.toFixed(1)}
                </Badge>
                <Badge variant="secondary">
                  {t('avg')}: {stats.avg.toFixed(1)}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {recentResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('recentResults')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentResults.map((result, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <span className="font-medium">{t(`screeners:${result.id}`)}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      {new Date(result.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{result.score}</div>
                    <div className="text-sm text-muted-foreground">{result.severity}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}