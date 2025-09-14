import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { 
  FileText, 
  Stethoscope, 
  Pill, 
  MessageSquare, 
  Download,
  CheckCircle
} from 'lucide-react';

const BesokPage = () => {
  const { t, i18n } = useTranslation(['visit', 'common']);
  const [questions, setQuestions] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [medications, setMedications] = useState('');
  const [summary, setSummary] = useState('');

  const createSummary = () => {
    const parts = [];
    
    if (questions.trim()) {
      parts.push(`**Mina frågor:**\n${questions.trim()}`);
    }
    
    if (symptoms.trim()) {
      parts.push(`**Symtom (senaste 7 dagarna):**\n${symptoms.trim()}`);
    }
    
    if (medications.trim()) {
      parts.push(`**Mediciner & biverkningar:**\n${medications.trim()}`);
    }
    
    if (parts.length > 0) {
      const summaryText = `# Läkarbesök - ${new Date().toLocaleDateString('sv-SE')}\n\n${parts.join('\n\n')}\n\n---\n*Skapad med My Aura*`;
      setSummary(summaryText);
    }
  };

  const downloadSummary = () => {
    if (!summary) return;
    
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lakarbesok-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Besök</h1>
          <p className="text-muted-foreground">
            Förberedelse inför läkarbesök
          </p>
          <Badge variant="secondary" className="mt-2">
            Färdigställ din lägesbild
          </Badge>
        </div>

        <div className="space-y-6">
          {/* Questions Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-primary" />
                Dina topp 3 frågor
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Vad vill du få svar på under besöket?
              </p>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Skriv dina viktigaste frågor till läkaren..."
                value={questions}
                onChange={(e) => setQuestions(e.target.value)}
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>

          {/* Symptoms Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2 text-primary" />
                Symtom senaste 7 dagar
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Beskriv symtom, intensitet och när de uppstår
              </p>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Beskriv symtom, intensitet och när de uppstår..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="min-h-[120px]"
              />
            </CardContent>
          </Card>

          {/* Medications Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Pill className="w-5 h-5 mr-2 text-primary" />
                Läkemedel & biverkningar (valfritt)
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Aktuella mediciner och eventuella biverkningar
              </p>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Aktuella mediciner och eventuella biverkningar..."
                value={medications}
                onChange={(e) => setMedications(e.target.value)}
                className="min-h-[80px]"
              />
            </CardContent>
          </Card>

          {/* Create Summary Button */}
          <div className="flex justify-center">
            <Button 
              onClick={createSummary}
              disabled={!questions.trim() && !symptoms.trim()}
              className="px-8"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Skapa sammanfattning
            </Button>
          </div>

          {/* Summary Section */}
          {summary && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-primary" />
                    Din sammanfattning
                  </span>
                  <Button 
                    onClick={downloadSummary}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Ladda ner
                  </Button>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Ta med denna sammanfattning till ditt läkarbesök
                </p>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap font-sans">
                    {summary}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground text-center">
                💡 Tips: Förbered dig väl för att få ut det mesta av ditt läkarbesök. 
                En tydlig lägesbild hjälper läkaren att ge dig bästa möjliga vård.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BesokPage;