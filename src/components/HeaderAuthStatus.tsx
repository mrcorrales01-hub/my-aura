import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldAlert, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/contexts/AuthContext';

export const HeaderAuthStatus = () => {
  const { t } = useTranslation(['common', 'auth']);
  const { user, loading } = useAuthContext();

  if (loading) {
    return null;
  }

  if (!user) {
    return (
      <div 
        className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm bg-card"
        aria-live="polite"
      >
        <ShieldAlert className="h-4 w-4 text-orange-500" />
        <span className="text-muted-foreground">
          {t('common:authStatus.loggedOut')}
        </span>
        <Button asChild size="sm" variant="ghost" className="h-6 px-2 text-xs">
          <Link to="/auth">
            {t('auth:signin')}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div 
      className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm bg-card"
      aria-live="polite"
    >
      <div className="h-2 w-2 rounded-full bg-green-500"></div>
      <span className="text-muted-foreground">
        {t('common:authStatus.loggedIn')}
      </span>
      <User className="h-4 w-4 text-muted-foreground" />
    </div>
  );
};