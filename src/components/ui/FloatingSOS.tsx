import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function FloatingSOS() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('crisis');
  
  // Hide on crisis pages to avoid redundancy
  if (location.pathname.startsWith('/crisis')) {
    return null;
  }
  
  return (
    <Button
      onClick={() => navigate('/crisis')}
      className="fixed bottom-20 right-4 z-50 bg-red-600 hover:bg-red-700 text-white shadow-lg rounded-full w-14 h-14 md:bottom-6"
      aria-label={t('sos')}
    >
      <AlertTriangle className="h-6 w-6" />
    </Button>
  );
}