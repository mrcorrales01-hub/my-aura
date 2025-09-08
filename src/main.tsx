import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import './lib/i18n';
import App from './App';

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
