import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { useWearableIntegration } from '@/hooks/useWearableIntegration';
import { 
  Smartphone, 
  Watch, 
  Activity, 
  Heart, 
  Moon, 
  Zap, 
  Wifi, 
  WifiOff, 
  RefreshCw,
  Settings,
  Shield,
  TrendingUp,
  Battery,
  Clock
} from 'lucide-react';

const WearableIntegration: React.FC = () => {
  const {
    devices,
    healthMetrics,
    loading,
    syncing,
    connectDevice,
    disconnectDevice,
    syncWearableData,
  } = useWearableIntegration();

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'apple_watch':
        return <Watch className="w-8 h-8 text-gray-700" />;
      case 'fitbit':
        return <Activity className="w-8 h-8 text-blue-600" />;
      case 'oura':
        return <Moon className="w-8 h-8 text-purple-600" />;
      case 'garmin':
        return <Zap className="w-8 h-8 text-red-600" />;
      default:
        return <Smartphone className="w-8 h-8 text-gray-500" />;
    }
  };

  const formatDeviceName = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Wearable Integration</h1>
          <p className="text-muted-foreground mt-1">
            Connect your devices for personalized wellness insights
          </p>
        </div>
        <Button 
          onClick={() => syncWearableData()} 
          disabled={syncing}
          variant="outline"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
          Sync Data
        </Button>
      </div>

      {/* Health Metrics Overview */}
      {Object.keys(healthMetrics).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {healthMetrics.heartRate && (
            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600 font-medium">Heart Rate</p>
                    <p className="text-2xl font-bold text-red-700">
                      {Math.round(healthMetrics.heartRate.current)} bpm
                    </p>
                    <p className="text-xs text-red-600">
                      Avg: {Math.round(healthMetrics.heartRate.average)} bpm
                    </p>
                  </div>
                  <Heart className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          )}

          {healthMetrics.sleep && (
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Sleep</p>
                    <p className="text-2xl font-bold text-purple-700">
                      {healthMetrics.sleep.duration.toFixed(1)}h
                    </p>
                    <p className="text-xs text-purple-600">
                      Quality: {healthMetrics.sleep.quality.toFixed(1)}/10
                    </p>
                  </div>
                  <Moon className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          )}

          {healthMetrics.activity && (
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Activity</p>
                    <p className="text-2xl font-bold text-green-700">
                      {healthMetrics.activity.steps.toLocaleString()}
                    </p>
                    <p className="text-xs text-green-600">
                      {healthMetrics.activity.calories} cal
                    </p>
                  </div>
                  <Activity className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          )}

          {healthMetrics.stress && (
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600 font-medium">Stress</p>
                    <p className="text-2xl font-bold text-orange-700">
                      {Math.round(healthMetrics.stress.level)}/10
                    </p>
                    <p className="text-xs text-orange-600">
                      HRV: {Math.round(healthMetrics.stress.hrv)}ms
                    </p>
                  </div>
                  <Zap className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Device Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Connected Devices
          </CardTitle>
          <CardDescription>
            Manage your wearable devices and data synchronization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {devices.map((device) => (
            <Card 
              key={device.id} 
              className={`border-2 ${device.connected ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {getDeviceIcon(device.type)}
                      <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                        device.connected ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{device.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatDeviceName(device.type)}
                      </p>
                      {device.connected && device.lastSync && (
                        <p className="text-xs text-green-600 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Last sync: {device.lastSync.toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {device.connected && (
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          <Wifi className="w-3 h-3 mr-1" />
                          Connected
                        </Badge>
                        {device.batteryLevel && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Battery className="w-4 h-4" />
                            {device.batteryLevel}%
                          </div>
                        )}
                      </div>
                    )}

                    {device.connected ? (
                      <Button
                        onClick={() => disconnectDevice(device.id)}
                        variant="outline"
                        size="sm"
                      >
                        <WifiOff className="w-4 h-4 mr-2" />
                        Disconnect
                      </Button>
                    ) : (
                      <Button
                        onClick={() => connectDevice(device.id, device.type)}
                        disabled={syncing}
                        size="sm"
                      >
                        <Wifi className="w-4 h-4 mr-2" />
                        Connect
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Privacy & Data Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Privacy & Data Settings
          </CardTitle>
          <CardDescription>
            Control how your wearable data is used and stored
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Share data with AI coach</h3>
              <p className="text-sm text-muted-foreground">
                Allow Auri to use your wearable data for personalized recommendations
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Automatic sync</h3>
              <p className="text-sm text-muted-foreground">
                Sync data automatically every 30 minutes when devices are connected
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Data retention</h3>
              <p className="text-sm text-muted-foreground">
                Keep wearable data for wellness insights and trends analysis
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>Your wearable data is encrypted and never shared with third parties</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Benefits */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900">
                Why Connect Your Wearables?
              </h3>
              <p className="text-blue-700">
                Get more accurate and personalized mental health insights
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white p-3 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-1">Better Predictions</h4>
              <p className="text-blue-700">
                AI uses sleep, heart rate, and activity data to predict mood changes
              </p>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-1">Personalized Recommendations</h4>
              <p className="text-blue-700">
                Get wellness suggestions based on your actual physical data
              </p>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-1">Holistic Tracking</h4>
              <p className="text-blue-700">
                See how physical health impacts your mental wellness
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WearableIntegration;