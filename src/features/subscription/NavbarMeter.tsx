import { getPlanLocal, PLAN_LIMITS, getUsageToday } from '@/features/subscription/plan';
import { useTranslation } from 'react-i18next';

export default function NavbarMeter() {
  const { t } = useTranslation('meter');
  const plan = getPlanLocal();
  const used = getUsageToday().auri || 0;
  const max = PLAN_LIMITS[plan].auriDaily;
  const left = Math.max(0, max - used);

  return (
    <div className="ml-auto text-[11px] px-2 py-1 rounded-full border bg-white/70 backdrop-blur">
      {t('plan')}: {plan.toUpperCase()} • Auri {used}/{max} • {t('left')} {left}
    </div>
  );
}