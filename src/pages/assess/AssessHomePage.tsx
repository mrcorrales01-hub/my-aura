import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchHistory } from '@/features/assess/io';
import { exportAssessPdf } from '@/features/assess/pdf';
import { Spark } from '@/features/assess/History';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AssessHomePage() {
  const { t } = useTranslation('assess');
  const [phq, setPhq] = useState<any[]>([]);
  const [gad, setGad] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      setPhq(await fetchHistory('phq9'));
      setGad(await fetchHistory('gad7'));
    })();
  }, []);

  const lastPhq = phq[0]?.total_score ?? '—';
  const lastGad = gad[0]?.total_score ?? '—';

  const handleExportPdf = async () => {
    try {
      await exportAssessPdf({
        phq: phq.slice(0, 5).map(r => ({ score: r.total_score, severity: r.severity_level })),
        gad: gad.slice(0, 5).map(r => ({ score: r.total_score, severity: r.severity_level }))
      });
    } catch (error) {
      console.error('PDF export failed:', error);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-4xl">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-primary">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AssessmentCard 
          title={t('phq9')} 
          score={lastPhq} 
          to="/assess/phq9"
          hasHistory={phq.length > 0}
          type="phq9"
        />
        <AssessmentCard 
          title={t('gad7')} 
          score={lastGad} 
          to="/assess/gad7"
          hasHistory={gad.length > 0}
          type="gad7"
        />
      </div>

      {(phq.length > 0 || gad.length > 0) && (
        <div className="flex justify-center">
          <Button onClick={handleExportPdf} variant="outline" size="sm">
            📄 {t('exportPdf')}
          </Button>
        </div>
      )}

      <div className="text-xs text-muted-foreground text-center mt-6 p-3 bg-muted/50 rounded-lg">
        {t('disclaimer')}
      </div>
    </div>
  );
}

function AssessmentCard({ 
  title, 
  score, 
  to, 
  hasHistory, 
  type 
}: { 
  title: string; 
  score: any; 
  to: string; 
  hasHistory: boolean;
  type: 'phq9' | 'gad7';
}) {
  const { t } = useTranslation('assess');
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
        <div className="text-3xl font-bold text-primary">
          {score}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {hasHistory && (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">{t('history')}</div>
            <Spark type={type} />
          </div>
        )}
        <Link to={to} className="block">
          <Button className="w-full" size="sm">
            {hasHistory ? t('retake') : t('start')}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}