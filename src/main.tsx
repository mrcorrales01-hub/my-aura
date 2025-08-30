import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import App from './App.tsx'
import './index.css'
import './i18n/index'
import { AuthProvider } from './contexts/AuthContext'
import { SubscriptionProvider } from './contexts/SubscriptionContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { Toaster } from './components/ui/toaster'

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <SubscriptionProvider>
          <App />
          <Toaster />
        </SubscriptionProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);
