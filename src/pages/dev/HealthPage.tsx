import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { callEdge } from '@/lib/edge';

type Item = { 
  name: string; 
  status: 'ok' | 'warn' | 'fail'; 
  message: string; 
  details?: string;
};

export default function HealthPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const out: Item[] = [];
      
      // 1) i18n
      try {
        const langs = ['sv', 'en', 'es', 'no', 'da', 'fi'];
        const current = localStorage.getItem('i18nextLng') || 'sv';
        const ok = langs.includes(current);
        out.push({ 
          name: 'i18n', 
          status: ok ? 'ok' : 'warn', 
          message: ok ? `Aktivt språk: ${current}` : `Språk utanför listan: ${current}`,
          details: `Loaded: ${langs.join(', ')}`
        });
      } catch (e: any) { 
        out.push({ 
          name: 'i18n', 
          status: 'fail', 
          message: 'i18n fel', 
          details: String(e) 
        });
      }

      // 2) ENV
      try {
        const url = import.meta.env.VITE_SUPABASE_URL;
        const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;
        if (url && anon) {
          out.push({ 
            name: 'env', 
            status: 'ok', 
            message: 'Supabase env hittad' 
          });
        } else {
          out.push({ 
            name: 'env', 
            status: 'fail', 
            message: 'Saknar VITE_SUPABASE_URL eller VITE_SUPABASE_ANON_KEY' 
          });
        }
      } catch (e: any) { 
        out.push({ 
          name: 'env', 
          status: 'fail', 
          message: 'ENV fel', 
          details: String(e) 
        });
      }

      // 3) Supabase ping
      try {
        const { data, error } = await supabase.from('exercises').select('id').limit(1);
        if (!error) {
          out.push({ 
            name: 'supabase', 
            status: 'ok', 
            message: 'DB anslutning OK' 
          });
        } else {
          out.push({ 
            name: 'supabase', 
            status: 'fail', 
            message: 'DB fel', 
            details: String(error.message || error) 
          });
        }
      } catch (e: any) { 
        out.push({ 
          name: 'supabase', 
          status: 'fail', 
          message: 'DB undantag', 
          details: String(e) 
        });
      }

      // 4) Auth
      try {
        const { data: { session } } = await supabase.auth.getSession();
        out.push({ 
          name: 'auth', 
          status: session ? 'ok' : 'warn', 
          message: session ? 'Inloggad' : 'Inte inloggad',
          details: session?.user?.id || '' 
        });
      } catch (e: any) { 
        out.push({ 
          name: 'auth', 
          status: 'fail', 
          message: 'Auth fel', 
          details: String(e) 
        });
      }

      // 5) Edge functions
      for (const fn of ['auri-chat', 'auri-roleplay']) {
        try {
          await callEdge(fn, { 
            health: true, 
            language: 'sv', 
            messages: [{ role: 'user', content: 'ping' }] 
          });
          out.push({ 
            name: fn, 
            status: 'ok', 
            message: 'Svar OK' 
          });
        } catch (e: any) {
          const s = String(e);
          const is401 = s.includes('401') || 
                       s.toLowerCase().includes('unauthorized') || 
                       s.toLowerCase().includes('authorization');
          out.push({ 
            name: fn, 
            status: is401 ? 'fail' : 'warn', 
            message: is401 
              ? '401: saknar Authorization header eller validering' 
              : 'Funktion fel',
            details: s 
          });
        }
      }

      // 6) PWA/Cache
      try {
        const sw = 'serviceWorker' in navigator;
        out.push({ 
          name: 'pwa', 
          status: sw ? 'ok' : 'warn', 
          message: sw ? 'Service Worker aktiv' : 'Ingen SW (ok i dev)' 
        });
      } catch { 
        out.push({ 
          name: 'pwa', 
          status: 'warn', 
          message: 'Okänt SW-läge' 
        });
      }

      setItems(out);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="p-4">Kör tester…</div>;
  
  return (
    <div className="p-4 space-y-3">
      <h1 className="text-xl font-semibold">Systemhälsa</h1>
      <ul className="space-y-2">
        {items.map((it, i) => (
          <li 
            key={i} 
            className={`rounded-xl border p-3 ${
              it.status === 'ok' 
                ? 'border-green-300 bg-green-50' 
                : it.status === 'warn'
                ? 'border-amber-300 bg-amber-50'
                : 'border-rose-300 bg-rose-50'
            }`}
          >
            <div className="text-sm font-medium">
              {it.name} — {it.status.toUpperCase()}
            </div>
            <div className="text-sm">{it.message}</div>
            {it.details && (
              <div className="text-xs opacity-70 mt-1 break-all">
                {it.details}
              </div>
            )}
          </li>
        ))}
      </ul>
      <div className="mt-3">
        <a className="underline text-blue-600 hover:text-blue-800" href="/dev/reset">
          Rensa cache / SW
        </a>
      </div>
      <div className="text-xs opacity-60 mt-2">
        Om auri_* visar 401: se till att vi skickar Authorization (denna kod gör det) 
        och att Edge validerar Supabase-JWT.
      </div>
    </div>
  );
}
