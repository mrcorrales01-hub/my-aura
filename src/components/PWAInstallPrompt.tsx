import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Download, Wifi, WifiOff, RefreshCw, Share2 } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { useOfflineSync } from '@/hooks/useOfflineSync';

export const PWAInstallPrompt = () => {
  const { isInstalled, isOnline, updateAvailable, canInstall, installApp, updateApp, shareApp } = usePWA();
  const { pendingSync, isSyncing, syncPendingItems } = useOfflineSync();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem('pwa-install-dismissed');
    if (isDismissed) {
      setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (dismissed && !updateAvailable) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      {!isInstalled && canInstall && !dismissed && (
        <Card className="shadow-wellness border-wellness-primary/20 bg-gradient-wellness">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-wellness-primary" />
                <CardTitle className="text-lg">Install Aura</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={handleDismiss}>
                ×
              </Button>
            </div>
            <CardDescription>
              Get the full app experience with offline access and notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs">
                <WifiOff className="w-3 h-3 mr-1" />
                Offline Mode
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <Download className="w-3 h-3 mr-1" />
                Fast Access
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button onClick={installApp} className="flex-1" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Install
              </Button>
              <Button onClick={shareApp} variant="outline" size="sm">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {updateAvailable && (
        <Card className="shadow-wellness border-wellness-primary/20 bg-gradient-wellness mb-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-wellness-primary" />
              Update Available
            </CardTitle>
            <CardDescription>
              A new version of Aura is ready to install
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={updateApp} className="w-full" size="sm">
              Update Now
            </Button>
          </CardContent>
        </Card>
      )}

      {!isOnline && (
        <Card className="shadow-soft border-amber-200 bg-amber-50 mb-2">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-amber-800">
              <WifiOff className="w-4 h-4" />
              <span className="text-sm font-medium">You're offline</span>
            </div>
            {pendingSync.length > 0 && (
              <div className="mt-2 text-xs text-amber-700">
                {pendingSync.length} items waiting to sync
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {isOnline && pendingSync.length > 0 && (
        <Card className="shadow-soft border-blue-200 bg-blue-50 mb-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-800">
                <Wifi className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {isSyncing ? 'Syncing...' : `${pendingSync.length} items to sync`}
                </span>
              </div>
              {!isSyncing && (
                <Button 
                  onClick={syncPendingItems} 
                  size="sm" 
                  variant="outline" 
                  className="h-6 px-2 text-xs"
                >
                  Sync Now
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};