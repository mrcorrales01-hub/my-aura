import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Play,
  Pause,
  Brain,
  Loader2,
  Waves,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface VoiceMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  audioUrl?: string;
  isPlaying?: boolean;
}

const VoiceAICoach: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [voice, setVoice] = useState('alloy');
  const [tone, setTone] = useState('supportive');
  const [language, setLanguage] = useState('en');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { user, session } = useAuth();
  const { toast } = useToast();

  const voiceOptions = [
    { value: 'alloy', label: 'Alloy', description: 'Neutral and clear' },
    { value: 'echo', label: 'Echo', description: 'Warm and friendly' },
    { value: 'fable', label: 'Fable', description: 'Expressive and engaging' },
    { value: 'onyx', label: 'Onyx', description: 'Deep and authoritative' },
    { value: 'nova', label: 'Nova', description: 'Bright and energetic' },
    { value: 'shimmer', label: 'Shimmer', description: 'Gentle and soothing' }
  ];

  const toneOptions = [
    { value: 'supportive', label: 'Supportive', description: 'Compassionate and validating' },
    { value: 'professional', label: 'Professional', description: 'Evidence-based and structured' },
    { value: 'motivational', label: 'Motivational', description: 'Inspiring and energizing' },
    { value: 'friendly', label: 'Friendly', description: 'Casual and approachable' }
  ];

  useEffect(() => {
    // Initialize with welcome message
    const welcomeMessage: VoiceMessage = {
      id: crypto.randomUUID(),
      content: "Hi! I'm Auri, your voice-enabled AI wellness coach. Click the microphone to start our conversation, or use the message button for text chat.",
      sender: 'ai',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      audioChunksRef.current = [];
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processVoiceInput(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsListening(true);

      toast({
        title: "Listening",
        description: "Speak now, I'm listening...",
      });

    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone Error",
        description: "Unable to access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
      setIsProcessing(true);
    }
  };

  const processVoiceInput = async (audioBlob: Blob) => {
    try {
      // Convert audio to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        // Transcribe speech to text
        const { data: sttData, error: sttError } = await supabase.functions.invoke('speech-to-text', {
          body: { 
            audio: base64Audio, 
            language: language === 'auto' ? undefined : language 
          },
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        });

        if (sttError) {
          throw sttError;
        }

        const transcribedText = sttData.text;
        
        // Add user message
        const userMessage: VoiceMessage = {
          id: crypto.randomUUID(),
          content: transcribedText,
          sender: 'user',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, userMessage]);

        // Get AI response with voice
        const { data: aiData, error: aiError } = await supabase.functions.invoke('voice-ai-coach', {
          body: {
            message: transcribedText,
            tone: tone,
            language: language,
            voice: voice,
            context: 'voice_conversation',
            sessionId: crypto.randomUUID()
          },
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        });

        if (aiError) {
          throw aiError;
        }

        // Add AI message
        const aiMessage: VoiceMessage = {
          id: crypto.randomUUID(),
          content: aiData.response,
          sender: 'ai',
          timestamp: new Date(),
          audioUrl: aiData.audioContent ? `data:audio/mp3;base64,${aiData.audioContent}` : undefined
        };
        
        setMessages(prev => [...prev, aiMessage]);

        // Play AI response
        if (aiData.audioContent) {
          playAudio(aiMessage.audioUrl!);
        }

      };
      reader.readAsDataURL(audioBlob);
      
    } catch (error) {
      console.error('Error processing voice input:', error);
      toast({
        title: "Processing Error",
        description: "Failed to process your voice input. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const playAudio = (audioUrl: string) => {
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play();
      setIsSpeaking(true);
    }
  };

  const togglePlayMessage = (messageId: string, audioUrl: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, isPlaying: !msg.isPlaying }
        : { ...msg, isPlaying: false }
    ));

    const message = messages.find(m => m.id === messageId);
    if (message?.isPlaying) {
      audioRef.current?.pause();
      setIsSpeaking(false);
    } else {
      playAudio(audioUrl);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      {/* Audio element for playback */}
      <audio
        ref={audioRef}
        onEnded={() => {
          setIsSpeaking(false);
          setMessages(prev => prev.map(msg => ({ ...msg, isPlaying: false })));
        }}
        onPlay={() => setIsSpeaking(true)}
        onPause={() => setIsSpeaking(false)}
      />

      {/* Header */}
      <Card className="bg-gradient-to-r from-aura-primary/10 to-aura-primary/5 border-aura-primary/20">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-aura-gradient flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl text-aura-primary">Voice AI Coach</CardTitle>
                <p className="text-sm text-foreground/70">
                  Natural voice conversations with Auri
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={isListening ? "default" : "secondary"} className="bg-aura-primary/10 text-aura-primary">
                {isListening ? <Waves className="w-3 h-3 mr-1 animate-pulse" /> : <Mic className="w-3 h-3 mr-1" />}
                {isListening ? 'Listening' : isSpeaking ? 'Speaking' : 'Ready'}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Voice Settings */}
      <Card className="bg-card/50 backdrop-blur-sm border-aura-primary/20">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Voice</label>
              <Select value={voice} onValueChange={setVoice}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {voiceOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Tone</label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {toneOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Language</label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="auto">Auto-detect</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voice Control */}
      <Card className="bg-card/50 backdrop-blur-sm border-aura-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Button
              size="lg"
              variant={isListening ? "destructive" : "default"}
              className={`w-20 h-20 rounded-full ${
                isListening 
                  ? 'bg-destructive hover:bg-destructive/90 animate-pulse' 
                  : 'bg-aura-primary hover:bg-aura-primary/90'
              }`}
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing || isSpeaking}
            >
              {isProcessing ? (
                <Loader2 className="w-8 h-8 animate-spin text-white" />
              ) : isListening ? (
                <MicOff className="w-8 h-8 text-white" />
              ) : (
                <Mic className="w-8 h-8 text-white" />
              )}
            </Button>
          </div>
          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground">
              {isProcessing ? 'Processing your voice...' : 
               isListening ? 'Tap to stop recording' : 
               isSpeaking ? 'Auri is speaking...' : 
               'Tap to start voice conversation'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Conversation History */}
      <Card className="bg-card/50 backdrop-blur-sm border-aura-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>Conversation</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 max-h-64 overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] rounded-lg p-3 ${
                message.sender === 'user'
                  ? 'bg-aura-primary text-white'
                  : 'bg-background border border-aura-primary/20'
              }`}>
                <p className="text-sm">{message.content}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs ${
                    message.sender === 'user' ? 'text-white/70' : 'text-muted-foreground'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                  {message.audioUrl && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => togglePlayMessage(message.id, message.audioUrl!)}
                      className="h-6 w-6 p-0"
                    >
                      {message.isPlaying ? (
                        <Pause className="w-3 h-3" />
                      ) : (
                        <Play className="w-3 h-3" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceAICoach;