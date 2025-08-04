import { createRoot } from 'react-dom/client'
import { LanguageProvider } from './hooks/useLanguage'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <LanguageProvider>
    <App />
  </LanguageProvider>
);
