import React from 'react';
import { useTranslation } from 'react-i18next';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  titleKey: string;
  descriptionKey: string;
  namespace?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  titleKey,
  descriptionKey,
  namespace = 'common',
  action
}) => {
  const { t } = useTranslation([namespace]);

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <Icon className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">{t(`${titleKey}`)}</h3>
      <p className="text-muted-foreground mb-4 max-w-sm">{t(`${descriptionKey}`)}</p>
      {action}
    </div>
  );
};