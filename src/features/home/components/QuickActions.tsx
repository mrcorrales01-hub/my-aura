import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Heart, BookOpen, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MoodQuickInput } from './MoodQuickInput';

export const QuickActions = () => {
  const { t } = useTranslation('home');
  const navigate = useNavigate();
  const [showMoodInput, setShowMoodInput] = useState(false);

  const actions = [
    {
      key: 'startAuri',
      label: t('home:tryNow'),
      icon: MessageCircle,
      onClick: () => navigate('/chat'),
      className: 'bg-primary hover:bg-primary/90 text-primary-foreground',
    },
    {
      key: 'logMood',
      label: t('quick.logMood'),
      icon: Heart,
      onClick: () => setShowMoodInput(true),
      className: 'bg-secondary hover:bg-secondary/90 text-secondary-foreground',
    },
    {
      key: 'newJournal',
      label: t('quick.newJournal'),
      icon: BookOpen,
      onClick: () => navigate('/journal'),
      className: 'bg-accent hover:bg-accent/90 text-accent-foreground',
    },
    {
      key: 'openPlan',
      label: t('quick.openPlan'),
      icon: CheckSquare,
      onClick: () => navigate('/plan'),
      className: 'bg-muted hover:bg-muted/90 text-muted-foreground',
    },
  ];

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.key}
                  onClick={action.onClick}
                  className={`flex flex-col h-20 ${action.className}`}
                  variant="default"
                  size="lg"
                  aria-label={action.label}
                >
                  <Icon className="h-5 w-5 mb-1" />
                  <span className="text-xs text-center leading-tight">
                    {action.label}
                  </span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <MoodQuickInput 
        open={showMoodInput} 
        onOpenChange={setShowMoodInput} 
      />
    </>
  );
};