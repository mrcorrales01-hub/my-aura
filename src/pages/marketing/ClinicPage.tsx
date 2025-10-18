import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function ClinicPage() {
  const { t } = useTranslation('landing');
  const [org, setOrg] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [msg, setMsg] = useState('');
  const [sent, setSent] = useState(false);

  async function send() {
    try {
      await supabase.from('marketing_leads').insert({
        type: 'clinic',
        org,
        contact_name: name,
        email,
        phone,
        message: msg
      });
      setSent(true);
    } catch {
      setSent(true);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="max-w-6xl mx-auto px-4 py-6">
        <Link to="/welcome" className="text-lg font-semibold">My Aura</Link>
      </header>
      
      <div className="max-w-3xl mx-auto p-4">
        <h1 className="text-2xl font-semibold mb-2">{t('clinic.title')}</h1>
        <p className="text-sm opacity-70 mb-4">{t('clinic.subtitle')}</p>
        
        {sent ? (
          <div className="text-green-700 dark:text-green-400 p-4 rounded border border-green-700/30 bg-green-50 dark:bg-green-900/10">
            {t('clinic.thanks')}
          </div>
        ) : (
          <div className="space-y-2">
            <input 
              className="border border-border rounded px-3 py-2 w-full bg-background" 
              placeholder={t('clinic.org') || 'Organisation'} 
              value={org} 
              onChange={e => setOrg(e.target.value)} 
            />
            <div className="grid sm:grid-cols-2 gap-2">
              <input 
                className="border border-border rounded px-3 py-2 w-full bg-background" 
                placeholder={t('clinic.name') || 'Namn'} 
                value={name} 
                onChange={e => setName(e.target.value)} 
              />
              <input 
                className="border border-border rounded px-3 py-2 w-full bg-background" 
                placeholder="email@domain.com" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
              />
            </div>
            <input 
              className="border border-border rounded px-3 py-2 w-full bg-background" 
              placeholder={t('clinic.phone') || 'Telefon'} 
              value={phone} 
              onChange={e => setPhone(e.target.value)} 
            />
            <textarea 
              className="border border-border rounded px-3 py-2 w-full bg-background" 
              rows={4} 
              placeholder={t('clinic.msg') || 'Meddelande'} 
              value={msg} 
              onChange={e => setMsg(e.target.value)} 
            />
            <button 
              onClick={send} 
              className="px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {t('clinic.send')}
            </button>
          </div>
        )}
        
        <div className="text-xs opacity-60 mt-4">{t('clinic.privacy')}</div>
        
        <Link to="/welcome" className="text-sm underline mt-6 inline-block">
          ← Tillbaka till startsidan
        </Link>
      </div>
    </div>
  );
}
