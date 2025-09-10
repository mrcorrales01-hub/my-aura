import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, FileText, Lightbulb, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  getSymptomLogs, 
  getVisitPrepLatest, 
  saveVisitPrep,
  type VisitPrep 
} from '@/lib/store/visitRepo';
import { genDoctorQuestions, genSBAR } from '@/features/visit/auriDoctor';
import { exportVisitPdf } from '@/features/visit/pdf';

const VisitPrepare = () => {
  const { t, i18n } = useTranslation(['visit', 'common']);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [concerns, setConcerns] = useState('');
  const [questions, setQuestions] = useState<string[]>([]);
  const [phq9Score, setPhq9Score] = useState(0);
  const [gad7Score, setGad7Score] = useState(0);
  const [sbar, setSbar] = useState<{ S: string; B: string; A: string; R: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadExistingPrep();
  }, []);

  const loadExistingPrep = async () => {
    try {
      const existing = await getVisitPrepLatest();
      if (existing) {
        setConcerns(existing.concerns || '');
        setQuestions(existing.topQuestions || []);
        setPhq9Score(existing.phq9 || 0);
        setGad7Score(existing.gad7 || 0);
      }
    } catch (error) {
      console.error('Error loading existing prep:', error);
    }
  };

  const generateQuestions = async () => {
    if (!concerns.trim()) {
      toast({
        title: t('common:error'),
        description: 'Please enter your concerns first',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Get recent symptoms and mock journal entries
      const recentLogs = await getSymptomLogs(14);
      const mockJournals = ['mood tracking', 'sleep issues', 'stress management'];
      
      const generatedQuestions = await genDoctorQuestions({
        lang: i18n.language,
        logs: recentLogs,
        journals: mockJournals,
        phq9: phq9Score > 0 ? phq9Score : undefined,
        gad7: gad7Score > 0 ? gad7Score : undefined
      });

      setQuestions(generatedQuestions);
      
      toast({
        title: 'Questions generated',
        description: `Generated ${generatedQuestions.length} questions for your visit`
      });
    } catch (error) {
      console.error('Error generating questions:', error);
      toast({
        title: t('common:error'),
        description: 'Failed to generate questions',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSBARPreview = async () => {
    if (!concerns.trim()) {
      setSbar({
        S: 'Patient seeking medical consultation',
        B: 'Using digital wellness tracking',
        A: `${phq9Score > 0 ? `PHQ-9: ${phq9Score}/27` : ''} ${gad7Score > 0 ? `GAD-7: ${gad7Score}/21` : ''}`.trim() || 'Assessment pending',
        R: 'Patient requests evaluation and treatment recommendations'
      });
      return;
    }

    try {
      const recentLogs = await getSymptomLogs(14);
      const logsSummary = recentLogs
        .slice(0, 5)
        .map(log => `${log.tags.join(', ')} (${log.intensity}/10)`)
        .join('; ') || 'No recent symptoms logged';

      const generatedSBAR = await genSBAR(
        i18n.language,
        concerns,
        logsSummary,
        phq9Score > 0 ? phq9Score : undefined,
        gad7Score > 0 ? gad7Score : undefined
      );

      setSbar(generatedSBAR);
    } catch (error) {
      console.error('Error generating SBAR:', error);
      // Use fallback
      setSbar({
        S: concerns,
        B: 'Patient using digital wellness tracking with symptom monitoring',
        A: `${phq9Score > 0 ? `PHQ-9: ${phq9Score}/27` : ''} ${gad7Score > 0 ? `GAD-7: ${gad7Score}/21` : ''}`.trim() || 'Assessment pending',
        R: 'Patient requests evaluation based on tracked symptoms'
      });
    }
  };

  const handleSavePrep = async () => {
    try {
      const prep: Partial<VisitPrep> = {
        concerns,
        topQuestions: questions,
        phq9: phq9Score > 0 ? phq9Score : undefined,
        gad7: gad7Score > 0 ? gad7Score : undefined,
        sbar: sbar as any
      };

      await saveVisitPrep(prep);
      
      toast({
        title: t('visit:save'),
        description: 'Visit preparation saved successfully'
      });
    } catch (error) {
      console.error('Error saving preparation:', error);
      toast({
        title: t('common:error'),
        description: 'Failed to save preparation',
        variant: 'destructive'
      });
    }
  };

  const handleExportPdf = async () => {
    if (!sbar) {
      await generateSBARPreview();
      return;
    }

    setIsExporting(true);
    try {
      const recentLogs = await getSymptomLogs(14);
      
      exportVisitPdf({
        lang: i18n.language,
        sbar,
        questions,
        logs: recentLogs,
        phq9: phq9Score > 0 ? phq9Score : undefined,
        gad7: gad7Score > 0 ? gad7Score : undefined
      });

      toast({
        title: t('visit:exportPdf'),
        description: 'PDF exported successfully'
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: t('common:error'),
        description: 'Failed to export PDF',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/visit')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">{t('visit:prepare')}</h1>
        <Badge variant="outline">Step {step}/4</Badge>
      </div>

      {/* Step 1: Concerns */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('visit:concerns')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={concerns}
              onChange={(e) => setConcerns(e.target.value)}
              placeholder="What are your main concerns for this visit? What symptoms or issues would you like to discuss?"
              className="min-h-[120px]"
            />
            <Button onClick={() => setStep(2)} disabled={!concerns.trim()}>
              Next: Generate Questions
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Questions */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              {t('visit:yourQuestions')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {questions.length === 0 ? (
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  Generate AI-powered questions based on your concerns and recent symptoms
                </p>
                <Button onClick={generateQuestions} disabled={isGenerating}>
                  {isGenerating ? 'Generating...' : t('visit:generateQuestions')}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  {questions.map((question, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 rounded border">
                      <Checkbox defaultChecked className="mt-1" />
                      <span className="text-sm flex-1">{question}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button onClick={generateQuestions} variant="outline" disabled={isGenerating}>
                    {isGenerating ? 'Generating...' : 'Regenerate'}
                  </Button>
                  <Button onClick={() => setStep(3)}>
                    Next: Quick Tests
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: PHQ-9 & GAD-7 */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('visit:tests')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">{t('visit:phq9')}</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Quick depression screening (0-27 scale)
              </p>
              <input
                type="range"
                min="0"
                max="27"
                value={phq9Score}
                onChange={(e) => setPhq9Score(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>None (0)</span>
                <span>Score: {phq9Score}</span>
                <span>Severe (27)</span>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">{t('visit:gad7')}</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Quick anxiety screening (0-21 scale)
              </p>
              <input
                type="range"
                min="0"
                max="21"
                value={gad7Score}
                onChange={(e) => setGad7Score(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>None (0)</span>
                <span>Score: {gad7Score}</span>
                <span>Severe (21)</span>
              </div>
            </div>

            <Button onClick={() => { generateSBARPreview(); setStep(4); }} className="w-full">
              Next: Preview & Export
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 4: SBAR Preview */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t('visit:previewPdf')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sbar ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">S - Situation</h3>
                  <p className="text-sm">{sbar.S}</p>
                </div>

                <div>
                  <h3 className="font-semibold">B - Background</h3>
                  <p className="text-sm">{sbar.B}</p>
                </div>

                <div>
                  <h3 className="font-semibold">A - Assessment</h3>
                  <p className="text-sm">{sbar.A}</p>
                </div>

                <div>
                  <h3 className="font-semibold">R - Recommendations</h3>
                  <p className="text-sm">{sbar.R}</p>
                  {questions.length > 0 && (
                    <ul className="mt-2 space-y-1 text-sm">
                      {questions.slice(0, 6).map((question, index) => (
                        <li key={index}>• {question}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSavePrep} variant="outline" className="flex-1">
                    {t('visit:save')}
                  </Button>
                  <Button 
                    onClick={handleExportPdf} 
                    disabled={isExporting}
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isExporting ? 'Exporting...' : t('visit:exportPdf')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p>Generating SBAR preview...</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VisitPrepare;