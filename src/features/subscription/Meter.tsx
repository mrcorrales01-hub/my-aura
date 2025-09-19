import { usageLeft, getPlanLocal, PLAN_LIMITS, getUsageToday } from './plan';
import { useTranslation } from 'react-i18next';

export default function AuriMeter() {
  const { t } = useTranslation('reminders');
  const plan = getPlanLocal();
  const used = getUsageToday().auri || 0;
  const max = PLAN_LIMITS[plan].auriDaily;
  const left = Math.max(0, max - used);

  if (max >= 9999) return null; // Hide for pro users

  const percentage = Math.min((used / max) * 100, 100);
  
  return (
    <div className="mt-2 text-xs text-muted-foreground">
      <div className="flex items-center gap-2">
        <span>{t('meter.auri', { used, max, left })}</span>
        <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}