import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { requestPermission } from '@/features/reminders/scheduler';

interface Reminder {
  type: 'checkin' | 'exercise' | 'visit';
  enabled: boolean;
  localTime: string;
  weekdays: number[];
}

const WEEKDAYS = [1, 2, 3, 4, 5, 6, 7]; // Monday = 1, Sunday = 7
const WEEKDAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function RemindersPage() {
  const { t } = useTranslation(['common', 'reminders']);
  const [reminders, setReminders] = useState<Reminder[]>([
    { type: 'checkin', enabled: false, localTime: '09:00', weekdays: [1,2,3,4,5] },
    { type: 'exercise', enabled: false, localTime: '18:00', weekdays: [1,2,3,4,5,6,7] },
    { type: 'visit', enabled: false, localTime: '10:00', weekdays: [1,2,3,4,5] }
  ]);
  const [hasPermission, setHasPermission] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load from localStorage
    try {
      const saved = localStorage.getItem('aura.reminders');
      if (saved) {
        setReminders(JSON.parse(saved));
      }
    } catch {}

    // Check notification permission
    setHasPermission(Notification?.permission === 'granted');
  }, []);

  const updateReminder = (index: number, updates: Partial<Reminder>) => {
    setReminders(prev => prev.map((rem, i) => 
      i === index ? { ...rem, ...updates } : rem
    ));
  };

  const toggleWeekday = (reminderIndex: number, day: number) => {
    setReminders(prev => prev.map((rem, i) => {
      if (i !== reminderIndex) return rem;
      const weekdays = rem.weekdays.includes(day) 
        ? rem.weekdays.filter(d => d !== day)
        : [...rem.weekdays, day].sort();
      return { ...rem, weekdays };
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save locally (never throw)
      localStorage.setItem('aura.reminders', JSON.stringify(reminders));

      // Try Supabase upsert (safe)
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        for (const rem of reminders) {
          if (rem.enabled) {
            try {
              await supabase.from('reminders').upsert({
                user_id: session.user.id,
                type: rem.type,
                local_time: rem.localTime,
                weekdays: rem.weekdays,
                enabled: rem.enabled
              }, { onConflict: 'user_id,type' });
            } catch {}
          }
        }
      }
    } catch {}
    setSaving(false);
  };

  const handleRequestPermission = () => {
    const granted = requestPermission();
    setHasPermission(granted);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('reminders:title')}</h1>
        <p className="text-muted-foreground mt-1">
          Få påminnelser för dina mentala hälsorutiner
        </p>
      </div>

      {!hasPermission && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm">Aktivera notiser för påminnelser</p>
              <Button size="sm" onClick={handleRequestPermission}>
                {t('reminders:enable')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {reminders.map((reminder, index) => (
        <Card key={reminder.type}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {t(`reminders:${reminder.type === 'checkin' ? 'dailyCheckin' : reminder.type}`)}
              </CardTitle>
              <Switch
                checked={reminder.enabled && hasPermission}
                onCheckedChange={(enabled) => updateReminder(index, { enabled })}
                disabled={!hasPermission}
              />
            </div>
          </CardHeader>
          
          {reminder.enabled && hasPermission && (
            <CardContent className="space-y-4">
              <div>
                <Label>{t('reminders:time')}</Label>
                <Input
                  type="time"
                  value={reminder.localTime}
                  onChange={(e) => updateReminder(index, { localTime: e.target.value })}
                  className="w-32"
                />
              </div>

              <div>
                <Label className="mb-2 block">{t('reminders:days')}</Label>
                <div className="flex gap-1">
                  {WEEKDAYS.map((day, i) => (
                    <Badge
                      key={day}
                      variant={reminder.weekdays.includes(day) ? "default" : "outline"}
                      className="cursor-pointer px-2 py-1"
                      onClick={() => toggleWeekday(index, day)}
                    >
                      {WEEKDAY_LABELS[i]}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      ))}

      <Button 
        onClick={handleSave} 
        disabled={saving || !hasPermission}
        className="w-full"
      >
        {saving ? 'Sparar...' : t('reminders:saved')}
      </Button>
    </div>
  );
}