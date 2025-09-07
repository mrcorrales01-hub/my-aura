import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Phone, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const CrisisCard = () => {
  const { t } = useTranslation('home');
  const navigate = useNavigate();

  return (
    <Card className="border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-red-700 dark:text-red-400 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          {t('crisis.title')}
        </CardTitle>
        <CardDescription className="text-red-600/80 dark:text-red-400/80 text-xs">
          {t('crisis.disclaimer')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={() => navigate('/crisis')}
          className="w-full bg-red-600 hover:bg-red-700 text-white gap-2"
          size="sm"
        >
          <Phone className="h-4 w-4" />
          {t('crisis.cta')}
        </Button>
      </CardContent>
    </Card>
  );
};