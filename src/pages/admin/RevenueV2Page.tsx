import { useEffect, useMemo, useState } from 'react';
import { fetchSubs, fetchDaily, computeKPIs, fmtMoney } from '@/features/revenue/service';
import { useTranslation } from 'react-i18next';

export default function RevenueV2Page() {
  const { t } = useTranslation('admin');
  const [subs, setSubs] = useState<any[]>([]);
  const [days, setDays] = useState<any[]>([]);
  const [ts, setTs] = useState<string>('');

  useEffect(() => {
    (async () => {
      const [a, b] = await Promise.all([fetchSubs(), fetchDaily()]);
      setSubs(a); 
      setDays(b); 
      setTs(new Date().toISOString());
    })();
  }, []);

  const kpi = useMemo(() => computeKPIs(subs, days), [subs, days]);
  const hasPrices = (Number(import.meta.env.VITE_PRICE_PLUS_CENTS || 0) > 0) && (Number(import.meta.env.VITE_PRICE_PRO_CENTS || 0) > 0);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">{t('revenue')}</h1>

      {!hasPrices && <div className="text-xs text-amber-700">{t('noPriceEnv')}</div>}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label={t('active')} value={kpi.counts.total} />
        <Stat label={t('plus')} value={kpi.counts.plus} />
        <Stat label={t('pro')} value={kpi.counts.pro} />
        <Stat label={t('free')} value={kpi.counts.free} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat label={t('mrr')} value={hasPrices ? fmtMoney(kpi.money.mrrCents, kpi.money.currency) : '—'} />
        <Stat label={t('arr')} value={hasPrices ? fmtMoney(kpi.money.arrCents, kpi.money.currency) : '—'} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Panel title="7d" newN={kpi.win7.newN} churnN={kpi.win7.churnN} rate={kpi.win7.churnRate} />
        <Panel title="28d" newN={kpi.win28.newN} churnN={kpi.win28.churnN} rate={kpi.win28.churnRate} />
        <Panel title="90d" newN={kpi.win90.newN} churnN={kpi.win90.churnN} rate={kpi.win90.churnRate} />
      </div>

      <CsvButtons subs={subs} days={days} currency={kpi.money.currency} />

      <div className="text-xs opacity-60">
        {t('currency')}: {kpi.money.currency} • {t('updated')}: {ts && new Date(ts).toLocaleString()}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-xl border p-4">
      <div className="text-xs opacity-60">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}

function Panel({ title, newN, churnN, rate }: { title: string; newN: number; churnN: number; rate: number }) {
  return (
    <div className="rounded-xl border p-4 space-y-1">
      <div className="text-sm font-medium">{title}</div>
      <div className="text-sm">+{newN} / −{churnN}</div>
      <div className="text-xs opacity-60">Churn: {(rate * 100).toFixed(1)}%</div>
    </div>
  );
}

function CsvButtons({ subs, days, currency }: { subs: any[]; days: any[]; currency: string }) {
  const makeCsv = (rows: any[], headers: string[]) => {
    const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    return [headers.join(','), ...rows.map(r => headers.map(h => esc((r as any)[h])).join(','))].join('\n');
  };

  const download = (name: string, content: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportSubs = () => {
    const rows = subs.map(s => ({
      subscribed: s.subscribed,
      tier: s.subscription_tier,
      created_at: s.created_at,
      updated_at: s.updated_at
    }));
    download('subscribers.csv', makeCsv(rows, ['subscribed', 'tier', 'created_at', 'updated_at']));
  };

  const exportDays = () => {
    download('payment_analytics.csv', makeCsv(days, ['date', 'total_revenue_cents', 'subscription_revenue_cents', 'new_subscribers', 'churned_subscribers']));
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button className="px-3 py-2 rounded border bg-white" onClick={exportSubs}>
        Export subscribers
      </button>
      <button className="px-3 py-2 rounded border bg-white" onClick={exportDays}>
        Export daily
      </button>
    </div>
  );
}