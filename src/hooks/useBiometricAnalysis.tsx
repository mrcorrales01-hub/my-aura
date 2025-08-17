import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface BiometricConsent {
  voice: boolean;
  face: boolean;
  dataRetention: number; // days
  researchUse: boolean;
}

interface VoiceAnalysis {
  stressLevel: number; // 0-10
  emotionalState: 'happy' | 'sad' | 'anxious' | 'calm' | 'angry' | 'neutral';
  speechPatterns: {
    pace: number;
    volume: number;
    clarity: number;
  };
  indicators: {
    depression: number;
    anxiety: number;
    fatigue: number;
  };
}

interface FaceAnalysis {
  emotionalState: 'happy' | 'sad' | 'anxious' | 'calm' | 'angry' | 'neutral';
  microExpressions: string[];
  eyeMovement: {
    focus: number;
    fatigue: number;
  };
  facialTension: number;
  indicators: {
    stress: number;
    sadness: number;
    engagement: number;
  };
}

interface BiometricSession {
  id: string;
  analysisType: 'voice' | 'face' | 'combined';
  voiceAnalysis?: VoiceAnalysis;
  faceAnalysis?: FaceAnalysis;
  confidenceScore: number;
  timestamp: Date;
  sessionContext: string;
}

export const useBiometricAnalysis = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [consent, setConsent] = useState<BiometricConsent>({
    voice: false,
    face: false,
    dataRetention: 30,
    researchUse: false,
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentSession, setCurrentSession] = useState<BiometricSession | null>(null);
  const [recentSessions, setRecentSessions] = useState<BiometricSession[]>([]);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  // Load user consent preferences
  const loadConsent = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      // In a real implementation, consent would be stored in user preferences
      // For now, we'll check localStorage
      const storedConsent = localStorage.getItem(`biometric_consent_${user.id}`);
      if (storedConsent) {
        setConsent(JSON.parse(storedConsent));
      }
    } catch (error) {
      console.error('Error loading consent:', error);
    }
  }, [user]);

  // Update consent preferences
  const updateConsent = async (newConsent: Partial<BiometricConsent>) => {
    if (!user) return;

    const updatedConsent = { ...consent, ...newConsent };
    setConsent(updatedConsent);

    // Store consent (in real implementation, this would be in the database)
    localStorage.setItem(`biometric_consent_${user.id}`, JSON.stringify(updatedConsent));

    toast({
      title: "Consent Updated",
      description: "Your biometric analysis preferences have been saved.",
    });
  };

  // Request camera/microphone permissions
  const requestPermissions = async (analysisType: 'voice' | 'face' | 'combined') => {
    try {
      const constraints: MediaStreamConstraints = {};

      if (analysisType === 'voice' || analysisType === 'combined') {
        constraints.audio = {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        };
      }

      if (analysisType === 'face' || analysisType === 'combined') {
        constraints.video = {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        };
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setMediaStream(stream);
      return stream;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      toast({
        title: "Permission Denied",
        description: "Camera/microphone access is required for biometric analysis.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Start biometric analysis
  const startAnalysis = async (analysisType: 'voice' | 'face' | 'combined', context: string = 'general') => {
    if (!user) return;

    // Check consent
    if ((analysisType === 'voice' || analysisType === 'combined') && !consent.voice) {
      toast({
        title: "Voice Analysis Consent Required",
        description: "Please provide consent for voice analysis first.",
        variant: "destructive",
      });
      return;
    }

    if ((analysisType === 'face' || analysisType === 'combined') && !consent.face) {
      toast({
        title: "Face Analysis Consent Required",
        description: "Please provide consent for facial analysis first.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsAnalyzing(true);

      // Request permissions and start recording
      const stream = await requestPermissions(analysisType);

      // In a real implementation, this would:
      // 1. Record audio/video for a short period (30-60 seconds)
      // 2. Send to AI analysis service
      // 3. Process and return insights

      // For demo purposes, we'll simulate the analysis
      await simulateAnalysis(analysisType, context);

    } catch (error) {
      console.error('Error starting analysis:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to start biometric analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
      stopRecording();
    }
  };

  // Stop recording and clean up
  const stopRecording = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
  };

  // Simulate biometric analysis (replace with real AI service)
  const simulateAnalysis = async (analysisType: 'voice' | 'face' | 'combined', context: string) => {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 3000));

    const session: BiometricSession = {
      id: crypto.randomUUID(),
      analysisType,
      confidenceScore: 0.7 + Math.random() * 0.3,
      timestamp: new Date(),
      sessionContext: context,
    };

    // Generate mock analysis results
    if (analysisType === 'voice' || analysisType === 'combined') {
      session.voiceAnalysis = {
        stressLevel: Math.floor(Math.random() * 10) + 1,
        emotionalState: ['happy', 'sad', 'anxious', 'calm', 'neutral'][Math.floor(Math.random() * 5)] as any,
        speechPatterns: {
          pace: 80 + Math.random() * 40,
          volume: 50 + Math.random() * 30,
          clarity: 70 + Math.random() * 30,
        },
        indicators: {
          depression: Math.random() * 0.5,
          anxiety: Math.random() * 0.7,
          fatigue: Math.random() * 0.6,
        },
      };
    }

    if (analysisType === 'face' || analysisType === 'combined') {
      session.faceAnalysis = {
        emotionalState: ['happy', 'sad', 'anxious', 'calm', 'neutral'][Math.floor(Math.random() * 5)] as any,
        microExpressions: ['slight_frown', 'eye_tension', 'jaw_clench'].slice(0, Math.floor(Math.random() * 3)),
        eyeMovement: {
          focus: 60 + Math.random() * 40,
          fatigue: Math.random() * 60,
        },
        facialTension: Math.random() * 10,
        indicators: {
          stress: Math.random() * 0.8,
          sadness: Math.random() * 0.4,
          engagement: 0.3 + Math.random() * 0.7,
        },
      };
    }

    // Store analysis result
    try {
      const { error } = await supabase
        .from('biometric_analysis')
        .insert({
          user_id: user?.id,
          analysis_type: analysisType,
          stress_indicators: JSON.parse(JSON.stringify({
            voice: session.voiceAnalysis,
            face: session.faceAnalysis,
          })),
          emotion_data: JSON.parse(JSON.stringify({
            voice_emotion: session.voiceAnalysis?.emotionalState,
            face_emotion: session.faceAnalysis?.emotionalState,
          })),
          confidence_score: session.confidenceScore,
          consent_given: true,
          session_id: session.id,
        });

      if (error) throw error;

      setCurrentSession(session);
      await fetchRecentSessions();

      toast({
        title: "Analysis Complete",
        description: "Your biometric analysis is ready for review.",
      });

    } catch (error) {
      console.error('Error storing analysis:', error);
    }
  };

  // Fetch recent analysis sessions
  const fetchRecentSessions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('biometric_analysis')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const sessions: BiometricSession[] = (data || []).map(item => ({
        id: item.id,
        analysisType: item.analysis_type as any,
        voiceAnalysis: (item.stress_indicators as any)?.voice,
        faceAnalysis: (item.stress_indicators as any)?.face,
        confidenceScore: item.confidence_score || 0,
        timestamp: new Date(item.created_at),
        sessionContext: item.session_id || 'general',
      }));

      setRecentSessions(sessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  // Delete analysis data (privacy compliance)
  const deleteAnalysisData = async (sessionId?: string) => {
    if (!user) return;

    try {
      let query = supabase
        .from('biometric_analysis')
        .delete()
        .eq('user_id', user.id);

      if (sessionId) {
        query = query.eq('id', sessionId);
      }

      const { error } = await query;
      if (error) throw error;

      if (sessionId) {
        setRecentSessions(prev => prev.filter(s => s.id !== sessionId));
        if (currentSession?.id === sessionId) {
          setCurrentSession(null);
        }
      } else {
        setRecentSessions([]);
        setCurrentSession(null);
      }

      toast({
        title: "Data Deleted",
        description: sessionId ? "Analysis session deleted." : "All biometric data deleted.",
      });
    } catch (error) {
      console.error('Error deleting data:', error);
      toast({
        title: "Deletion Failed",
        description: "Failed to delete biometric data.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      loadConsent();
      fetchRecentSessions();
    }
  }, [user, loadConsent]);

  return {
    consent,
    updateConsent,
    isAnalyzing,
    currentSession,
    recentSessions,
    startAnalysis,
    stopRecording,
    deleteAnalysisData,
    hasCamera: !!mediaStream?.getVideoTracks().length,
    hasMicrophone: !!mediaStream?.getAudioTracks().length,
  };
};