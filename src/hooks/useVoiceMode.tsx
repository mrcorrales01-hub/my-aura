import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { speak, canSTT, startSTT } from '@/features/voice/voice';

export const useVoiceMode = () => {
  const { i18n } = useTranslation();
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceModeEnabled, setVoiceModeEnabled] = useState(
    localStorage.getItem('aura.voiceMode') === 'true'
  );
  
  let stopRecordingRef: (() => void) | null = null;

  useEffect(() => {
    localStorage.setItem('aura.voiceMode', voiceModeEnabled.toString());
  }, [voiceModeEnabled]);

  const startRecording = useCallback((onTranscript: (text: string) => void) => {
    if (!canSTT()) {
      console.warn('Speech recognition not supported');
      return;
    }

    if (isRecording) {
      stopRecording();
      return;
    }

    setIsRecording(true);
    const lang = i18n.language.includes('sv') ? 'sv-SE' : 'en-US';
    
    stopRecordingRef = startSTT(lang, (transcript) => {
      if (transcript.trim()) {
        onTranscript(transcript);
      }
      setIsRecording(false);
      stopRecordingRef = null;
    }, () => {
      setIsRecording(false);
      stopRecordingRef = null;
    });
  }, [isRecording, i18n.language]);

  const stopRecording = useCallback(() => {
    if (stopRecordingRef) {
      stopRecordingRef();
      stopRecordingRef = null;
    }
    setIsRecording(false);
  }, []);

  const playText = useCallback((text: string) => {
    if (!text || isPlaying) return;
    
    setIsPlaying(true);
    const lang = i18n.language.includes('sv') ? 'sv-SE' : 'en-US';
    
    speak(text, lang);
    
    // Detect when speech ends (approximate)
    const estimatedDuration = text.length * 80; // ~80ms per character
    setTimeout(() => {
      setIsPlaying(false);
    }, Math.min(estimatedDuration, 10000)); // Max 10 seconds
  }, [isPlaying, i18n.language]);

  const stopPlaying = useCallback(() => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    setIsPlaying(false);
  }, []);

  const toggleVoiceMode = useCallback(() => {
    setVoiceModeEnabled(!voiceModeEnabled);
  }, [voiceModeEnabled]);

  return {
    isRecording,
    isPlaying,
    voiceModeEnabled,
    startRecording,
    stopRecording,
    playText,
    stopPlaying,
    toggleVoiceMode,
    isSupported: canSTT() && 'speechSynthesis' in window
  };
};