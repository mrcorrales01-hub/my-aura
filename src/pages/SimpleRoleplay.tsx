import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Users } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import { listFor, SCENARIOS } from '@/features/auri/roleplays/scenarios';

export default function SimpleRoleplay() {
  const { i18n, t } = useTranslation(['roleplay', 'common']);
  const navigate = useNavigate();
  
  const scenarios = listFor(i18n.language);

  if (scenarios.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <EmptyState 
          icon={Users}
          titleKey="noScripts"
          descriptionKey="noScripts"
          namespace="roleplay"
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl pb-24">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Users className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">{t('title')}</h1>
        </div>
        <p className="text-muted-foreground">{t('subtitle', 'Safe, guided exercises')}</p>
      </div>

      <div className="space-y-4">
        {scenarios.map((item) => (
          <Card key={item.id} className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                </div>
                
                <p className="text-muted-foreground mb-3">
                  {item.scenario.steps.length} steps practice scenario
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {item.scenario.steps.map((_, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      Step {idx + 1}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <Button 
                onClick={() => navigate(`/roleplay/${item.id}`)}
                size="sm"
                className="ml-4"
              >
                <Play className="w-4 h-4 mr-2" />
                {t('start')}
              </Button>
            </div>
          </Card>
        ))}
      </div>
      
      <Card className="p-6 mt-8 bg-muted/30">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          How it works
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Choose a scenario to practice</li>
          <li>• Follow step-by-step guidance</li>
          <li>• Build confidence in real situations</li>
          <li>• Practice at your own pace</li>
        </ul>
      </Card>
    </div>
  );
}