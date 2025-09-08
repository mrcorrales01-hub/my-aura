import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Loader2 } from 'lucide-react';

interface HealthStatus {
  status: 'ok' | 'warn' | 'error';
  hasOpenAIKey: boolean;
  message: string;
}

export const HeaderStatusBadge = () => {
  const { t } = useTranslation(['common']);
  const navigate = useNavigate();
  const [status, setStatus] = useState<HealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkHealth = async () => {
    setIsLoading(true);
    try {
      const [chatResponse, roleplayResponse] = await Promise.all([
        fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auri-chat?mode=health`),
        fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auri-roleplay?mode=health`)
      ]);

      const chatHealth = chatResponse.ok ? await chatResponse.json() : null;
      const roleplayHealth = roleplayResponse.ok ? await roleplayResponse.json() : null;

      if (!chatHealth || !roleplayHealth) {
        setStatus({ status: 'error', hasOpenAIKey: false, message: t('common.healthError') });
        return;
      }

      const bothHaveKeys = chatHealth.hasOpenAIKey && roleplayHealth.hasOpenAIKey;
      const bothOk = chatResponse.ok && roleplayResponse.ok;

      if (bothOk && bothHaveKeys) {
        setStatus({ status: 'ok', hasOpenAIKey: true, message: t('common.healthOk') });
      } else if (bothOk && !bothHaveKeys) {
        setStatus({ status: 'warn', hasOpenAIKey: false, message: t('common.healthDemo') });
      } else {
        setStatus({ status: 'error', hasOpenAIKey: false, message: t('common.healthError') });
      }
    } catch (error) {
      setStatus({ status: 'error', hasOpenAIKey: false, message: t('common.healthError') });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const handleClick = () => {
    navigate('/health');
  };

  const getStatusColor = () => {
    if (!status) return 'secondary';
    switch (status.status) {
      case 'ok': return 'default';
      case 'warn': return 'secondary';
      case 'error': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusDot = () => {
    if (isLoading) return <Loader2 className="h-2 w-2 animate-spin" />;
    if (!status) return <div className="h-2 w-2 rounded-full bg-muted" />;
    
    switch (status.status) {
      case 'ok': return <div className="h-2 w-2 rounded-full bg-green-500" />;
      case 'warn': return <div className="h-2 w-2 rounded-full bg-yellow-500" />;
      case 'error': return <div className="h-2 w-2 rounded-full bg-red-500" />;
      default: return <div className="h-2 w-2 rounded-full bg-muted" />;
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant={getStatusColor()} 
            className="cursor-pointer hover:opacity-80 flex items-center gap-1"
            onClick={handleClick}
            aria-label={t('common.systemHealth')}
          >
            {getStatusDot()}
            <span className="sr-only">{status?.message || t('common.loading')}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{status?.message || t('common.loading')}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};