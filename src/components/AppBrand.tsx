import { useTranslation } from 'react-i18next';

export default function AppBrand() {
  const { t } = useTranslation('common');
  // Failsafe: if i18n is not ready, show "My Aura", NEVER "appName"
  const name = t('appName') || 'My Aura';
  return <span className="font-semibold tracking-tight">{name}</span>;
}