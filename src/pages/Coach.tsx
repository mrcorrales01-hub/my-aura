import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Heart, MessageCircle, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const Coach = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hej! Jag är din AI-coach. Jag är här för att hjälpa dig med relationer, känslor och kommunikation. Vad skulle du vilja prata om idag?',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [relationshipStatus, setRelationshipStatus] = useState<'single' | 'relationship' | 'separated'>('single');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const quickTopics = [
    "Jag har svårt att kommunicera mina känslor",
    "Vi grälar ofta, vad kan jag göra?",
    "Jag känner mig ensam i min relation",
    "Hur sätter jag gränser?",
    "Jag har låg självkänsla",
    "Hur bygger man tillit?"
  ];

  const statusLabels = {
    single: 'Singel',
    relationship: 'I förhållande',
    separated: 'Separerad'
  };

  const getAIResponse = (userMessage: string, status: string): string => {
    const responses = {
      communication: [
        "Det låter som kommunikation är utmanande för dig. Ett bra första steg är att använda 'jag-meddelanden' istället för 'du-meddelanden'. Istället för 'Du lyssnar aldrig' prova 'Jag känner mig inte hörd när...'",
        "Kommunikation handlar mycket om timing. Välj ett lugnt ögonblick när ni båda är närvarande. Börja med att säga något positivt först."
      ],
      conflict: [
        "Konflikter är normala i alla relationer. Det viktiga är hur vi hanterar dem. Prova att ta en paus när känslorna blir för starka och återkom när ni känner er lugnare.",
        "När ni grälar, fokusera på det specifika problemet istället för att ta upp gamla saker. Lyssna för att förstå, inte för att ha rätt."
      ],
      loneliness: [
        "Att känna sig ensam i en relation är smärtsamt. Det kan hjälpa att vara ärlig om dina behov. Säg till exempel: 'Jag skulle uppskatta mer kvalitetstid tillsammans'.",
        "Ibland behöver vi skapa intimitet genom små steg. Börja med 10 minuter telefonfri tid tillsammans varje dag."
      ],
      boundaries: [
        "Gränser är inte väggar - de är broar till bättre relationer. Börja med att identifiera vad som får dig att känna dig obekväm.",
        "Sätta gränser är en färdighet. Prova: 'Jag känner mig inte bekväm med det, kan vi hitta en annan lösning?'"
      ],
      selfesteem: [
        "Självkänsla byggs en dag i taget. Börja med att notera tre saker du är stolt över varje dag, även små saker.",
        "Du är värdefull precis som du är. Självkänsla kommer från att behandla dig själv med samma vänlighet som du visar andra."
      ],
      trust: [
        "Tillit byggs genom små, konsekventa handlingar över tid. Gör det du säger att du ska göra, även i små saker.",
        "Tillit handlar om transparens. Dela dina tankar och känslor öppet, och be din partner göra detsamma."
      ]
    };

    // Simple keyword matching for demo
    const lowerMessage = userMessage.toLowerCase();
    if (lowerMessage.includes('kommunicer') || lowerMessage.includes('prata') || lowerMessage.includes('säga')) {
      return responses.communication[Math.floor(Math.random() * responses.communication.length)];
    } else if (lowerMessage.includes('gräl') || lowerMessage.includes('konflik') || lowerMessage.includes('bråk')) {
      return responses.conflict[Math.floor(Math.random() * responses.conflict.length)];
    } else if (lowerMessage.includes('ensam') || lowerMessage.includes('skap')) {
      return responses.loneliness[Math.floor(Math.random() * responses.loneliness.length)];
    } else if (lowerMessage.includes('gräns') || lowerMessage.includes('nej')) {
      return responses.boundaries[Math.floor(Math.random() * responses.boundaries.length)];
    } else if (lowerMessage.includes('självkänsla') || lowerMessage.includes('värdelös') || lowerMessage.includes('dålig')) {
      return responses.selfesteem[Math.floor(Math.random() * responses.selfesteem.length)];
    } else if (lowerMessage.includes('tillit') || lowerMessage.includes('lita')) {
      return responses.trust[Math.floor(Math.random() * responses.trust.length)];
    }
    
    return `Tack för att du delar det med mig. Som ${statusLabels[status].toLowerCase()} kan det vara extra viktigt att fokusera på din egen välmående. Kan du berätta mer om vad som känns svårast just nu?`;
  };

  const sendMessage = (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI typing delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: getAIResponse(content, relationshipStatus),
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 h-[calc(100vh-2rem)] flex flex-col">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <MessageCircle className="w-8 h-8 text-wellness-primary" />
          <h1 className="text-3xl font-bold text-foreground">AI-Coach</h1>
        </div>
        <p className="text-lg text-foreground/70">
          Din personliga coach för relationer och känslor
        </p>
      </div>

      {/* Relationship Status */}
      <Card className="p-4 mb-6 bg-card/90">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-sm font-medium">Din relationsstatus:</span>
          <div className="flex gap-2">
            {(Object.keys(statusLabels) as Array<keyof typeof statusLabels>).map((status) => (
              <Button
                key={status}
                variant={relationshipStatus === status ? "wellness" : "outline"}
                size="sm"
                onClick={() => setRelationshipStatus(status)}
              >
                {statusLabels[status]}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col bg-card/90 backdrop-blur-sm">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <Bot className="w-5 h-5 text-wellness-primary" />
          <span className="font-medium">Aura Coach</span>
          <Badge variant="secondary" className="ml-auto">
            Online
          </Badge>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.sender === 'ai' 
                    ? 'bg-wellness-primary text-white' 
                    : 'bg-coral text-white'
                }`}>
                  {message.sender === 'ai' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                <div className={`max-w-[80%] p-4 rounded-2xl ${
                  message.sender === 'user'
                    ? 'bg-wellness-primary text-white ml-auto'
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
            
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-wellness-primary flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-muted p-4 rounded-2xl">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-wellness-primary rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-wellness-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-wellness-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Quick Topics */}
        <div className="p-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-3">Vanliga ämnen att prata om:</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {quickTopics.slice(0, 3).map((topic, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => sendMessage(topic)}
                className="text-xs h-8"
              >
                {topic}
              </Button>
            ))}
          </div>
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              placeholder="Skriv ditt meddelande här..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1"
            />
            <Button 
              type="submit" 
              variant="wellness" 
              size="icon"
              disabled={!inputValue.trim() || isTyping}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Coach;