import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/hooks/useI18n';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  Phone, 
  Settings,
  Play,
  Square,
  MessageCircle
} from 'lucide-react';

export default function LiveSession() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [isInSession, setIsInSession] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [sessionDuration, setSessionDuration] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isInSession) {
      interval = setInterval(() => {
        setSessionDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isInSession]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startSession = () => {
    setIsInSession(true);
    setSessionDuration(0);
  };

  const endSession = () => {
    setIsInSession(false);
    setSessionDuration(0);
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-lg mb-4">Please sign in to access live coaching sessions.</p>
            <Button>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('nav.live')}</h1>
          <p className="text-muted-foreground">
            Real-time AI coaching with voice and video support
          </p>
        </div>

        {!isInSession ? (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Session Start Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  Start Live Session
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Connect with our AI coach for real-time guidance, breathing exercises, 
                  and personalized support through voice and video interaction.
                </p>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span>Camera</span>
                    <Button
                      variant={isVideoOn ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsVideoOn(!isVideoOn)}
                    >
                      {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                      {isVideoOn ? "On" : "Off"}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Microphone</span>
                    <Button
                      variant={!isMuted ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsMuted(!isMuted)}
                    >
                      {!isMuted ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                      {!isMuted ? "On" : "Off"}
                    </Button>
                  </div>
                </div>

                <Button onClick={startSession} className="w-full" size="lg">
                  <Play className="w-5 h-5 mr-2" />
                  Start Session
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Emergency Support
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Audio/Video Settings
                </Button>
                
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Session Limits</h4>
                  <p className="text-sm text-muted-foreground">
                    Free: 15 minutes/month<br />
                    Plus: 60 minutes/month<br />
                    Pro: Unlimited sessions
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Active Session Interface */}
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="font-semibold">Live Session Active</span>
                    <span className="text-muted-foreground">{formatDuration(sessionDuration)}</span>
                  </div>
                </div>

                {/* Video Area */}
                <div className="aspect-video bg-gradient-calm rounded-lg mb-6 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Video className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-lg">AI Coach Session Active</p>
                    <p className="text-sm opacity-80">Audio and video streaming...</p>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant={isMuted ? "destructive" : "outline"}
                    size="lg"
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? <MicOff className="w-5 h-5 mr-2" /> : <Mic className="w-5 h-5 mr-2" />}
                    {isMuted ? "Unmute" : "Mute"}
                  </Button>
                  
                  <Button
                    variant={!isVideoOn ? "destructive" : "outline"}
                    size="lg"
                    onClick={() => setIsVideoOn(!isVideoOn)}
                  >
                    {!isVideoOn ? <VideoOff className="w-5 h-5 mr-2" /> : <Video className="w-5 h-5 mr-2" />}
                    {!isVideoOn ? "Turn On Video" : "Turn Off Video"}
                  </Button>
                  
                  <Button
                    variant="destructive"
                    size="lg"
                    onClick={endSession}
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    End Session
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Session Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Session Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    • Session started at {new Date().toLocaleTimeString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    • AI Coach: Ready to help with emotional support
                  </p>
                  <p className="text-sm text-muted-foreground">
                    • Real-time transcription active
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}