import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  Wind, 
  Eye, 
  Brain, 
  Waves, 
  Scan, 
  Timer,
  Play,
  Square,
  CheckCircle,
  RotateCcw
} from 'lucide-react';
import { addLog } from '@/features/cards/store';
import { useToast } from '@/hooks/use-toast';

const CoachCardsPage = () => {
  const { t } = useTranslation('cards');
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const [timer, setTimer] = useState<number>(0);
  const [isRunning, setIsRunning] = useState(false);
  const [note, setNote] = useState('');
  
  // Card-specific states
  const [breathCycles, setBreathCycles] = useState(4);
  const [breathPhase, setBreathPhase] = useState('inhale'); // inhale, hold, exhale
  const [groundingChecklist, setGroundingChecklist] = useState({
    see: false,
    hear: false,
    touch: false,
    smell: false,
    taste: false
  });
  const [reframeInput, setReframeInput] = useState('');
  const [urgeIntensityBefore, setUrgeIntensityBefore] = useState(5);
  const [urgeIntensityAfter, setUrgeIntensityAfter] = useState(5);
  const [bodyScanPart, setBodyScanPart] = useState(0);
  const [starterTask, setStarterTask] = useState('');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && activeCard) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, activeCard]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLog = (cardId: string, customNote?: string) => {
    addLog(cardId, customNote || note);
    toast({
      title: t('done'),
      description: t('addedJournal')
    });
    setNote('');
  };

  const resetCard = () => {
    setActiveCard(null);
    setTimer(0);
    setIsRunning(false);
    setNote('');
    setGroundingChecklist({ see: false, hear: false, touch: false, smell: false, taste: false });
    setReframeInput('');
    setBodyScanPart(0);
    setStarterTask('');
  };

  const cards = [
    {
      id: 'breath',
      title: t('breath'),
      icon: Wind,
      description: '4-7-8 andning med visuell guide',
      color: 'bg-blue-500'
    },
    {
      id: 'ground',
      title: t('ground'),
      icon: Eye,
      description: '5 saker du ser, 4 du hör, 3 du känner...',
      color: 'bg-green-500'
    },
    {
      id: 'reframe',
      title: t('reframe'),
      icon: Brain,
      description: 'Identifiera tankefällor och omformulera',
      color: 'bg-purple-500'
    },
    {
      id: 'urge',
      title: t('urge'),
      icon: Waves,
      description: '10-min timer med våg-visualisering',
      color: 'bg-cyan-500'
    },
    {
      id: 'body',
      title: t('body'),
      icon: Scan,
      description: 'Stepper fot→huvud med timer',
      color: 'bg-orange-500'
    },
    {
      id: 'starter',
      title: t('starter'),
      icon: Timer,
      description: '120s countdown för att komma igång',
      color: 'bg-red-500'
    }
  ];

  const auriRepliesMap: Record<string, string[]> = {
    breath: ["Fler andningstekniker?", "Hjälp med ångest"],
    ground: ["Ge mig fler konkreta sinnesövningar", "Andra grounding-tekniker"],
    reframe: ["Fler vanliga tankefällor", "Hjälp med negativa tankar"],
    urge: ["Strategier för impulskontroll", "Vad gör jag om urge ökar?"],
    body: ["Avslappningsövningar", "Hjälp med spänningar"],
    starter: ["Motivation att komma igång", "Övervinna prokrastinering"]
  };

  if (activeCard) {
    const card = cards.find(c => c.id === activeCard)!;
    
    return (
      <div className="container mx-auto px-4 py-8 pb-24">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <card.icon className="w-5 h-5" />
                  {card.title}
                </CardTitle>
                <Button size="sm" variant="outline" onClick={resetCard}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Breathing Card */}
              {activeCard === 'breath' && (
                <div className="text-center space-y-4">
                  <div className="w-32 h-32 mx-auto relative">
                    <div className={`w-full h-full rounded-full border-4 border-blue-500 transition-all duration-4000 ${
                      isRunning ? 'scale-150 opacity-60' : 'scale-100 opacity-100'
                    }`} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold">{breathPhase}</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Cykler: {breathCycles}</Label>
                    <input
                      type="range"
                      min="3"
                      max="6"
                      value={breathCycles}
                      onChange={(e) => setBreathCycles(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  <Button 
                    onClick={() => {
                      setIsRunning(!isRunning);
                      setTimer(0);
                    }}
                    className="w-full"
                  >
                    {isRunning ? <Square className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    {isRunning ? 'Stoppa' : t('start')}
                  </Button>
                </div>
              )}

              {/* Grounding Card */}
              {activeCard === 'ground' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    {[
                      { key: 'see', label: '5 saker du SER', count: 5 },
                      { key: 'hear', label: '4 saker du HÖR', count: 4 },
                      { key: 'touch', label: '3 saker du KÄNNER', count: 3 },
                      { key: 'smell', label: '2 saker du LUKTAR', count: 2 },
                      { key: 'taste', label: '1 sak du SMAKAR', count: 1 }
                    ].map((item) => (
                      <div 
                        key={item.key}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          groundingChecklist[item.key as keyof typeof groundingChecklist] 
                            ? 'bg-green-50 border-green-300' 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setGroundingChecklist(prev => ({
                          ...prev,
                          [item.key]: !prev[item.key as keyof typeof prev]
                        }))}
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle className={`w-5 h-5 ${
                            groundingChecklist[item.key as keyof typeof groundingChecklist] 
                              ? 'text-green-600' 
                              : 'text-gray-300'
                          }`} />
                          {item.label}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Progress 
                    value={(Object.values(groundingChecklist).filter(Boolean).length / 5) * 100} 
                  />
                </div>
              )}

              {/* Reframe Card */}
              {activeCard === 'reframe' && (
                <div className="space-y-4">
                  <div className="text-sm space-y-2">
                    <div className="font-medium">Vanliga tankefällor:</div>
                    <div className="text-xs space-y-1">
                      <div>• Allt-eller-inget tänk</div>
                      <div>• Katastrofiering</div>
                      <div>• Tankeläsning</div>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Sätt en ny formulering:</Label>
                    <Textarea
                      value={reframeInput}
                      onChange={(e) => setReframeInput(e.target.value)}
                      placeholder="Skriv en mer balanserad tanke..."
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {/* Urge Surfing Card */}
              {activeCard === 'urge' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-mono mb-2">
                      {formatTime(timer)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Mål: 10 minuter
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Intensitet före: {urgeIntensityBefore}/10</Label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={urgeIntensityBefore}
                      onChange={(e) => setUrgeIntensityBefore(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  {timer >= 600 && (
                    <div className="space-y-2">
                      <Label>Intensitet efter: {urgeIntensityAfter}/10</Label>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={urgeIntensityAfter}
                        onChange={(e) => setUrgeIntensityAfter(parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  )}
                  
                  <Button 
                    onClick={() => setIsRunning(!isRunning)}
                    className="w-full"
                  >
                    {isRunning ? <Square className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    {isRunning ? 'Pausa' : t('start')}
                  </Button>
                </div>
              )}

              {/* Body Scan Card */}
              {activeCard === 'body' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-lg font-medium mb-2">
                      {['Fötter', 'Ben', 'Mage', 'Bröst', 'Armar', 'Axlar', 'Huvud'][bodyScanPart]}
                    </div>
                    <Progress value={(bodyScanPart / 6) * 100} className="mb-4" />
                  </div>
                  
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-mono">
                      {formatTime(timer)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      2-4 minuter per del
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => setIsRunning(!isRunning)}
                      variant="outline"
                      className="flex-1"
                    >
                      {isRunning ? 'Pausa' : 'Fortsätt'}
                    </Button>
                    <Button 
                      onClick={() => {
                        if (bodyScanPart < 6) {
                          setBodyScanPart(prev => prev + 1);
                          setTimer(0);
                        }
                      }}
                      disabled={bodyScanPart >= 6}
                    >
                      Nästa del
                    </Button>
                  </div>
                </div>
              )}

              {/* Starter Card */}
              {activeCard === 'starter' && (
                <div className="space-y-4">
                  <div>
                    <Label>Vad startar du?</Label>
                    <Input
                      value={starterTask}
                      onChange={(e) => setStarterTask(e.target.value)}
                      placeholder="t.ex. städa skrivbordet"
                    />
                  </div>
                  
                  <div className="text-center">
                    <div className="text-4xl font-mono mb-2">
                      {formatTime(Math.max(0, 120 - timer))}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {timer >= 120 ? 'Tid att börja!' : 'Countdown'}
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => {
                      setIsRunning(!isRunning);
                      if (!isRunning) setTimer(0);
                    }}
                    className="w-full"
                    variant={timer >= 120 ? "default" : "outline"}
                  >
                    {isRunning ? 'Pausa' : t('start')}
                  </Button>
                </div>
              )}

              {/* Common actions */}
              <div className="pt-4 border-t space-y-3">
                <div>
                  <Label>Anteckning (valfritt)</Label>
                  <Textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Hur kändes det?"
                    rows={2}
                  />
                </div>
                
                <Button 
                  onClick={() => handleLog(activeCard, note)}
                  className="w-full"
                >
                  {t('log')}
                </Button>
                
                <div className="flex flex-wrap gap-1">
                  {auriRepliesMap[activeCard]?.map((reply, i) => (
                    <Button 
                      key={i}
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate('/chat', { state: { prefill: reply } })}
                    >
                      {reply}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
        {cards.map((card) => (
          <Card 
            key={card.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setActiveCard(card.id)}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center`}>
                  <card.icon className="w-5 h-5 text-white" />
                </div>
                {card.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{card.description}</p>
              <Button size="sm" className="mt-3 w-full">
                {t('start')}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CoachCardsPage;