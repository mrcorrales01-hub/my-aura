import { useI18n } from '@/hooks/useI18n';

export default function Relationships() {
  const { t } = useI18n();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{t('nav.relationships')}</h1>
      <p>Relationship coaching tools coming soon...</p>
    </div>
  );
}