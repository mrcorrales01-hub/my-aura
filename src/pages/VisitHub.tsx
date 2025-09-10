import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Stethoscope, FileText, Users, CheckSquare } from 'lucide-react';
import { SymptomLogCard } from '@/components/SymptomLogCard';

const VisitHub = () => {
  const { t } = useTranslation(['visit', 'common']);
  const navigate = useNavigate();

  const features = [
    {
      icon: FileText,
      title: t('visit:prepareVisit'),
      description: 'Create questions and prepare for your appointment',
      path: '/visit/prepare'
    },
    {
      icon: Users,
      title: t('visit:practiceVisit'),
      description: 'Practice difficult conversations',
      path: '/visit/practice'
    },
    {
      icon: CheckSquare,
      title: t('visit:afterVisit'),
      description: 'Track actions and follow-ups',
      path: '/visit/after'
    }
  ];

  return (
    <div className="container max-w-4xl mx-auto py-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Stethoscope className="h-8 w-8" />
          {t('visit:visitHub')}
        </h1>
        <p className="text-muted-foreground">
          Prepare, practice, and follow up on your doctor visits
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <SymptomLogCard />
        
        <div className="space-y-4">
          {features.map((feature) => (
            <Card key={feature.path} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <feature.icon className="h-5 w-5" />
                  {feature.title}
                </CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => navigate(feature.path)}
                  className="w-full"
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VisitHub;