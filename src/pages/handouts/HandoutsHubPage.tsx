import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Moon, Heart, Battery, FileText } from 'lucide-react';

const HandoutsHubPage = () => {
  const { t } = useTranslation('handouts');
  const navigate = useNavigate();

  const templates = [
    {
      slug: 'sleep',
      title: t('sleep'),
      description: 'Kvällsrutiner och sömnmiljö för bättre vila',
      icon: Moon,
      color: 'bg-blue-500'
    },
    {
      slug: 'anxiety',
      title: t('anxiety'),
      description: 'Akuta verktyg och vardagsstrategier för ångest',
      icon: Heart,
      color: 'bg-red-500'
    },
    {
      slug: 'activation',
      title: t('activation'),
      description: 'Små steg och belöningssystem vid nedstämdhet',
      icon: Battery,
      color: 'bg-green-500'
    },
    {
      slug: 'custom',
      title: t('custom'),
      description: 'Skapa din egen handout från grunden',
      icon: FileText,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {templates.map((template) => (
          <Card 
            key={template.slug}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(`/handouts/${template.slug}`)}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-lg ${template.color} flex items-center justify-center`}>
                  <template.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-lg">{template.title}</div>
                  <div className="text-sm font-normal text-muted-foreground">
                    {template.description}
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                {t('build')}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HandoutsHubPage;