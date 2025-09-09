import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { MessageSquare, Play, AlertCircle } from "lucide-react";
import { getScenarioList } from "@/features/auri/roleplays/loadScenarios";

const NewRoleplay = () => {
  const { t, i18n } = useTranslation(['roleplay']);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  
  const scenarios = getScenarioList(i18n.language);

  if (!scenarios.length) {
    return <EmptyState 
      icon={AlertCircle}
      titleKey="noScripts" 
      descriptionKey="noScripts"
      namespace="roleplay"
    />;
  }

  const handleStartRoleplay = (scenarioId: string) => {
    console.log('Starting roleplay:', scenarioId);
    // TODO: Navigate to actual roleplay session
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <MessageSquare className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">{t('roleplay:title')}</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          {t('roleplay:subtitle')}
        </p>
      </div>

      {/* Scenario Selection */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {scenarios.map((scenario) => (
          <Card 
            key={scenario.id}
            className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group"
            onClick={() => handleStartRoleplay(scenario.id)}
          >
            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
            
            <h3 className="text-xl font-semibold mb-2">
              {scenario.title}
            </h3>
            
            <p className="text-muted-foreground mb-4">
              {scenario.description}
            </p>
            
            <Button variant="outline" className="w-full">
              <Play className="w-4 h-4 mr-2" />
              {t('roleplay:start')}
            </Button>
          </Card>
        ))}
      </div>

      {/* Info Card */}
      <Card className="p-6 bg-muted/50">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          Hur det fungerar
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Välj ett scenario att öva</li>
          <li>• AI-assistenten guidar dig genom övningen</li>
          <li>• Få feedback på din kommunikation</li>
          <li>• Öva i en trygg miljö</li>
        </ul>
      </Card>
    </div>
  );
};

export default NewRoleplay;