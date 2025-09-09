import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import './index.css';
import './lib/i18n';
import NewApp from './NewApp';

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <NewApp />
  </StrictMode>
);
