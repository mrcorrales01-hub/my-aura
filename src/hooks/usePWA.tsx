import { useState, useEffect } from 'react';
import { useToast } from './use-toast';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const usePWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if app is installed
    setIsInstalled(
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    );

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "You're back online!",
        description: "Syncing your data...",
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "You're offline",
        description: "Don't worry, you can still use core features",
        variant: "destructive",
      });
    };

    // Listen for app update
    const handleAppInstalled = () => {
      setIsInstalled(true);
      toast({
        title: "App installed successfully!",
        description: "You can now use Aura offline",
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Service Worker update detection
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SKIP_WAITING') {
          setUpdateAvailable(true);
        }
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [toast]);

  const installApp = async () => {
    if (!deferredPrompt) {
      toast({
        title: "Installation not available",
        description: "This app is already installed or your browser doesn't support installation",
        variant: "destructive",
      });
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        toast({
          title: "Installing app...",
          description: "Aura is being installed to your device",
        });
      }
    } catch (error) {
      console.error('Error installing app:', error);
      toast({
        title: "Installation failed",
        description: "There was an error installing the app",
        variant: "destructive",
      });
    }
  };

  const updateApp = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
        }
      });
    }
  };

  const shareApp = async () => {
    const shareData = {
      title: 'Aura - Wellness & Mental Health',
      text: 'Check out this amazing wellness app that has helped me improve my mental health!',
      url: window.location.origin,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        toast({
          title: "Link copied!",
          description: "Share link has been copied to your clipboard",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return {
    isInstalled,
    isOnline,
    updateAvailable,
    canInstall: !!deferredPrompt,
    installApp,
    updateApp,
    shareApp,
  };
};