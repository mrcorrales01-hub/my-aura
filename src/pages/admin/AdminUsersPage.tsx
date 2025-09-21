import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';

type Row = { 
  id_mask: string; 
  plan: string; 
  created_at: string|null; 
  last_active: string|null; 
  msgs_7d: number; 
  moods_7d: number; 
  roleplay_7d: number 
};

export default function AdminUsersPage(){
  const { t } = useTranslation('admin');
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState('');
  const [error, setError] = useState<string| null>(null);
  const [loading, setLoading] = useState(true);
  
  const admins = (import.meta.env.VITE_ADMIN_EMAILS||'').split(',').map(s=>s.trim().toLowerCase());

  useEffect(()=>{ (async()=>{
    try{
      const { data:{ session } } = await supabase.auth.getSession();
      const email = session?.user?.email?.toLowerCase();
      if(!email || !admins.includes(email)){ 
        setError(t('notAuthorized')); 
        setLoading(false);
        return; 
      }

      const base = import.meta.env.VITE_SUPABASE_URL;
      const res = await fetch(`${base}/functions/v1/admin-users`, {
        method:'POST',
        headers:{ 'Authorization': `Bearer ${session!.access_token}` }
      });
      
      if(!res.ok){ 
        setError(t('loadError')+` (${res.status})`); 
        setLoading(false);
        return; 
      }
      
      const json = await res.json();
      if(json.error) {
        setError(t('loadError')+`: ${json.error}`);
        setLoading(false);
        return;
      }
      
      setRows(json.rows||[]);
      setLoading(false);
    }catch(err){ 
      console.error('Admin users error:', err);
      setError(t('loadError')); 
      setLoading(false);
    }
  })() },[admins, t]);

  const filtered = useMemo(()=>{
    const s = q.trim().toLowerCase();
    if(!s) return rows;
    return rows.filter(r =>
      r.id_mask.toLowerCase().includes(s) ||
      r.plan.toLowerCase().includes(s)
    );
  },[rows,q]);

  const exportCsv = ()=>{
    const heads = ['id_mask','plan','created_at','last_active','msgs_7d','moods_7d','roleplay_7d'];
    const esc = (v:any)=>`"${String(v??'').replace(/"/g,'""')}"`;
    const csv = [heads.join(','), ...filtered.map(r=>heads.map(h=>esc((r as any)[h])).join(','))].join('\n');
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob); 
    const a = document.createElement('a');
    a.href = url; 
    a.download = `admin_users_${new Date().toISOString().split('T')[0]}.csv`; 
    a.click(); 
    URL.revokeObjectURL(url);
  };

  if(loading) {
    return <div className="p-4 text-sm">Loading admin data...</div>;
  }

  if(error) {
    return <div className="p-4 text-sm text-amber-700">{error}</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">{t('users')}</h1>
      
      <div className="flex gap-2">
        <input 
          className="border rounded px-3 py-2 flex-1" 
          placeholder={t('search')||'Search'} 
          value={q} 
          onChange={e=>setQ(e.target.value)} 
        />
        <button 
          className="px-3 py-2 rounded border hover:bg-gray-50" 
          onClick={exportCsv}
          disabled={filtered.length === 0}
        >
          {t('exportCsv')}
        </button>
      </div>

      <div className="text-sm text-gray-600">
        Showing {filtered.length} of {rows.length} users
      </div>
      
      <div className="rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3">{t('mask')}</th>
                <th className="text-left p-3">{t('plan')}</th>
                <th className="text-left p-3">{t('created')}</th>
                <th className="text-left p-3">{t('lastActive')}</th>
                <th className="text-left p-3">{t('msgs7')}</th>
                <th className="text-left p-3">{t('moods7')}</th>
                <th className="text-left p-3">{t('rp7')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i)=>(
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-mono text-xs">{r.id_mask}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      r.plan === 'pro' ? 'bg-purple-100 text-purple-800' :
                      r.plan === 'plus' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {r.plan.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3 text-xs">
                    {r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="p-3 text-xs">
                    {r.last_active ? new Date(r.last_active).toLocaleDateString() : '—'}
                  </td>
                  <td className="p-3 text-center">{r.msgs_7d}</td>
                  <td className="p-3 text-center">{r.moods_7d}</td>
                  <td className="p-3 text-center">{r.roleplay_7d}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-xs text-gray-500">
        Last updated: {new Date().toLocaleString()}
      </div>
    </div>
  );
}