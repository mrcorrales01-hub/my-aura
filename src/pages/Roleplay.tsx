import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Heart, User, Play, RotateCcw, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user } = useAuth();

  const scenarios = [
    {
      id: 'partner',
      title: t('roleplay.partner.title'),
      description: t('roleplay.partner.description'),
      roleDescription: t('roleplay.partner.role'),
      color: 'bg-coral'
    },
    {
      id: 'parent',
      title: t('roleplay.parent.title'),
      description: t('roleplay.parent.description'),
      roleDescription: t('roleplay.parent.role'),
      color: 'bg-calm'
    },
    {
      id: 'boss',
      title: t('roleplay.boss.title'),
      description: t('roleplay.boss.description'),
      roleDescription: t('roleplay.boss.role'),
      color: 'bg-wellness-primary'
    },
    {
      id: 'friend',
      title: t('roleplay.friend.title'),
      description: t('roleplay.friend.description'),
      roleDescription: t('roleplay.friend.role'),
      color: 'bg-lavender'
    }
  ];

  const getAIRoleResponse = async (userMessage: string, scenarioId: string): Promise<string> => {
    if (!user) return "Please sign in to use AI roleplay.";
    
    try {
      const scenario = scenarios.find(s => s.id === scenarioId);
      const { data, error } = await supabase.functions.invoke('ai-coach', {
        body: {
          message: userMessage,
          context: 'roleplay',
          scenario: {
            role: scenario?.roleDescription,
            type: scenarioId
          }
        }
      });

      if (error) throw error;
      return data.response || "I'm sorry, I couldn't process that. Can you try again?";
    } catch (error) {
      console.error('Error getting AI response:', error);
      return "I'm having trouble responding right now. Please try again.";
    }
  };

  const startRoleplay = (scenarioId: string) => {
    setSelectedScenario(scenarioId);
    setIsActive(true);
    setMessages([]);
    
    const scenario = scenarios.find(s => s.id === scenarioId);
    const welcomeMessage: RoleplayMessage = {
      id: '1',
      content: `${t('common.hello')}! ${scenario?.roleDescription}. ${t('roleplay.startedDesc')}`,
      sender: 'role',
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
    
    toast({
      title: t('roleplay.started'),
      description: t('roleplay.startedDesc'),
    });
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || !isActive || isLoading) return;

    const userMessage: RoleplayMessage = {
      id: Date.now().toString(),
      content: content.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const aiResponse = await getAIRoleResponse(content, selectedScenario || 'partner');
      
      const roleResponse: RoleplayMessage = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'role',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, roleResponse]);
    } catch (error) {
      console.error('Error in roleplay:', error);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
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
          <h1 className="text-3xl font-bold text-foreground">{t('roleplay.title')}</h1>
        </div>
        <p className="text-lg text-foreground/70">
          {t('roleplay.subtitle')}
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
                  {t('roleplay.startRoleplay')}
                </Button>
              </Card>
            ))}
          </div>

          {/* Info Card */}
          <Card className="p-6 bg-wellness-primary/5 border-wellness-primary/20">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-wellness-primary" />
              {t('roleplay.howItWorks')}
            </h3>
            <ul className="space-y-2 text-sm text-foreground/80">
              <li>{t('roleplay.instructions.ai')}</li>
              <li>{t('roleplay.instructions.practice')}</li>
              <li>{t('roleplay.instructions.experiment')}</li>
              <li>{t('roleplay.instructions.safe')}</li>
              <li>{t('roleplay.instructions.stop')}</li>
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
                    {t('roleplay.active')}
                  </Badge>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={resetRoleplay}>
                <RotateCcw className="w-4 h-4 mr-2" />
                {t('roleplay.end')}
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
                  placeholder={t('roleplay.placeholder')}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button 
                  type="submit" 
                  variant="wellness" 
                  disabled={!inputValue.trim() || isLoading}
                >
                  {isLoading ? "..." : t('roleplay.send')}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {t('roleplay.reminder')}
              </p>
            </form>
          </Card>
        </>
      )}
    </div>
  );
};

export default Roleplay;