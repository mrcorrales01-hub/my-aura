import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Loader2, Database, Trash2 } from 'lucide-react';
import { seedDemoData, resetUserData } from '@/services/demo';

export const DemoControls = () => {
  const { t } = useTranslation('common');
  const [isSeeding, setIsSeeding] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleSeedDemo = async () => {
    setIsSeeding(true);
    try {
      const result = await seedDemoData();
      if (result.ok) {
        toast.success(t('demo.seedSuccess'), {
          description: `${t('demo.created')}: ${result.created.profiles} profiles, ${result.created.moods} moods, ${result.created.journals} journals, ${result.created.exercises} exercises`
        });
      }
    } catch (error) {
      console.error('Seed demo error:', error);
      toast.error(t('demo.seedError'));
    } finally {
      setIsSeeding(false);
    }
  };

  const handleResetData = async () => {
    setIsResetting(true);
    try {
      const result = await resetUserData();
      if (result.ok) {
        const totalDeleted = Object.values(result.deleted).reduce((sum, count) => sum + count, 0);
        toast.success(t('demo.resetSuccess'), {
          description: `${t('demo.deleted')}: ${totalDeleted} ${t('demo.records')}`
        });
      }
    } catch (error) {
      console.error('Reset data error:', error);
      toast.error(t('demo.resetError'));
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          {t('demo.title')}
        </CardTitle>
        <CardDescription>
          {t('demo.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={handleSeedDemo} 
            disabled={isSeeding}
            className="flex items-center gap-2"
          >
            {isSeeding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Database className="h-4 w-4" />
            )}
            {t('demo.seedButton')}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                disabled={isResetting}
                className="flex items-center gap-2"
              >
                {isResetting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                {t('demo.resetButton')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('demo.resetConfirmTitle')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('demo.resetConfirmDescription')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={handleResetData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {t('demo.resetConfirm')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="text-sm text-muted-foreground space-y-1">
          <p><strong>{t('demo.seedIncludes')}:</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>{t('demo.seedItem1')}</li>
            <li>{t('demo.seedItem2')}</li>
            <li>{t('demo.seedItem3')}</li>
            <li>{t('demo.seedItem4')}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};