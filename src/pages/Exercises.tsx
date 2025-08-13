import { useI18n } from '@/hooks/useI18n';

export default function Exercises() {
  const { t } = useI18n();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{t('nav.exercises')}</h1>
      <p>CBT/DBT/ACT exercises coming soon...</p>
    </div>
  );
}