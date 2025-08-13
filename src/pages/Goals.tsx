import { useI18n } from '@/hooks/useI18n';

export default function Goals() {
  const { t } = useI18n();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{t('nav.goals')}</h1>
      <p>Goals and habits tracking coming soon...</p>
    </div>
  );
}