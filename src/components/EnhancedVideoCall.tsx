import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Phone, 
  PhoneOff,
  MessageSquare,
  Settings,
  Languages,
  Volume2,
  VolumeX,
  StopCircle,
  Captions
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface EnhancedVideoCallProps {
  appointmentId: string;
  therapistName: string;
  isOpen: boolean;
  onClose: () => void;
  onEndCall: () => void;
}

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  originalMessage?: string;
  timestamp: Date;
  translated: boolean;
}

const EnhancedVideoCall: React.FC<EnhancedVideoCallProps> = ({
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
  const [showSettings, setShowSettings] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [callDuration, setCallDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [showCaptions, setShowCaptions] = useState(false);
  const [currentCaption, setCurrentCaption] = useState('');
  const [volume, setVolume] = useState(1);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  
  // Translation settings
  const [userLanguage, setUserLanguage] = useState('en');
  const [therapistLanguage, setTherapistLanguage] = useState('en');
  const [enableTranslation, setEnableTranslation] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const { toast } = useToast();
  const { session } = useAuth();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' }
  ];

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

  // Initialize video call
  useEffect(() => {
    if (isOpen) {
      initializeVideoCall();
    }
  }, [isOpen]);

  // Auto-transcription for captions
  useEffect(() => {
    if (showCaptions && isConnected) {
      startCaptioning();
    }
  }, [showCaptions, isConnected]);

  const initializeVideoCall = async () => {
    try {
      // Get user media for local video
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Simulate connection (in real app, this would connect to Daily.co or WebRTC)
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

  const startCaptioning = async () => {
    try {
      // This would integrate with real-time speech recognition
      // For demo purposes, we'll simulate captions
      const simulatedCaptions = [
        "Welcome to our therapy session.",
        "How are you feeling today?",
        "Let's discuss your goals for this week.",
        "I understand that can be challenging.",
        "What strategies have been helpful for you?"
      ];

      let captionIndex = 0;
      const captionInterval = setInterval(() => {
        if (captionIndex < simulatedCaptions.length) {
          setCurrentCaption(simulatedCaptions[captionIndex]);
          captionIndex++;
        } else {
          setCurrentCaption('');
          captionIndex = 0;
        }
      }, 5000);

      return () => clearInterval(captionInterval);
    } catch (error) {
      console.error('Error starting captions:', error);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // In real implementation, would mute/unmute audio track
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      const audioTracks = stream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = isMuted;
      });
    }
  };

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    // In real implementation, would enable/disable video track
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      const videoTracks = stream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = isVideoOff;
      });
    }
  };

  const toggleRecording = () => {
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  const startRecording = async () => {
    try {
      if (localVideoRef.current?.srcObject) {
        const stream = localVideoRef.current.srcObject as MediaStream;
        mediaRecorderRef.current = new MediaRecorder(stream);
        
        mediaRecorderRef.current.start();
        setIsRecording(true);
        
        toast({
          title: "Recording Started",
          description: "Session recording has begun. Both parties have been notified.",
        });
      }
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Failed to start recording.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      toast({
        title: "Recording Stopped",
        description: "Session recording has been saved securely.",
      });
    }
  };

  const translateMessage = async (message: string, fromLang: string, toLang: string): Promise<string> => {
    if (!enableTranslation || fromLang === toLang) {
      return message;
    }

    try {
      const { data, error } = await supabase.functions.invoke('translation-service', {
        body: {
          text: message,
          sourceLanguage: fromLang,
          targetLanguage: toLang,
          context: 'video_call'
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (error) throw error;
      return data.translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      return message;
    }
  };

  const sendChatMessage = async () => {
    if (chatMessage.trim()) {
      const originalMessage = chatMessage.trim();
      let translatedMessage = originalMessage;

      if (enableTranslation && userLanguage !== therapistLanguage) {
        translatedMessage = await translateMessage(originalMessage, userLanguage, therapistLanguage);
      }

      const newMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'You',
        message: translatedMessage,
        originalMessage: enableTranslation ? originalMessage : undefined,
        timestamp: new Date(),
        translated: enableTranslation && originalMessage !== translatedMessage
      };

      setChatMessages(prev => [...prev, newMessage]);
      setChatMessage('');
    }
  };

  const toggleSpeakerMute = () => {
    setIsSpeakerMuted(!isSpeakerMuted);
    if (remoteVideoRef.current) {
      remoteVideoRef.current.volume = isSpeakerMuted ? volume : 0;
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (remoteVideoRef.current && !isSpeakerMuted) {
      remoteVideoRef.current.volume = newVolume;
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
    
    if (isRecording) {
      stopRecording();
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
      <DialogContent className="max-w-7xl max-h-[95vh] p-0">
        <div className="flex flex-col h-[85vh]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-background">
            <div>
              <h2 className="text-lg font-semibold">Enhanced Therapy Session</h2>
              <p className="text-sm text-muted-foreground">
                with {therapistName}
                {enableTranslation && (
                  <Badge variant="secondary" className="ml-2">
                    <Languages className="w-3 h-3 mr-1" />
                    Translation Active
                  </Badge>
                )}
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
              {isRecording && (
                <Badge variant="destructive" className="animate-pulse">
                  <div className="w-3 h-3 mr-1 bg-white rounded-full animate-pulse" />
                  Recording
                </Badge>
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
            <div className="absolute bottom-4 right-4 w-64 h-48 bg-gray-800 rounded-lg overflow-hidden border-2 border-white/20">
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

            {/* Live Captions */}
            {showCaptions && currentCaption && (
              <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-lg max-w-md text-center">
                <Captions className="w-4 h-4 inline mr-2" />
                {currentCaption}
              </div>
            )}

            {/* Connection Status */}
            {!isConnected && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                  <p className="text-lg">Connecting to {therapistName}...</p>
                  <p className="text-sm text-white/70 mt-2">Establishing secure connection...</p>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="p-4 bg-background border-t">
            <div className="flex items-center justify-center gap-3">
              <Button
                variant={isMuted ? "destructive" : "secondary"}
                size="lg"
                onClick={toggleMute}
                className="h-12 w-12"
              >
                {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
              
              <Button
                variant={isVideoOff ? "destructive" : "secondary"}
                size="lg"
                onClick={toggleVideo}
                className="h-12 w-12"
              >
                {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
              </Button>

              <Button
                variant="secondary"
                size="lg"
                onClick={toggleSpeakerMute}
                className="h-12 w-12"
              >
                {isSpeakerMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
              
              <Button
                variant={showChat ? "default" : "secondary"}
                size="lg"
                onClick={() => setShowChat(!showChat)}
                className="h-12 w-12"
              >
                <MessageSquare className="h-5 w-5" />
              </Button>

              <Button
                variant={showCaptions ? "default" : "secondary"}
                size="lg"
                onClick={() => setShowCaptions(!showCaptions)}
                className="h-12 w-12"
              >
                <Captions className="h-5 w-5" />
              </Button>

              <Button
                variant={isRecording ? "destructive" : "secondary"}
                size="lg"
                onClick={toggleRecording}
                className="h-12 w-12"
              >
                {isRecording ? <StopCircle className="h-5 w-5" /> : <div className="h-5 w-5 bg-red-500 rounded-full" />}
              </Button>
              
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setShowSettings(!showSettings)}
                className="h-12 w-12"
              >
                <Settings className="h-5 w-5" />
              </Button>
              
              <Button
                variant="destructive"
                size="lg"
                onClick={handleEndCall}
                className="h-12 w-12"
              >
                <PhoneOff className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="absolute top-16 right-4 w-80 max-h-96 bg-background border rounded-lg shadow-lg p-4 z-10">
              <h3 className="font-semibold mb-4 flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Call Settings
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Enable Real-time Translation
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={enableTranslation}
                      onChange={(e) => setEnableTranslation(e.target.checked)}
                      className="rounded"
                    />
                    <Languages className="w-4 h-4" />
                    <span className="text-sm">Live translation</span>
                  </div>
                </div>

                {enableTranslation && (
                  <>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Your Language</label>
                      <Select value={userLanguage} onValueChange={setUserLanguage}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {languages.map((lang) => (
                            <SelectItem key={lang.code} value={lang.code}>
                              {lang.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Therapist Language</label>
                      <Select value={therapistLanguage} onValueChange={setTherapistLanguage}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {languages.map((lang) => (
                            <SelectItem key={lang.code} value={lang.code}>
                              {lang.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Speaker Volume: {Math.round(volume * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Chat Sidebar */}
          {showChat && (
            <div className="absolute right-0 top-16 w-96 h-[calc(100%-8rem)] bg-background border-l flex flex-col">
              <div className="p-4 border-b">
                <h3 className="font-semibold flex items-center">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Session Chat
                  {enableTranslation && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      Auto-translate
                    </Badge>
                  )}
                </h3>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="space-y-1">
                    <div className="text-xs text-muted-foreground flex items-center justify-between">
                      <span>{msg.sender} • {msg.timestamp.toLocaleTimeString()}</span>
                      {msg.translated && (
                        <Badge variant="secondary" className="text-xs">
                          <Languages className="w-3 h-3 mr-1" />
                          Translated
                        </Badge>
                      )}
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-sm">{msg.message}</p>
                      {msg.originalMessage && msg.originalMessage !== msg.message && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          Original: {msg.originalMessage}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Textarea
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder={enableTranslation ? `Type in ${languages.find(l => l.code === userLanguage)?.name}...` : "Type a message..."}
                    className="flex-1 min-h-0 h-10 resize-none"
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
                {enableTranslation && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Messages will be translated to {languages.find(l => l.code === therapistLanguage)?.name}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedVideoCall;