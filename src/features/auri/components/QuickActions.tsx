import React from 'react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Wind, Eye, BookOpen, CheckSquare } from 'lucide-react';

interface QuickActionsProps {
  onExerciseStart?: (exerciseType: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onExerciseStart }) => {
  const { t } = useTranslation('auri');
  const navigate = useNavigate();

  const actions = [
    {
      key: 'breathing',
      label: t('quickActions.breathing'),
      icon: Wind,
      onClick: () => onExerciseStart?.('breathing'),
      className: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
    },
    {
      key: 'grounding',
      label: t('quickActions.grounding'),
      icon: Eye,
      onClick: () => onExerciseStart?.('grounding'),
      className: 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200'
    },
    {
      key: 'journal',
      label: t('quickActions.journal'),
      icon: BookOpen,
      onClick: () => navigate('/journal'),
      className: 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200'
    },
    {
      key: 'tasks',
      label: t('quickActions.tasks'),
      icon: CheckSquare,
      onClick: () => navigate('/plan'),
      className: 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200'
    }
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {actions.map((action) => {
        const IconComponent = action.icon;
        return (
          <Button
            key={action.key}
            variant="outline"
            size="sm"
            onClick={action.onClick}
            className={`${action.className} hover:scale-105 transition-transform`}
          >
            <IconComponent className="w-4 h-4 mr-2" />
            {action.label}
          </Button>
        );
      })}
    </div>
  );
};