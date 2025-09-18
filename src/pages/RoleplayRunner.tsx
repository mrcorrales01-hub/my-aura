import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { streamAuri } from '@/features/auri/getAuriResponse';
import { auriSystemPrompt } from '@/ai/auriPrompt';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { Json } from '@/integrations/supabase/types';

interface RoleplayStep {
  id: number;
  role: 'system' | 'coach' | 'user_prompt';
  text: string;
}

interface RoleplayScript {
  id: string;
  slug: string; 
  title: string;
  description: string;
  steps: Json;
}

export default function RoleplayRunner() {
  const { id: slug } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(['roleplay', 'common']);
  const { user } = useAuthContext();
  
  const [script, setScript] = useState<RoleplayScript | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(true);
  const [processingAI, setProcessingAI] = useState(false);

  useEffect(() => {
    const fetchScript = async () => {
      if (!slug) return;
      
      try {
        const { data, error } = await supabase
          .from('roleplay_scripts')
          .select('*')
          .eq('slug', slug)
          .eq('is_active', true)
          .single();

        if (error || !data) {
          console.error('Script not found:', error);
          navigate('/roleplay');
          return;
        }

        setScript(data);
      } catch (error) {
        console.error('Error fetching script:', error);
        navigate('/roleplay');
      } finally {
        setLoading(false);
      }
    };

    fetchScript();
  }, [slug, navigate]);

  if (!user) {
    return (
      <div className="p-4">
        <Card className="p-6 text-center">
          <p>Logga in för att använda rollspel</p>
          <Button onClick={() => navigate('/auth')} className="mt-4">Logga in</Button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return <div className="p-4">Laddar...</div>;
  }

  if (!script) {
    return (
      <div className="p-4">
        <p>Scenario not found</p>
        <Button onClick={() => navigate('/roleplay')}>
          Tillbaka
        </Button>
      </div>
    );
  }

  const steps = Array.isArray(script.steps) ? (script.steps as unknown as RoleplayStep[]) : [];
  const step = steps[currentStep];
  
  const handleNext = async () => {
    if (step?.role === 'user_prompt' && userInput.trim()) {
      // Get AI response using roleplay context
      setProcessingAI(true);
      setAiResponse('');
      
      try {
        const roleplayPrompt = auriSystemPrompt(i18n.language || 'sv') + 
          `\n\nDu spelar den andra personen i scenariot: ${script.title}. ` +
          `Svara naturligt på användarens input: "${userInput.trim()}"`;

        await streamAuri({
          messages: [
            { role: 'system', content: roleplayPrompt },
            { role: 'user', content: userInput.trim() }
          ],
          lang: i18n.language || 'sv'
        }, (token) => {
          setAiResponse(prev => prev + token);
        });
      } catch (error) {
        console.error('AI response error:', error);
        setAiResponse('AI-svar misslyckades. Försök igen.');
      } finally {
        setProcessingAI(false);
      }
      
      setUserInput('');
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    navigate('/roleplay');
  };

  const isLastStep = currentStep >= steps.length - 1;
  
  return (
    <div className="space-y-4 p-4 pb-24">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/roleplay')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Tillbaka
        </Button>
        <div className="text-sm text-muted-foreground">
          Steg {currentStep + 1} av {steps.length}
        </div>
      </div>

      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-2">{script.title}</h1>
        <p className="text-muted-foreground mb-6">{script.description}</p>

        {step && (
          <div className="space-y-4">
            {step.role === 'coach' && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start space-x-2">
                  <div className="text-blue-600 font-medium">Coach:</div>
                  <div className="text-blue-900">{step.text}</div>
                </div>
              </div>
            )}

            {step.role === 'system' && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start space-x-2">
                  <div className="text-gray-600 font-medium">System:</div>
                  <div className="text-gray-900">{step.text}</div>
                </div>
              </div>
            )}

            {step.role === 'user_prompt' && (
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <div className="text-green-600 font-medium">Din tur:</div>
                    <div className="text-green-900">{step.text}</div>
                  </div>
                </div>
                
                <Textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Skriv ditt svar här..."
                  className="min-h-[100px]"
                />

                {aiResponse && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <div className="text-purple-600 font-medium">Motspelare:</div>
                      <div className="text-purple-900 whitespace-pre-wrap">{aiResponse}</div>
                    </div>
                  </div>
                )}

                {processingAI && (
                  <div className="text-center text-muted-foreground">
                    AI svarar...
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between items-center mt-6">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tillbaka
          </Button>

          <div className="flex space-x-2">
            {isLastStep ? (
              <Button onClick={handleFinish}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Avsluta
              </Button>
            ) : (
              <Button 
                onClick={handleNext}
                disabled={step?.role === 'user_prompt' && !userInput.trim() && !aiResponse}
              >
                Nästa
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}