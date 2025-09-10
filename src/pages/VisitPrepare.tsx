import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, Lightbulb } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const VisitPrepare = () => {
  const { t, i18n } = useTranslation(['visit', 'common']);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [concerns, setConcerns] = useState('');
  const [questions, setQuestions] = useState<string[]>([]);
  const [phq9Score, setPhq9Score] = useState(0);
  const [gad7Score, setGad7Score] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Get recent symptom logs
      const { data: symptoms } = await supabase
        .from('symptom_logs')
        .select('tags, note, intensity, created_at')
        .eq('user_id', session.user.id)
        .gte('created_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      // Get recent conversations for journal themes
      const { data: conversations } = await supabase
        .from('conversations')
        .select('message')
        .eq('user_id', session.user.id)
        .gte('created_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      const systemPrompt = `Create 6-8 concise questions for a doctor visit in ${i18n.language}. Use patient's concerns, recent symptoms, and journal themes. Be concrete, no duplication, each ≤100 chars.

Concerns: ${concerns}
Recent symptoms: ${symptoms?.map(s => `${s.tags?.join(', ')} (intensity: ${s.intensity}): ${s.note || ''}`).join('; ') || 'None'}
Journal themes: ${conversations?.map(c => c.message.substring(0, 50)).join('; ') || 'None'}

Return as JSON array of strings.`;

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auri-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: systemPrompt }],
          lang: i18n.language
        })
      });

      if (!response.ok) throw new Error('Failed to generate questions');
      
      const reader = response.body?.getReader();
      let result = '';
      
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          result += new TextDecoder().decode(value);
        }
      }

      // Try to extract JSON array from response
      const jsonMatch = result.match(/\[(.*?)\]/s);
      if (jsonMatch) {
        try {
          const parsedQuestions = JSON.parse(jsonMatch[0]);
          setQuestions(parsedQuestions.slice(0, 8));
        } catch {
          // Fallback: split by newlines and clean up
          const fallbackQuestions = result.split('\n')
            .filter(line => line.trim() && !line.includes('JSON'))
            .map(line => line.replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, '').trim())
            .filter(q => q.length > 10 && q.length <= 100)
            .slice(0, 8);
          setQuestions(fallbackQuestions);
        }
      }

      toast({
        title: 'Questions generated',
        description: 'Review and edit your questions below'
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

  const savePreparation = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('visit_preps')
        .upsert({
          user_id: session.user.id,
          concerns,
          top_questions: questions,
          sbar: {
            tests: {
              phq9: phq9Score,
              gad7: gad7Score
            }
          }
        });

      if (error) throw error;

      toast({
        title: t('visit:save'),
        description: 'Visit preparation saved'
      });

      navigate('/visit/pdf');
    } catch (error) {
      console.error('Error saving preparation:', error);
      toast({
        title: t('common:error'),
        description: 'Failed to save preparation',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/visit')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">{t('visit:prepare')}</h1>
        <Badge variant="outline">Step {step}/3</Badge>
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('visit:concerns')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={concerns}
              onChange={(e) => setConcerns(e.target.value)}
              placeholder="What are your main concerns for this visit?"
              className="min-h-[120px]"
            />
            <Button onClick={() => setStep(2)} disabled={!concerns.trim()}>
              Next: Generate Questions
            </Button>
          </CardContent>
        </Card>
      )}

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
              <Button onClick={generateQuestions} disabled={isGenerating}>
                {isGenerating ? 'Generating...' : t('visit:generateQuestions')}
              </Button>
            ) : (
              <div className="space-y-2">
                {questions.map((question, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Checkbox defaultChecked />
                    <span className="text-sm">{question}</span>
                  </div>
                ))}
                <div className="flex gap-2 pt-2">
                  <Button onClick={generateQuestions} variant="outline" disabled={isGenerating}>
                    Regenerate
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

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('visit:tests')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">{t('visit:phq9')}</h3>
              <p className="text-sm text-muted-foreground mb-2">
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
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>None (0)</span>
                <span>Score: {phq9Score}</span>
                <span>Severe (27)</span>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">{t('visit:gad7')}</h3>
              <p className="text-sm text-muted-foreground mb-2">
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
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>None (0)</span>
                <span>Score: {gad7Score}</span>
                <span>Severe (21)</span>
              </div>
            </div>

            <Button onClick={savePreparation} className="w-full">
              {t('visit:previewPdf')}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VisitPrepare;