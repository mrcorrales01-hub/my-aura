import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import './index.css';
import './lib/i18n';
import NewApp from './NewApp';
import AuthLanguageSync from './app/providers/AuthLanguageSync';

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthLanguageSync />
    <NewApp />
  </StrictMode>
);
