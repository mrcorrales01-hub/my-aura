import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { z } from 'zod';

const marketingLeadSchema = z.object({
  type: z.literal('clinic'),
  org: z.string().trim().min(1, 'Organization name is required').max(200, 'Organization name too long'),
  contact_name: z.string().trim().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address').max(255, 'Email too long'),
  phone: z.string().trim().max(20, 'Phone number too long').regex(/^[\d\s\-\+\(\)]*$/, 'Invalid phone format').optional().or(z.literal('')),
  message: z.string().trim().min(1, 'Message is required').max(2000, 'Message too long')
});

export default function ClinicPage() {
  const { t } = useTranslation('landing');
  const [org, setOrg] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [msg, setMsg] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function send() {
    setError('');
    
    const result = marketingLeadSchema.safeParse({
      type: 'clinic',
      org,
      contact_name: name,
      email,
      phone: phone || '',
      message: msg
    });

    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    try {
      const { error: insertError } = await supabase
        .from('marketing_leads')
        .insert([result.data as any]);
      
      if (insertError) throw insertError;
      setSent(true);
    } catch {
      setError('Failed to send. Please try again.');
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
            {error && (
              <div className="text-destructive p-3 rounded border border-destructive/30 bg-destructive/10 text-sm">
                {error}
              </div>
            )}
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
