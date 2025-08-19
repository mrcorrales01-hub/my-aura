import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'
import { SubscriptionProvider } from './contexts/SubscriptionContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { Toaster } from './components/ui/toaster'
import { EnhancedI18nProvider } from './hooks/useEnhancedI18n'

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <EnhancedI18nProvider>
        <AuthProvider>
          <SubscriptionProvider>
            <App />
            <Toaster />
          </SubscriptionProvider>
        </AuthProvider>
      </EnhancedI18nProvider>
    </ThemeProvider>
  </StrictMode>
);
