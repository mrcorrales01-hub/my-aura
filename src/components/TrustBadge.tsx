import React from 'react';
import { Shield, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface TrustBadgeProps {
  variant?: 'header' | 'chat';
  className?: string;
}

export const TrustBadge: React.FC<TrustBadgeProps> = ({ 
  variant = 'header',
  className = ''
}) => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/settings');
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClick}
            className={`flex items-center space-x-2 text-xs text-muted-foreground hover:text-foreground transition-colors ${className}`}
          >
            <Shield className="w-4 h-4 text-green-600" />
            <span className={variant === 'header' ? 'hidden sm:inline' : ''}>
              {t('trust.secure')}
            </span>
            <ExternalLink className="w-3 h-3" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium">{t('trust.title')}</p>
            <p className="text-xs">{t('trust.description')}</p>
            <p className="text-xs text-muted-foreground">{t('trust.actions')}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};