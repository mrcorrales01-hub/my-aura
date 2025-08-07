import { useState, useEffect } from 'react';
import { useToast } from './use-toast';

interface SyncItem {
  id: string;
  type: 'mood' | 'chat' | 'resource' | 'preference';
  data: any;
  timestamp: number;
  synced: boolean;
}

export const useOfflineSync = () => {
  const [pendingSync, setPendingSync] = useState<SyncItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  // Load pending sync items from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('aura-pending-sync');
    if (stored) {
      try {
        setPendingSync(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading pending sync items:', error);
      }
    }
  }, []);

  // Save pending sync items to localStorage
  useEffect(() => {
    localStorage.setItem('aura-pending-sync', JSON.stringify(pendingSync));
  }, [pendingSync]);

  // Sync when online
  useEffect(() => {
    const handleOnline = () => {
      if (pendingSync.length > 0) {
        syncPendingItems();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [pendingSync]);

  const addToSyncQueue = (type: SyncItem['type'], data: any) => {
    const syncItem: SyncItem = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: Date.now(),
      synced: false,
    };

    setPendingSync(prev => [...prev, syncItem]);

    // If online, try to sync immediately
    if (navigator.onLine) {
      syncItem.synced = false;
      syncPendingItems();
    } else {
      toast({
        title: "Saved offline",
        description: "Your data will sync when you're back online",
      });
    }

    return syncItem.id;
  };

  const syncPendingItems = async () => {
    if (isSyncing || !navigator.onLine) return;

    setIsSyncing(true);
    const itemsToSync = pendingSync.filter(item => !item.synced);

    try {
      for (const item of itemsToSync) {
        await syncItem(item);
        
        // Mark as synced
        setPendingSync(prev => 
          prev.map(p => p.id === item.id ? { ...p, synced: true } : p)
        );
      }

      // Remove synced items after successful sync
      setPendingSync(prev => prev.filter(item => !item.synced));

      if (itemsToSync.length > 0) {
        toast({
          title: "Data synced",
          description: `${itemsToSync.length} items synced successfully`,
        });
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: "Sync failed",
        description: "Some items couldn't be synced. Will retry later.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const syncItem = async (item: SyncItem) => {
    // Implement actual sync logic based on item type
    switch (item.type) {
      case 'mood':
        // Sync mood data to Supabase
        break;
      case 'chat':
        // Sync chat messages
        break;
      case 'resource':
        // Sync resource progress
        break;
      case 'preference':
        // Sync user preferences
        break;
    }
    
    // Simulate API call
    return new Promise(resolve => setTimeout(resolve, 100));
  };

  const clearSyncQueue = () => {
    setPendingSync([]);
    localStorage.removeItem('aura-pending-sync');
  };

  return {
    pendingSync: pendingSync.filter(item => !item.synced),
    isSyncing,
    addToSyncQueue,
    syncPendingItems,
    clearSyncQueue,
  };
};