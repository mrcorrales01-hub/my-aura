import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  Theater, 
  PlayCircle, 
  ArrowRight, 
  RotateCcw, 
  CheckCircle,
  Loader2,
  Users,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/ui/use-toast';
import { roleplayService, type RoleplayScript, type RoleplayResponse, type RoleplayOption } from '@/services/roleplay';

const Roleplay = () => {
  const [scripts, setScripts] = useState<RoleplayScript[]>([]);
  const [selectedScript, setSelectedScript] = useState<string>('');
  const [currentRoleplay, setCurrentRoleplay] = useState<RoleplayResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingScripts, setLoadingScripts] = useState(true);
  
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const { toast } = useToast();

  useEffect(() => {
    loadScripts();
  }, [i18n.language]);

  const loadScripts = async () => {
    try {
      setLoadingScripts(true);
      const scriptList = await roleplayService.getScripts(i18n.language);
      setScripts(scriptList);
      
      // If no scripts for current language, try English
      if (scriptList.length === 0 && i18n.language !== 'en') {
        const englishScripts = await roleplayService.getScripts('en');
        setScripts(englishScripts);
      }
    } catch (error) {
      console.error('Failed to load scripts:', error);
      toast({
        title: t('common.error'),
        description: i18n.language === 'sv' ? 'Kunde inte ladda scenarier' : 'Failed to load scenarios',
        variant: 'destructive',
      });
    } finally {
      setLoadingScripts(false);
    }
  };

  const startRoleplay = async (scriptSlug: string) => {
    if (!scriptSlug) return;
    
    try {
      setLoading(true);
      const response = await roleplayService.startRoleplay(scriptSlug, i18n.language);
      setCurrentRoleplay(response);
    } catch (error) {
      console.error('Failed to start roleplay:', error);
      toast({
        title: t('common.error'),
        description: i18n.language === 'sv' ? 'Kunde inte starta rollspel' : 'Failed to start roleplay',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const continueRoleplay = async (choice: string) => {
    if (!currentRoleplay || !selectedScript) return;

    try {
      setLoading(true);
      const response = await roleplayService.continueRoleplay(
        selectedScript,
        currentRoleplay.run_id,
        choice,
        i18n.language
      );
      setCurrentRoleplay(response);
    } catch (error) {
      console.error('Failed to continue roleplay:', error);
      toast({
        title: t('common.error'),
        description: i18n.language === 'sv' ? 'Kunde inte fortsätta rollspel' : 'Failed to continue roleplay',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const exitRoleplay = () => {
    setCurrentRoleplay(null);
    setSelectedScript('');
  };

  const restartRoleplay = () => {
    if (selectedScript) {
      startRoleplay(selectedScript);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">
              {i18n.language === 'sv' ? 'Logga in' : 'Please sign in'}
            </h2>
            <p className="text-muted-foreground">
              {i18n.language === 'sv' 
                ? 'Logga in för att komma åt rollspelsscenarier och fortsätt din välmåenderesa.'
                : 'Sign in to access roleplay scenarios and continue your wellness journey.'
              }
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentRoleplay) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto">
          {/* Roleplay Header */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-aura-gradient flex items-center justify-center">
                    <Theater className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{currentRoleplay.script_title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {t('roleplay.step')} {currentRoleplay.step} {t('roleplay.of')} {currentRoleplay.total_steps}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button onClick={restartRoleplay} variant="outline" size="sm">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    {t('roleplay.startOver')}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        {t('roleplay.exitRoleplay')}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('roleplay.confirmExit')}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {i18n.language === 'sv' 
                            ? 'Du kommer att förlora dina framsteg i detta scenario.'
                            : 'You will lose your progress in this scenario.'
                          }
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={exitRoleplay}>
                          {t('roleplay.exitRoleplay')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <Progress 
                value={(currentRoleplay.step / currentRoleplay.total_steps) * 100} 
                className="w-full"
              />
            </CardHeader>
          </Card>

          {/* Current Scenario */}
          <Card className="mb-6">
            <CardContent className="p-6">
              {currentRoleplay.done ? (
                <div className="text-center space-y-4">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                  <h3 className="text-xl font-semibold">{t('roleplay.completed')}</h3>
                  <p className="text-muted-foreground">{currentRoleplay.prompt}</p>
                  <div className="flex justify-center space-x-4">
                    <Button onClick={restartRoleplay} variant="outline">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      {t('roleplay.startOver')}
                    </Button>
                    <Button onClick={exitRoleplay}>
                      {t('common.finish')}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-aura-calm/20 p-4 rounded-lg border border-aura-calm">
                    <div className="flex items-start space-x-3">
                      <MessageSquare className="w-5 h-5 text-aura-primary mt-1" />
                      <p className="text-sm leading-relaxed">{currentRoleplay.prompt}</p>
                    </div>
                  </div>

                  {currentRoleplay.options.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">{t('roleplay.choose')}</h4>
                      <div className="grid gap-3">
                        {currentRoleplay.options.map((option: RoleplayOption, index: number) => (
                          <Button
                            key={index}
                            variant="outline"
                            className="justify-start h-auto p-4 text-left"
                            onClick={() => continueRoleplay(option.value)}
                            disabled={loading}
                          >
                            <div className="w-full">
                              <div className="flex items-center justify-between">
                                <span className="text-sm">{option.text}</span>
                                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                              </div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {loading && (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin text-aura-primary" />
                      <span className="ml-2 text-sm text-muted-foreground">
                        {i18n.language === 'sv' ? 'Bearbetar...' : 'Processing...'}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-aura-gradient flex items-center justify-center">
              <Theater className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">{t('roleplay.title')}</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('roleplay.subtitle')}
          </p>
        </div>

        {/* Script Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <PlayCircle className="w-5 h-5 mr-2" />
              {t('roleplay.selectScript')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingScripts ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-aura-primary" />
                <span className="ml-2">{t('common.loading')}</span>
              </div>
            ) : scripts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('roleplay.noScripts')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Select value={selectedScript} onValueChange={setSelectedScript}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('roleplay.selectScript')} />
                  </SelectTrigger>
                  <SelectContent>
                    {scripts.map((script) => (
                      <SelectItem key={script.id} value={script.slug}>
                        <div className="text-left">
                          <div className="font-medium">{script.title}</div>
                          <div className="text-xs text-muted-foreground">{script.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedScript && (
                  <div className="flex justify-center">
                    <Button 
                      onClick={() => startRoleplay(selectedScript)}
                      disabled={loading}
                      className="bg-aura-primary hover:bg-aura-primary/90"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <PlayCircle className="w-4 h-4 mr-2" />
                      )}
                      {i18n.language === 'sv' ? 'Starta scenario' : 'Start Scenario'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">
                  {i18n.language === 'sv' ? 'Vad är rollspelsscenarier?' : 'What are roleplay scenarios?'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {i18n.language === 'sv' 
                    ? 'Säkra, guidade övningar där du kan öva på utmanande situationer innan de händer i verkliga livet.'
                    : 'Safe, guided exercises where you can practice challenging situations before they happen in real life.'
                  }
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">
                  {i18n.language === 'sv' ? 'Hur fungerar det?' : 'How does it work?'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {i18n.language === 'sv'
                    ? 'Välj ett scenario, gör val som känns rätt för dig, och få vägledning från Auri genom hela processen.'
                    : 'Choose a scenario, make choices that feel right to you, and get guidance from Auri throughout the process.'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Roleplay;