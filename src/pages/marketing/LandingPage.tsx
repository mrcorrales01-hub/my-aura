import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import VideoLightbox from './VideoLightbox';

export default function LandingPage() {
  const { t, i18n } = useTranslation('landing');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [sent, setSent] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);

  const videoUrl = import.meta.env.VITE_VIDEO_URL || '/demo.mp4';
  const videoPoster = import.meta.env.VITE_VIDEO_POSTER || '/og.jpg';

  async function join() {
    try {
      await supabase.from('waitlist').insert({ email, name, interest: 'user' });
      setSent(true);
    } catch {
      setSent(true);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Topbar */}
      <header className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
        <div className="text-lg font-semibold">My Aura</div>
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/clinic" className="opacity-80 hover:opacity-100 transition-opacity">
            {t('nav.clinic')}
          </Link>
          <Link to="/auth" className="underline">
            {t('nav.signin')}
          </Link>
          <select 
            value={i18n.language} 
            onChange={e => i18n.changeLanguage(e.target.value)} 
            className="border border-border rounded px-2 py-1 bg-background"
          >
            {['sv', 'en', 'es', 'no', 'da', 'fi'].map(l => (
              <option key={l} value={l}>{l.toUpperCase()}</option>
            ))}
          </select>
        </nav>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-4 pb-10 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="text-4xl md:text-6xl font-semibold leading-tight">
            {t('hero.title')}
          </h1>
          <p className="mt-4 text-base md:text-lg opacity-80">
            {t('hero.subtitle')}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link 
              to="/auth" 
              className="px-5 py-2.5 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {t('cta.tryWeb')}
            </Link>
            <a 
              href="#waitlist" 
              className="px-5 py-2.5 rounded border border-border hover:bg-accent transition-colors"
            >
              {t('cta.waitlist')}
            </a>
          </div>
          <p className="mt-2 text-xs opacity-60">{t('hero.disclaimer')}</p>
        </div>
        <div className="rounded-2xl border border-border p-4 md:p-6">
          <button 
            onClick={() => setVideoOpen(true)} 
            className="group block w-full relative"
            aria-label={t('video.play') || 'Play demo video'}
          >
            <div 
              className="aspect-video w-full rounded-xl border border-border overflow-hidden bg-muted"
              style={{
                backgroundImage: `url(${videoPoster})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="rounded-full border border-border bg-background/90 px-4 py-2 text-sm group-hover:scale-105 transition-transform shadow-lg">
                  ▶ {t('video.play')}
                </span>
              </span>
            </div>
          </button>
          <div className="text-xs opacity-60 mt-2">{t('video.caption')}</div>
          
          <div className="mt-3">
            <p className="text-sm mb-2">{t('demo.prompt')}</p>
            <div className="flex flex-wrap gap-2">
              {['demo.m1', 'demo.m2', 'demo.m3'].map(k => (
                <button 
                  key={k} 
                  className="px-3 py-1.5 rounded-full border border-border hover:bg-accent transition-colors text-sm"
                >
                  {t(k)}
                </button>
              ))}
            </div>
            <div className="text-sm bg-muted rounded p-3 mt-2">
              {t('demo.preview')}
            </div>
          </div>
        </div>
        
        <VideoLightbox 
          open={videoOpen} 
          onClose={() => setVideoOpen(false)} 
          src={videoUrl} 
          poster={videoPoster}
        />
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 grid md:grid-cols-4 gap-4">
        {['auri', 'safety', 'visit', 'roleplay'].map(k => (
          <div key={k} className="rounded-2xl border border-border p-4 hover:border-primary/50 transition-colors">
            <div className="font-medium">{t(`feat.${k}.title`)}</div>
            <div className="text-sm opacity-70 mt-1">{t(`feat.${k}.desc`)}</div>
          </div>
        ))}
      </section>

      {/* Social proof */}
      <section className="max-w-6xl mx-auto px-4 mt-10 grid md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="rounded-2xl border border-border p-4 bg-muted/30">
            <div className="text-sm opacity-70">"{t('proof.quote')}"</div>
            <div className="text-sm mt-2 opacity-60">— {t('proof.person')} #{i}</div>
          </div>
        ))}
      </section>

      {/* Pricing */}
      <section className="max-w-6xl mx-auto px-4 mt-10">
        <h2 className="text-xl font-semibold">{t('pricing.title')}</h2>
        <div className="grid md:grid-cols-3 gap-4 mt-3">
          {['free', 'plus', 'pro'].map(plan => (
            <div 
              key={plan} 
              className="rounded-2xl border border-border p-4 hover:border-primary/50 transition-colors"
            >
              <div className="font-medium">{t(`pricing.${plan}.name`)}</div>
              <div className="text-3xl font-semibold my-1">{t(`pricing.${plan}.price`)}</div>
              <ul className="text-sm opacity-80 list-disc pl-5 space-y-1">
                {(t(`pricing.${plan}.points`, { returnObjects: true }) as string[]).map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
              <Link 
                to="/auth" 
                className="mt-3 inline-block px-3 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                {t('cta.getStarted')}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Waitlist */}
      <section id="waitlist" className="max-w-6xl mx-auto px-4 mt-10">
        <div className="rounded-2xl border border-border p-4 bg-muted/30">
          <h3 className="font-medium">{t('wait.title')}</h3>
          {sent ? (
            <div className="text-green-700 dark:text-green-400 text-sm mt-2">
              {t('wait.thanks')}
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              <input 
                className="border border-border rounded px-3 py-2 w-full bg-background" 
                placeholder={t('wait.name') || 'Namn'} 
                value={name} 
                onChange={e => setName(e.target.value)} 
              />
              <input 
                className="border border-border rounded px-3 py-2 w-full bg-background" 
                placeholder="you@email.com" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
              />
              <button 
                onClick={join} 
                className="px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors whitespace-nowrap"
              >
                {t('wait.join')}
              </button>
            </div>
          )}
          <div className="text-xs opacity-60 mt-2">{t('wait.privacy')}</div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 py-12 text-sm opacity-80 flex flex-wrap gap-4">
        <Link to="/privacy" className="hover:opacity-100 transition-opacity">Integritet</Link>
        <Link to="/terms" className="hover:opacity-100 transition-opacity">Villkor</Link>
        <Link to="/contact" className="hover:opacity-100 transition-opacity">Kontakt</Link>
        <Link to="/press" className="ml-auto hover:opacity-100 transition-opacity">{t('nav.press')}</Link>
      </footer>
    </div>
  );
}
