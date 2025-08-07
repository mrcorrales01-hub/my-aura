import { AIChat } from '@/components/AIChat';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Heart, MessageCircle, Users } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

const Coach = () => {
  const { t } = useLanguage();

  const coachingAreas = [
    {
      icon: Heart,
      title: t('coach.emotional'),
      description: t('coach.emotionalDesc'),
      context: 'mood' as const
    },
    {
      icon: Users,
      title: t('coach.relationships'),
      description: t('coach.relationshipsDesc'),
      context: 'relationship' as const
    },
    {
      icon: MessageCircle,
      title: t('coach.communication'),
      description: t('coach.communicationDesc'),
      context: 'general' as const
    },
    {
      icon: Brain,
      title: t('coach.mindfulness'),
      description: t('coach.mindfulnessDesc'),
      context: 'general' as const
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {t('coach.title')} <span className="bg-gradient-primary bg-clip-text text-transparent">{t('coach.aiCoach')}</span>
          </h1>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
            {t('coach.subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Coaching Areas */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              {t('coach.specializations')}
            </h3>
            {coachingAreas.map((area, index) => {
              const IconComponent = area.icon;
              return (
                <Card key={index} className="hover:shadow-wellness transition-all duration-300">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="w-10 h-10 rounded-lg bg-wellness-primary/10 flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-wellness-primary" />
                      </div>
                      {area.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{area.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* AI Chat Interface */}
          <div className="lg:col-span-2">
            <AIChat
              context="general"
              title={t('coach.chatTitle')}
              description={t('coach.chatDescription')}
              placeholder={t('coach.placeholder')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Coach;