import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchHistory } from '@/features/assess/io';

export function AssessmentCard() {
  const { t } = useTranslation('assess');
  const [phq, setPhq] = useState<any[]>([]);
  const [gad, setGad] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setPhq(await fetchHistory('phq9'));
        setGad(await fetchHistory('gad7'));
      } catch (error) {
        // Silently handle auth errors
        console.log('Assessment fetch error:', error);
      }
    })();
  }, []);

  const lastPhq = phq[0]?.total_score ?? '—';
  const lastGad = gad[0]?.total_score ?? '—';

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <Link to="/assess" className="block">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            🧠 {t('title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div className="text-muted-foreground">{t('phq9')}</div>
              <div className="font-semibold text-lg">{lastPhq}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">{t('gad7')}</div>
              <div className="font-semibold text-lg">{lastGad}</div>
            </div>
          </div>
          
          <div className="text-xs text-primary hover:underline">
            {phq.length > 0 || gad.length > 0 ? t('retake') : t('start')} →
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}