import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Heart, User, Play, RotateCcw, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RoleplayMessage {
  id: string;
  content: string;
  sender: 'user' | 'role';
  timestamp: Date;
}

const Roleplay = () => {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [messages, setMessages] = useState<RoleplayMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isActive, setIsActive] = useState(false);
  const { toast } = useToast();

  const scenarios = [
    {
      id: 'partner',
      title: 'Samtal med partner',
      description: 'Öva på att kommunicera med din partner om känslor och behov',
      roleDescription: 'Jag spelar din partner som är lite defensiv men vill förstå',
      color: 'bg-coral'
    },
    {
      id: 'parent',
      title: 'Gränssättning med förälder',
      description: 'Träna på att sätta gränser med en förälder som är påträngande',
      roleDescription: 'Jag spelar en förälder som har svårt att respektera gränser',
      color: 'bg-calm'
    },
    {
      id: 'boss',
      title: 'Konflikt med chef',
      description: 'Öva på att hantera en svår arbetssituation professionellt',
      roleDescription: 'Jag spelar en stressad chef som är kritisk',
      color: 'bg-wellness-primary'
    },
    {
      id: 'friend',
      title: 'Besviken vän',
      description: 'Träna på att hantera en vän som känner sig bortglömd',
      roleDescription: 'Jag spelar en vän som känner sig sårad och missförstådd',
      color: 'bg-lavender'
    }
  ];

  const getRoleResponse = (userMessage: string, scenario: string): string => {
    const responses = {
      partner: [
        "Jag förstår inte varför du alltid måste ta upp det här. Kan vi inte bara gå vidare?",
        "Det är inte så enkelt som du tror. Du ser inte allt jag gör för vår relation.",
        "Okej, jag hör vad du säger, men jag känner mig också missförstådd ibland.",
        "Jag försöker verkligen, men det känns som att ingenting jag gör är bra nog."
      ],
      parent: [
        "Men jag är ju din förälder, jag har rätt att veta vad som händer i ditt liv!",
        "Du är så känslig nuförtiden. Vi brukade kunna prata om allt.",
        "Jag förstår inte varför du blir så upprörd. Jag menar bara väl.",
        "Okej okej, jag ska försöka respektera det, men det blir svårt för mig."
      ],
      boss: [
        "Vi har mycket att göra här, jag hoppas du kan hänga med.",
        "Det här projektet är kritiskt. Jag behöver veta att du kan leverera.",
        "Jag förstår din synpunkt, men vi måste tänka på företagets behov först.",
        "Okej, låt oss hitta en lösning som fungerar för alla."
      ],
      friend: [
        "Jag känner mig så bortglömd. Vi träffas aldrig längre.",
        "Det verkar som att du alltid har viktigare saker att göra än att ses med mig.",
        "Jag saknar hur nära vi brukade vara. Har jag gjort något fel?",
        "Tack för att du förklarar. Jag kanske har missförstått situationen."
      ]
    };

    const scenarioResponses = responses[scenario as keyof typeof responses] || responses.partner;
    return scenarioResponses[Math.floor(Math.random() * scenarioResponses.length)];
  };

  const startRoleplay = (scenarioId: string) => {
    setSelectedScenario(scenarioId);
    setIsActive(true);
    setMessages([]);
    
    const scenario = scenarios.find(s => s.id === scenarioId);
    const welcomeMessage: RoleplayMessage = {
      id: '1',
      content: `Hej! ${scenario?.roleDescription}. Är du redo att börja vårt rollspel? Säg vad du vill träna på!`,
      sender: 'role',
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
    
    toast({
      title: "Rollspel startat! 🎭",
      description: "Du kan avbryta när som helst. Kom ihåg att detta är träning i en trygg miljö.",
    });
  };

  const sendMessage = (content: string) => {
    if (!content.trim() || !isActive) return;

    const userMessage: RoleplayMessage = {
      id: Date.now().toString(),
      content: content.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");

    // Simulate role response delay
    setTimeout(() => {
      const roleResponse: RoleplayMessage = {
        id: (Date.now() + 1).toString(),
        content: getRoleResponse(content, selectedScenario || 'partner'),
        sender: 'role',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, roleResponse]);
    }, 1000);
  };

  const resetRoleplay = () => {
    setIsActive(false);
    setMessages([]);
    setInputValue("");
    setSelectedScenario(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Heart className="w-8 h-8 text-wellness-primary" />
          <h1 className="text-3xl font-bold text-foreground">Interaktiva Rollspel</h1>
        </div>
        <p className="text-lg text-foreground/70">
          Träna på svåra samtal i en trygg miljö
        </p>
      </div>

      {!isActive ? (
        <>
          {/* Scenario Selection */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {scenarios.map((scenario) => (
              <Card 
                key={scenario.id}
                className="p-6 hover:shadow-wellness transition-all duration-300 hover:scale-105 cursor-pointer group"
                onClick={() => startRoleplay(scenario.id)}
              >
                <div className={`w-16 h-16 ${scenario.color} rounded-2xl flex items-center justify-center mb-4 group-hover:animate-wellness-glow`}>
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {scenario.title}
                </h3>
                
                <p className="text-foreground/70 mb-4">
                  {scenario.description}
                </p>
                
                <Badge variant="secondary" className="mb-4">
                  {scenario.roleDescription}
                </Badge>
                
                <Button variant="wellness" className="w-full group-hover:shadow-glow">
                  <Play className="w-4 h-4 mr-2" />
                  Starta rollspel
                </Button>
              </Card>
            ))}
          </div>

          {/* Info Card */}
          <Card className="p-6 bg-wellness-primary/5 border-wellness-primary/20">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-wellness-primary" />
              Så fungerar rollspelen
            </h3>
            <ul className="space-y-2 text-sm text-foreground/80">
              <li>• AI:n spelar en specifik roll och reagerar realistiskt</li>
              <li>• Träna på att uttrycka dina känslor och sätta gränser</li>
              <li>• Experimentera med olika sätt att kommunicera</li>
              <li>• Kom ihåg att detta är en trygg träningsplats</li>
              <li>• Du kan avbryta när som helst om det känns för intensivt</li>
            </ul>
          </Card>
        </>
      ) : (
        <>
          {/* Active Roleplay */}
          <Card className="h-[600px] flex flex-col bg-card/90 backdrop-blur-sm">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${scenarios.find(s => s.id === selectedScenario)?.color} rounded-full flex items-center justify-center`}>
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">
                    {scenarios.find(s => s.id === selectedScenario)?.title}
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    Rollspel aktiv
                  </Badge>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={resetRoleplay}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Avsluta
              </Button>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.sender === 'role' 
                        ? scenarios.find(s => s.id === selectedScenario)?.color || 'bg-wellness-primary'
                        : 'bg-coral'
                    }`}>
                      {message.sender === 'role' ? 
                        <User className="w-4 h-4 text-white" /> : 
                        <User className="w-4 h-4 text-white" />
                      }
                    </div>
                    <div className={`max-w-[80%] p-4 rounded-2xl ${
                      message.sender === 'user'
                        ? 'bg-wellness-primary text-white'
                        : 'bg-muted'
                    }`}>
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <span className="text-xs opacity-70 mt-2 block">
                        {message.timestamp.toLocaleTimeString('sv-SE', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <form onSubmit={handleSubmit} className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  placeholder="Skriv ditt svar här..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  variant="wellness" 
                  disabled={!inputValue.trim()}
                >
                  Skicka
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Kom ihåg: Detta är träning. Ta din tid och experimentera med olika sätt att kommunicera.
              </p>
            </form>
          </Card>
        </>
      )}
    </div>
  );
};

export default Roleplay;