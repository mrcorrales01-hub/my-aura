import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { useMoodTracking } from '@/hooks/useMoodTracking';
import { Button } from '@/components/ui/button';
import { Settings, X } from 'lucide-react';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar
} from 'recharts';

const formatDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

const moodLabel = (v: number) => {
  if (v >= 5) return 'Amazing';
  if (v === 4) return 'Great';
  if (v === 3) return 'Good';
  if (v === 2) return 'Low';
  return 'Difficult';
};

const Dashboard = () => {
  const { getMoodHistory } = useMoodTracking();
  const [monthData, setMonthData] = useState<any[]>([]);
  const [weekData, setWeekData] = useState<any[]>([]);
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    document.title = 'Aura Dashboard – Mood Insights';
    const load = async () => {
      const last30 = await getMoodHistory(30);
      const last7 = await getMoodHistory(7);

      const mData = [...last30].reverse().map(e => ({
        date: formatDate(e.created_at),
        mood: e.mood_value
      }));
      const wData = [...last7].reverse().map(e => ({
        date: formatDate(e.created_at),
        mood: e.mood_value
      }));

      setMonthData(mData);
      setWeekData(wData);

      // Simple insights
      const byDow: Record<number, number[]> = {};
      last30.forEach(e => {
        const d = new Date(e.created_at).getDay();
        byDow[d] = byDow[d] || [];
        byDow[d].push(e.mood_value);
      });
      const averages = Object.entries(byDow).map(([d, arr]) => ({
        dow: Number(d),
        avg: arr.reduce((a, b) => a + b, 0) / arr.length
      }));
      const minDay = averages.sort((a, b) => a.avg - b.avg)[0];
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      const last3 = last30.slice(0, 3);
      const streak = last3.length === 3 && last3.every(e => e.mood_value <= 2);

      const newInsights: string[] = [];
      if (minDay) newInsights.push(`Your lowest average mood recently is on ${dayNames[minDay.dow]}. Consider extra support that day.`);
      if (streak) newInsights.push("You've reported low moods 3 days in a row — try a grounding practice or a short walk.");
      if (!newInsights.length) newInsights.push('Great consistency! Keep checking in to unlock deeper patterns.');
      setInsights(newInsights);
    };
    load();
  }, []);

  return (
    <main>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Emotional Dashboard</h1>
        <p className="text-muted-foreground">Trends and insights from your recent check-ins</p>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-4 lg:col-span-2">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Last 30 Days</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthData} margin={{ left: 4, right: 8, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis domain={[1, 5]} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: any) => [moodLabel(Number(v)), 'Mood']} />
                <Line type="monotone" dataKey="mood" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Weekly Snapshot</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekData}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis domain={[1, 5]} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: any) => [moodLabel(Number(v)), 'Mood']} />
                <Bar dataKey="mood" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <Card className="p-4 lg:col-span-2">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Personal Insights</h2>
          <ul className="space-y-2 text-sm text-foreground/80 list-disc pl-5">
            {insights.map((i, idx) => (
              <li key={idx}>{i}</li>
            ))}
          </ul>
        </Card>

        <TipsCard />
      </section>
    </main>
  );
};

const TipsCard = () => (
  <Card className="p-4">
    <h2 className="text-sm font-medium text-muted-foreground mb-3">Suggested Practices</h2>
    <div className="space-y-2">
      <Tip title="2-minute breathing" desc="Inhale 4 – hold 4 – exhale 6, repeat 4 times." />
      <Tip title="Name it to tame it" desc="Write one sentence naming the strongest feeling right now." />
      <Tip title="Gratitude check" desc="List 3 small things you appreciated today." />
    </div>
  </Card>
);

const Tip = ({ title, desc }: { title: string; desc: string }) => (
  <div className="rounded-md border border-border p-3">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Button size="sm" variant="secondary">Try</Button>
    </div>
  </div>
);

export default Dashboard;
