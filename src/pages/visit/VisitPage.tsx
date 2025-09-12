import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Stethoscope, FileDown } from 'lucide-react';
import { getLatestResult } from '@/features/screeners/store';
import jsPDF from 'jspdf';

export default function VisitPage() {
  const { t } = useTranslation('visit');
  const [questions, setQuestions] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [medications, setMedications] = useState('');
  const [includePHQ9, setIncludePHQ9] = useState(true);
  const [includeGAD7, setIncludeGAD7] = useState(true);

  const latestPHQ9 = getLatestResult('phq9');
  const latestGAD7 = getLatestResult('gad7');

  const generateSummary = () => {
    const parts = [];
    if (questions) parts.push(`Frågor: ${questions}`);
    if (symptoms) parts.push(`Symtom: ${symptoms}`);
    if (medications) parts.push(`Mediciner: ${medications}`);
    
    // Add screener results if selected
    if (includePHQ9 && latestPHQ9) {
      parts.push(`PHQ-9: ${latestPHQ9.score} poäng (${latestPHQ9.severity}) - ${new Date(latestPHQ9.date).toLocaleDateString()}`);
    }
    if (includeGAD7 && latestGAD7) {
      parts.push(`GAD-7: ${latestGAD7.score} poäng (${latestGAD7.severity}) - ${new Date(latestGAD7.date).toLocaleDateString()}`);
    }
    
    return parts.join('\n\n');
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const summary = generateSummary();
    
    doc.setFontSize(16);
    doc.text('Läkarbesök - Sammanfattning', 20, 20);
    doc.setFontSize(12);
    doc.text(new Date().toLocaleDateString(), 20, 35);
    
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(summary, 170);
    doc.text(lines, 20, 50);
    
    doc.save(`lakarbesok-${new Date().toISOString().split('T')[0]}.pdf`);
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

      {/* Screener Results Toggle */}
      {(latestPHQ9 || latestGAD7) && (
        <Card>
          <CardHeader>
            <CardTitle>Bifoga senaste självskattningar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {latestPHQ9 && (
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="phq9" 
                  checked={includePHQ9}
                  onCheckedChange={(checked) => setIncludePHQ9(!!checked)}
                />
                <Label htmlFor="phq9">
                  PHQ-9: {latestPHQ9.score} poäng ({latestPHQ9.severity}) - {new Date(latestPHQ9.date).toLocaleDateString()}
                </Label>
              </div>
            )}
            {latestGAD7 && (
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="gad7" 
                  checked={includeGAD7}
                  onCheckedChange={(checked) => setIncludeGAD7(!!checked)}
                />
                <Label htmlFor="gad7">
                  GAD-7: {latestGAD7.score} poäng ({latestGAD7.severity}) - {new Date(latestGAD7.date).toLocaleDateString()}
                </Label>
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
            <div className="flex gap-2">
              <Button onClick={exportPDF} variant="outline" size="sm">
                <FileDown className="w-4 h-4 mr-2" />
                Exportera PDF
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}