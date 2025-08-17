import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface WearableDevice {
  id: string;
  name: string;
  type: 'apple_watch' | 'fitbit' | 'oura' | 'garmin' | 'other';
  connected: boolean;
  lastSync: Date | null;
  batteryLevel?: number;
}

interface WearableData {
  id: string;
  deviceType: string;
  dataType: string;
  value: number;
  unit: string;
  recordedAt: Date;
  metadata?: any;
}

interface HealthMetrics {
  heartRate?: {
    current: number;
    average: number;
    trend: 'stable' | 'increasing' | 'decreasing';
  };
  sleep?: {
    duration: number;
    quality: number;
    deepSleep: number;
  };
  activity?: {
    steps: number;
    calories: number;
    activeMinutes: number;
  };
  stress?: {
    level: number;
    hrv: number;
  };
}

export const useWearableIntegration = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [devices, setDevices] = useState<WearableDevice[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics>({});
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Fetch connected devices
  const fetchDevices = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Simulate fetching devices (in real implementation, this would connect to device APIs)
      const mockDevices: WearableDevice[] = [
        {
          id: '1',
          name: 'Apple Watch Series 9',
          type: 'apple_watch',
          connected: false,
          lastSync: null,
        },
        {
          id: '2',
          name: 'Fitbit Versa 4',
          type: 'fitbit',
          connected: false,
          lastSync: null,
        },
        {
          id: '3',
          name: 'Oura Ring Gen3',
          type: 'oura',
          connected: false,
          lastSync: null,
        },
      ];

      setDevices(mockDevices);
    } catch (error) {
      console.error('Error fetching devices:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Connect to a wearable device
  const connectDevice = async (deviceId: string, deviceType: string) => {
    if (!user) return false;

    try {
      setSyncing(true);

      // In a real implementation, this would handle OAuth flows for different devices
      // For now, we'll simulate the connection
      
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update device status
      setDevices(prev => prev.map(device => 
        device.id === deviceId 
          ? { ...device, connected: true, lastSync: new Date() }
          : device
      ));

      // Generate some initial mock data
      await syncWearableData(deviceType);

      toast({
        title: "Device connected!",
        description: `Successfully connected to your ${deviceType.replace('_', ' ')}`,
      });

      return true;
    } catch (error) {
      console.error('Error connecting device:', error);
      toast({
        title: "Connection failed",
        description: "Failed to connect to your device. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setSyncing(false);
    }
  };

  // Disconnect device
  const disconnectDevice = async (deviceId: string) => {
    setDevices(prev => prev.map(device => 
      device.id === deviceId 
        ? { ...device, connected: false, lastSync: null }
        : device
    ));

    toast({
      title: "Device disconnected",
      description: "Your device has been disconnected.",
    });
  };

  // Sync data from wearable devices
  const syncWearableData = async (deviceType?: string) => {
    if (!user) return;

    try {
      setSyncing(true);

      // Generate mock health data based on device type
      const mockData = generateMockHealthData(deviceType || 'apple_watch');

      // Store data in Supabase
      const dataEntries = mockData.map(entry => ({
        user_id: user.id,
        device_type: entry.deviceType,
        data_type: entry.dataType,
        value: entry.value,
        unit: entry.unit,
        recorded_at: entry.recordedAt.toISOString(),
        metadata: entry.metadata || {},
      }));

      const { error } = await supabase
        .from('wearable_data')
        .insert(dataEntries);

      if (error) throw error;

      // Update health metrics
      await fetchHealthMetrics();

      toast({
        title: "Data synced!",
        description: `Synced ${dataEntries.length} new health data points`,
      });

    } catch (error) {
      console.error('Error syncing data:', error);
      toast({
        title: "Sync failed",
        description: "Failed to sync your health data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  // Fetch health metrics from stored data
  const fetchHealthMetrics = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('wearable_data')
        .select('*')
        .eq('user_id', user.id)
        .gte('recorded_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('recorded_at', { ascending: false });

      if (error) throw error;

      // Process data into health metrics
      const metrics: HealthMetrics = {};

      data?.forEach(entry => {
        switch (entry.data_type) {
          case 'heart_rate':
            if (!metrics.heartRate) {
              metrics.heartRate = {
                current: entry.value,
                average: entry.value,
                trend: 'stable'
              };
            }
            break;
          case 'sleep_duration':
            if (!metrics.sleep) {
              metrics.sleep = {
                duration: entry.value,
                quality: 7.5,
                deepSleep: entry.value * 0.25
              };
            }
            break;
          case 'steps':
            if (!metrics.activity) {
              metrics.activity = {
                steps: entry.value,
                calories: Math.round(entry.value * 0.04),
                activeMinutes: Math.round(entry.value / 100)
              };
            }
            break;
          case 'stress_level':
            if (!metrics.stress) {
              metrics.stress = {
                level: entry.value,
                hrv: 45 + Math.random() * 20
              };
            }
            break;
        }
      });

      setHealthMetrics(metrics);
    } catch (error) {
      console.error('Error fetching health metrics:', error);
    }
  };

  // Generate mock health data for demo purposes
  const generateMockHealthData = (deviceType: string): WearableData[] => {
    const now = new Date();
    const data: WearableData[] = [];

    // Generate heart rate data
    for (let i = 0; i < 10; i++) {
      data.push({
        id: `hr_${i}`,
        deviceType,
        dataType: 'heart_rate',
        value: 65 + Math.random() * 30,
        unit: 'bpm',
        recordedAt: new Date(now.getTime() - i * 60 * 60 * 1000),
      });
    }

    // Generate sleep data
    data.push({
      id: 'sleep_1',
      deviceType,
      dataType: 'sleep_duration',
      value: 7.5 + Math.random() * 1.5,
      unit: 'hours',
      recordedAt: new Date(now.getTime() - 8 * 60 * 60 * 1000),
    });

    // Generate step data
    data.push({
      id: 'steps_1',
      deviceType,
      dataType: 'steps',
      value: Math.floor(5000 + Math.random() * 10000),
      unit: 'steps',
      recordedAt: now,
    });

    // Generate stress data
    data.push({
      id: 'stress_1',
      deviceType,
      dataType: 'stress_level',
      value: Math.floor(1 + Math.random() * 10),
      unit: 'score',
      recordedAt: now,
    });

    return data;
  };

  // Auto-sync data periodically
  useEffect(() => {
    if (user) {
      fetchDevices();
      fetchHealthMetrics();

      // Set up auto-sync every 30 minutes for connected devices
      const interval = setInterval(() => {
        const connectedDevices = devices.filter(d => d.connected);
        if (connectedDevices.length > 0) {
          syncWearableData();
        }
      }, 30 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [user, fetchDevices]);

  return {
    devices,
    healthMetrics,
    loading,
    syncing,
    connectDevice,
    disconnectDevice,
    syncWearableData,
    fetchHealthMetrics,
  };
};