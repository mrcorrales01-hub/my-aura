import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import './index.css';
import { setupI18n } from '@/lib/i18n/index';
import NewApp from './NewApp';
import AuthLanguageSync from './app/providers/AuthLanguageSync';

// Health check on boot
import { runSelfTest } from '@/health/selftest';

// Setup i18n before rendering
async function init() {
  const i18n = await setupI18n();
  
  // Register service worker for PWA
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    });
  }
  
  // Run health check after i18n is ready
  runSelfTest(i18n, location.pathname).then(r => {
    const fails = r.checks.filter(c => c.status === 'fail').length;
    const warns = r.checks.filter(c => c.status === 'warn').length;
    // compact line for mobile consoles
    console.log('[HEALTH]', new Date().toISOString(), `ok=${fails === 0}`, `fails=${fails}`, `warns=${warns}`);
  });

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <AuthLanguageSync />
      <NewApp />
    </StrictMode>
  );
}

init();
