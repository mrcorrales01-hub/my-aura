import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users } from 'lucide-react';

const VisitPractice = () => {
  const { t } = useTranslation(['visit', 'roleplay', 'common']);
  const navigate = useNavigate();

  const visitScenarios = [
    {
      id: 'sayHardThing',
      title: t('roleplay:sayHardThing'),
      description: 'Practice communicating difficult feelings or symptoms to your doctor'
    },
    {
      id: 'adjustMedication', 
      title: t('roleplay:adjustMedication'),
      description: 'Discuss medication changes with your healthcare provider'
    },
    {
      id: 'makeMostOf12Min',
      title: t('roleplay:makeMostOf12Min'),
      description: 'Maximize your time in a short doctor visit'
    }
  ];

  return (
    <div className="container max-w-2xl mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/visit')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6" />
          {t('visit:practiceVisit')}
        </h1>
      </div>

      <div className="text-center">
        <p className="text-muted-foreground">
          {t('roleplay:subtitle')}
        </p>
      </div>

      <div className="space-y-4">
        {visitScenarios.map((scenario) => (
          <Card key={scenario.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>{scenario.title}</CardTitle>
              <CardDescription>{scenario.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate(`/roleplay/${scenario.id}`)}
                className="w-full"
              >
                Start Practice
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default VisitPractice;