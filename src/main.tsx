import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import './index.css';
import './lib/i18n';
import NewApp from './NewApp';
import AuthLanguageSync from './app/providers/AuthLanguageSync';

// Health check on boot
import { runSelfTest } from '@/health/selftest';
import i18n from '@/lib/i18n/index';

// Run health check after i18n is ready
i18n.on('initialized', () => {
  runSelfTest(i18n, location.pathname).then(r => {
    const fails = r.checks.filter(c => c.status === 'fail').length;
    const warns = r.checks.filter(c => c.status === 'warn').length;
    // compact line for mobile consoles
    console.log('[HEALTH]', new Date().toISOString(), `ok=${fails === 0}`, `fails=${fails}`, `warns=${warns}`);
  });
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthLanguageSync />
    <NewApp />
  </StrictMode>
);
