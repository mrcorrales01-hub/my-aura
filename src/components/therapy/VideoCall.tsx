import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Phone, 
  PhoneOff,
  MessageSquare,
  Settings,
  Users
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

interface VideoCallProps {
  appointmentId: string;
  therapistName: string;
  isOpen: boolean;
  onClose: () => void;
  onEndCall: () => void;
}

const VideoCall: React.FC<VideoCallProps> = ({
  appointmentId,
  therapistName,
  isOpen,
  onClose,
  onEndCall
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{
    sender: string;
    message: string;
    timestamp: Date;
  }>>([]);
  const [callDuration, setCallDuration] = useState(0);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  // Call duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isConnected) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isConnected]);

  // Initialize video call (placeholder - would integrate with Daily.co or similar)
  useEffect(() => {
    if (isOpen) {
      initializeVideoCall();
    }
  }, [isOpen]);

  const initializeVideoCall = async () => {
    try {
      // Get user media for local video
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Simulate connection (in real app, this would connect to Daily.co)
      setTimeout(() => {
        setIsConnected(true);
        toast({
          title: "Connected",
          description: `Connected to therapy session with ${therapistName}`,
        });
      }, 2000);

    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast({
        title: "Error",
        description: "Failed to access camera/microphone",
        variant: "destructive"
      });
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // In real implementation, would mute/unmute audio track
  };

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    // In real implementation, would enable/disable video track
  };

  const sendChatMessage = () => {
    if (chatMessage.trim()) {
      setChatMessages(prev => [...prev, {
        sender: 'You',
        message: chatMessage,
        timestamp: new Date()
      }]);
      setChatMessage('');
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    // Clean up video streams
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    
    onEndCall();
    onClose();
    
    toast({
      title: "Call Ended",
      description: `Session with ${therapistName} has ended`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <div className="flex flex-col h-[80vh]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div>
              <h2 className="text-lg font-semibold">Therapy Session</h2>
              <p className="text-sm text-muted-foreground">
                with {therapistName}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={isConnected ? "default" : "secondary"}>
                {isConnected ? "Connected" : "Connecting..."}
              </Badge>
              {isConnected && (
                <div className="text-sm font-mono">
                  {formatDuration(callDuration)}
                </div>
              )}
            </div>
          </div>

          {/* Video Area */}
          <div className="flex-1 bg-black relative">
            {/* Remote Video (Therapist) */}
            <video
              ref={remoteVideoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
            />
            
            {/* Local Video (User) */}
            <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden">
              <video
                ref={localVideoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
                style={{ transform: 'scaleX(-1)' }}
              />
              {isVideoOff && (
                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                  <VideoOff className="h-8 w-8 text-white" />
                </div>
              )}
            </div>

            {/* Connection Status */}
            {!isConnected && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                  <p>Connecting to {therapistName}...</p>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="p-4 bg-background border-t">
            <div className="flex items-center justify-center gap-4">
              <Button
                variant={isMuted ? "destructive" : "secondary"}
                size="lg"
                onClick={toggleMute}
              >
                {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
              
              <Button
                variant={isVideoOff ? "destructive" : "secondary"}
                size="lg"
                onClick={toggleVideo}
              >
                {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
              </Button>
              
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setShowChat(!showChat)}
              >
                <MessageSquare className="h-5 w-5" />
              </Button>
              
              <Button
                variant="destructive"
                size="lg"
                onClick={handleEndCall}
              >
                <PhoneOff className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Chat Sidebar */}
          {showChat && (
            <div className="absolute right-0 top-0 w-80 h-full bg-background border-l flex flex-col">
              <div className="p-4 border-b">
                <h3 className="font-semibold">Session Chat</h3>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {chatMessages.map((msg, index) => (
                  <div key={index} className="space-y-1">
                    <div className="text-xs text-muted-foreground">
                      {msg.sender} • {msg.timestamp.toLocaleTimeString()}
                    </div>
                    <div className="bg-muted p-2 rounded">
                      {msg.message}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Textarea
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 min-h-0 h-10"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendChatMessage();
                      }
                    }}
                  />
                  <Button onClick={sendChatMessage} size="sm">
                    Send
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoCall;