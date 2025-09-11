import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Stethoscope } from 'lucide-react';

export default function VisitPage() {
  const { t } = useTranslation('visit');
  const [questions, setQuestions] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [medications, setMedications] = useState('');

  const generateSummary = () => {
    const parts = [];
    if (questions) parts.push(`Frågor: ${questions}`);
    if (symptoms) parts.push(`Symtom: ${symptoms}`);
    if (medications) parts.push(`Mediciner: ${medications}`);
    return parts.join('\n\n');
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="text-center mb-8">
        <Stethoscope className="h-12 w-12 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-bold">{t('title', 'Inför läkarbesöket')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('subtitle', 'Förbered dig för ett effektivt läkarbesök')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('questions.title', 'Dina topp 3 frågor')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder={t('questions.placeholder', 'Skriv dina viktigaste frågor till läkaren...')}
            value={questions}
            onChange={(e) => setQuestions(e.target.value)}
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('symptoms.title', 'Symtom senaste 7 dagar')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder={t('symptoms.placeholder', 'Beskriv symtom, intensitet och när de uppstår...')}
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('medications.title', 'Läkemedel & biverkningar (valfritt)')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder={t('medications.placeholder', 'Aktuella mediciner och eventuella biverkningar...')}
            value={medications}
            onChange={(e) => setMedications(e.target.value)}
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>

      <Dialog>
        <DialogTrigger asChild>
          <Button size="lg" className="w-full">
            {t('createSummary', 'Skapa sammanfattning')}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('summary.title', 'Din sammanfattning')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm">
                {generateSummary() || t('summary.empty', 'Fyll i informationen ovan för att skapa en sammanfattning.')}
              </pre>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('summary.note', 'Ta med denna sammanfattning till ditt läkarbesök.')}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}