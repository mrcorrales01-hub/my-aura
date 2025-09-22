import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { phq9Severity } from '@/features/assess/scoring';
import { saveAssessment } from '@/features/assess/io';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const Q = [
  "Intresse eller glädje i att göra saker",
  "Nedstämdhet, dysterhet eller hopplöshet",
  "Svårigheter att somna, sova vidare eller sova för mycket",
  "Trötthet eller brist på energi",
  "Dålig aptit eller överätning",
  "Dålig självkänsla – att du är misslyckad eller har svikit dig själv eller din familj",
  "Svårigheter att koncentrera dig",
  "Att du rör dig eller talar så långsamt att andra märkt det – eller tvärtom ovanligt orolig/rastlös",
  "Tankar att du skulle vara bättre död eller att skada dig själv"
];

export default function PHQ9Page() {
  const { t } = useTranslation('assess');
  const navigate = useNavigate();
  const [ans, setAns] = useState<number[]>(Array(9).fill(0));
  const [loading, setLoading] = useState(false);
  
  const total = ans.reduce((a, b) => a + b, 0);
  const sev = phq9Severity(total);
  
  const onSet = (i: number, v: number) => {
    const next = [...ans];
    next[i] = v;
    setAns(next);
  };

  const onSave = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      await saveAssessment('phq9', total, sev, ans);
      toast.success(`${t('score')}: ${total}`);
      navigate('/assess');
    } catch (error) {
      toast.error('Failed to save assessment');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-3xl">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-primary">{t('phq9')}</h1>
        <p className="text-sm text-muted-foreground">{t('questions.freqHelp')}</p>
      </div>

      <div className="space-y-4">
        {Q.map((q, i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm leading-relaxed">{q}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {[0, 1, 2, 3].map(v => (
                  <Button
                    key={v}
                    onClick={() => onSet(i, v)}
                    variant={ans[i] === v ? "default" : "outline"}
                    size="sm"
                    className="text-xs h-auto py-3"
                  >
                    {t(`questions.opt${v}`)}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm space-y-1">
              <div>{t('score')}: <span className="font-bold text-lg">{total}</span></div>
              <div>{t('severity')}: <Badge variant="secondary">{t(`phqScale.${sev}`)}</Badge></div>
            </div>
            <Button 
              onClick={onSave} 
              disabled={loading}
              size="lg"
            >
              {loading ? '...' : t('start')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground text-center p-3 bg-muted/30 rounded-lg">
        {t('disclaimer')}
      </div>
    </div>
  );
}