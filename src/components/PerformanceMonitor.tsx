import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Cpu, 
  MemoryStick, 
  Wifi, 
  Clock, 
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Gauge
} from 'lucide-react';

interface PerformanceMetrics {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  memoryUsage: number;
  networkSpeed: 'fast' | 'slow' | 'offline';
  batteryLevel?: number;
  isOnline: boolean;
}

const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    cumulativeLayoutShift: 0,
    firstInputDelay: 0,
    memoryUsage: 0,
    networkSpeed: 'fast',
    isOnline: navigator.onLine
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show performance monitor in development or for admin users
    const isDev = process.env.NODE_ENV === 'development';
    const isAdmin = localStorage.getItem('admin_mode') === 'true';
    setIsVisible(isDev || isAdmin);

    if (!isVisible) return;

    const collectMetrics = () => {
      // Collect Web Vitals and performance metrics
      if ('performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType('paint');
        
        const newMetrics: Partial<PerformanceMetrics> = {
          loadTime: navigation ? navigation.loadEventEnd - navigation.fetchStart : 0,
          isOnline: navigator.onLine
        };

        // First Contentful Paint
        const fcp = paint.find(p => p.name === 'first-contentful-paint');
        if (fcp) newMetrics.firstContentfulPaint = fcp.startTime;

        // Memory usage (if available)
        if ('memory' in performance) {
          const memory = (performance as any).memory;
          newMetrics.memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit * 100;
        }

        // Network speed estimation
        const connection = (navigator as any).connection;
        if (connection) {
          const effectiveType = connection.effectiveType;
          newMetrics.networkSpeed = ['slow-2g', '2g'].includes(effectiveType) ? 'slow' : 'fast';
        }

        // Battery API (if available)
        if ('getBattery' in navigator) {
          (navigator as any).getBattery().then((battery: any) => {
            newMetrics.batteryLevel = battery.level * 100;
          });
        }

        setMetrics(prev => ({ ...prev, ...newMetrics }));
      }
    };

    // Collect initial metrics
    collectMetrics();

    // Set up intervals for real-time monitoring
    const metricsInterval = setInterval(collectMetrics, 5000);
    
    // Monitor network status
    const handleOnline = () => setMetrics(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setMetrics(prev => ({ ...prev, isOnline: false, networkSpeed: 'offline' }));
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Core Web Vitals observer
    if ('PerformanceObserver' in window) {
      try {
        // LCP Observer
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          setMetrics(prev => ({ 
            ...prev, 
            largestContentfulPaint: lastEntry.startTime 
          }));
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // CLS Observer
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          setMetrics(prev => ({ 
            ...prev, 
            cumulativeLayoutShift: clsValue 
          }));
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

        // FID Observer
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            setMetrics(prev => ({ 
              ...prev, 
              firstInputDelay: (entry as any).processingStart - entry.startTime 
            }));
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

      } catch (error) {
        console.warn('Performance Observer not fully supported:', error);
      }
    }

    return () => {
      clearInterval(metricsInterval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  const getMetricStatus = (value: number, thresholds: { good: number; needs_improvement: number }) => {
    if (value <= thresholds.good) return 'good';
    if (value <= thresholds.needs_improvement) return 'needs-improvement';
    return 'poor';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'needs-improvement': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'poor': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Gauge className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-500';
      case 'needs-improvement': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const webVitals = [
    {
      name: 'First Contentful Paint',
      value: metrics.firstContentfulPaint,
      unit: 'ms',
      status: getMetricStatus(metrics.firstContentfulPaint, { good: 1800, needs_improvement: 3000 }),
      description: 'Time until first text/image appears'
    },
    {
      name: 'Largest Contentful Paint',
      value: metrics.largestContentfulPaint,
      unit: 'ms',
      status: getMetricStatus(metrics.largestContentfulPaint, { good: 2500, needs_improvement: 4000 }),
      description: 'Time until largest element appears'
    },
    {
      name: 'Cumulative Layout Shift',
      value: metrics.cumulativeLayoutShift,
      unit: '',
      status: getMetricStatus(metrics.cumulativeLayoutShift, { good: 0.1, needs_improvement: 0.25 }),
      description: 'Visual stability during loading'
    },
    {
      name: 'First Input Delay',
      value: metrics.firstInputDelay,
      unit: 'ms',  
      status: getMetricStatus(metrics.firstInputDelay, { good: 100, needs_improvement: 300 }),
      description: 'Responsiveness to first interaction'
    }
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 shadow-xl border-2">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="w-5 h-5 text-primary" />
            Performance Monitor
            <Badge variant="outline" className="text-xs">
              DEV
            </Badge>
          </CardTitle>
          <CardDescription className="text-xs">
            Real-time app performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* System Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Wifi className={`w-4 h-4 ${metrics.isOnline ? 'text-green-600' : 'text-red-600'}`} />
              <span className="text-xs">
                {metrics.isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="text-xs capitalize">
                {metrics.networkSpeed}
              </span>
            </div>
          </div>

          {/* Memory Usage */}
          {metrics.memoryUsage > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MemoryStick className="w-4 h-4 text-purple-600" />
                  <span className="text-xs">Memory</span>
                </div>
                <span className="text-xs font-mono">
                  {metrics.memoryUsage.toFixed(1)}%
                </span>
              </div>
              <Progress value={metrics.memoryUsage} className="h-1" />
            </div>
          )}

          {/* Battery Level */}
          {metrics.batteryLevel !== undefined && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-600" />
                  <span className="text-xs">Battery</span>
                </div>
                <span className="text-xs font-mono">
                  {metrics.batteryLevel.toFixed(0)}%
                </span>
              </div>
              <Progress value={metrics.batteryLevel} className="h-1" />
            </div>
          )}

          {/* Core Web Vitals */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold flex items-center gap-2">
              <Gauge className="w-4 h-4" />
              Core Web Vitals
            </h4>
            {webVitals.map((vital) => (
              <div key={vital.name} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(vital.status)}
                    <span className="text-xs">{vital.name}</span>
                  </div>
                  <span className="text-xs font-mono">
                    {vital.value > 0 ? `${vital.value.toFixed(vital.unit === 'ms' ? 0 : 3)}${vital.unit}` : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-1">
                    <div 
                      className={`h-1 rounded-full transition-all duration-300 ${getStatusColor(vital.status)}`}
                      style={{ 
                        width: vital.status === 'good' ? '100%' : 
                               vital.status === 'needs-improvement' ? '60%' : '30%' 
                      }}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{vital.description}</p>
              </div>
            ))}
          </div>

          {/* Load Time */}
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-xs">Page Load</span>
              </div>
              <span className="text-xs font-mono">
                {metrics.loadTime > 0 ? `${(metrics.loadTime / 1000).toFixed(2)}s` : 'N/A'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceMonitor;