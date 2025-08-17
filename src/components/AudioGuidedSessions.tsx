import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward,
  Volume2,
  VolumeX,
  Heart,
  Brain,
  Waves,
  Moon,
  Sun,
  Leaf,
  Zap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AudioSession {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  category: 'meditation' | 'breathing' | 'sleep' | 'anxiety' | 'confidence' | 'relationships';
  icon: React.ReactNode;
  content: string;
  voice: string;
}

const AudioGuidedSessions: React.FC = () => {
  const [selectedSession, setSelectedSession] = useState<AudioSession | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('shimmer');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const audioRef = useRef<HTMLAudioElement>(null);
  const { user, session } = useAuth();
  const { toast } = useToast();

  const voiceOptions = [
    { value: 'shimmer', label: 'Shimmer', description: 'Gentle and soothing' },
    { value: 'alloy', label: 'Alloy', description: 'Neutral and clear' },
    { value: 'nova', label: 'Nova', description: 'Bright and calming' },
    { value: 'echo', label: 'Echo', description: 'Warm and friendly' }
  ];

  const audioSessions: AudioSession[] = [
    {
      id: '1',
      title: 'Mindful Breathing',
      description: 'A 10-minute guided breathing exercise to center yourself and reduce anxiety.',
      duration: 10,
      category: 'breathing',
      icon: <Waves className="w-5 h-5" />,
      content: `Welcome to this mindful breathing session. Find a comfortable position, close your eyes if you feel safe doing so, and let's begin.

Take a moment to notice your natural breath. Don't try to change it yet, just observe.

Now, let's begin with a slow, deep breath in through your nose... hold for a moment... and slowly exhale through your mouth.

Continue breathing naturally. With each inhale, imagine you're breathing in calm and peace. With each exhale, release any tension or worry.

If your mind wanders, that's completely normal. Gently bring your attention back to your breath.

Let's practice the 4-7-8 technique. Inhale for 4 counts... hold for 7... and exhale for 8. This helps activate your body's relaxation response.

Continue this pattern, focusing only on the rhythm of your breathing. You're creating a peaceful space within yourself.

As we finish, take three more natural breaths, and when you're ready, gently open your eyes. You've given yourself a wonderful gift of mindfulness.`,
      voice: 'shimmer'
    },
    {
      id: '2',
      title: 'Sleep Meditation',
      description: 'A calming 20-minute meditation to help you drift off to peaceful sleep.',
      duration: 20,
      category: 'sleep',
      icon: <Moon className="w-5 h-5" />,
      content: `Welcome to this sleep meditation. Make yourself comfortable in your bed, and let's prepare your mind and body for rest.

Close your eyes and take three deep, slow breaths. With each exhale, allow your body to sink deeper into your bed.

Starting with your toes, consciously relax each part of your body. Feel your toes becoming heavy and warm... your feet relaxing completely...

Now your calves and knees, releasing all tension. Your thighs becoming soft and heavy...

Continue up through your hips, lower back, and abdomen. Let go of the day's stress and concerns.

Your chest rises and falls naturally. Your shoulders drop away from your ears, releasing all the weight you've been carrying.

Your arms become heavy at your sides. Your hands uncurl and rest peacefully.

Now your neck and jaw, releasing any tightness. Your face becomes soft, your eyes gentle behind closed lids.

Finally, your scalp and the top of your head, completely relaxed.

Imagine yourself in a peaceful place - perhaps a quiet beach with gentle waves, or a serene meadow under starlight.

Let your breathing become even slower and deeper. You are safe, you are calm, and you are ready for restorative sleep.

Allow yourself to drift naturally into sleep, knowing you've prepared well for rest.`,
      voice: 'shimmer'
    },
    {
      id: '3',
      title: 'Anxiety Relief',
      description: 'A 15-minute session to calm anxiety and restore inner peace.',
      duration: 15,
      category: 'anxiety',
      icon: <Heart className="w-5 h-5" />,
      content: `This is your safe space for anxiety relief. You're taking a powerful step by choosing to care for your mental wellbeing.

First, let's ground ourselves using the 5-4-3-2-1 technique. Notice 5 things you can see around you... 4 things you can touch... 3 things you can hear... 2 things you can smell... and 1 thing you can taste.

This brings you fully into the present moment, where you are safe.

Now, place one hand on your chest and one on your belly. Breathe naturally and notice which hand moves more. We want the belly breath - this activates your calm response.

Breathe in slowly through your nose, expanding your belly. Exhale through your mouth with a gentle "ahh" sound, releasing tension.

Remember: anxiety is temporary. It's your body's way of trying to protect you, but right now, you are safe.

Repeat to yourself: "This feeling will pass. I am stronger than my anxiety. I choose peace."

Visualize your anxiety as clouds in the sky. Clouds come and go, but the sky - your true self - remains clear and vast.

With each breath, those clouds drift further away. You remain grounded, centered, and calm.

You have the tools to manage anxiety. You are resilient, and you are not alone in this journey.

Take three more deep breaths, and carry this sense of calm with you.`,
      voice: 'echo'
    },
    {
      id: '4',
      title: 'Confidence Building',
      description: 'A 12-minute empowerment session to boost self-confidence and inner strength.',
      duration: 12,
      category: 'confidence',
      icon: <Sun className="w-5 h-5" />,
      content: `Welcome to your confidence building session. You are here because you believe in your potential for growth.

Sit tall, shoulders back, and take up space. Your posture affects your mindset, so let your body language reflect strength.

Think of a time when you felt truly confident. Remember that feeling - how you stood, how you breathed, how you spoke to yourself.

That confident person is still within you. Confidence isn't something you lack - it's something you reconnect with.

Repeat these affirmations with conviction: "I am capable of amazing things. I trust my abilities. I deserve success and happiness."

Visualize yourself walking into a challenging situation with complete confidence. See yourself speaking clearly, making decisions easily, and handling whatever comes your way.

Your past successes, no matter how small, prove your capability. You've overcome challenges before, and you can do it again.

Confidence grows with action. Each small step you take builds your self-trust.

Feel the warmth of self-acceptance filling your chest. You don't need to be perfect - you just need to be authentically you.

Stand up for yourself. Your thoughts matter. Your voice matters. You matter.

As we finish, set an intention to take one confident action today. You have everything you need within you already.`,
      voice: 'nova'
    },
    {
      id: '5',
      title: 'Relationship Harmony',
      description: 'A 18-minute meditation for improving relationships and communication.',
      duration: 18,
      category: 'relationships',
      icon: <Leaf className="w-5 h-5" />,
      content: `Welcome to this session on relationship harmony. All relationships benefit from mindful attention and intention.

Begin by thinking of someone important in your life - a partner, friend, family member, or even your relationship with yourself.

Breathe deeply and send them loving-kindness: "May you be happy. May you be peaceful. May you be free from suffering."

Now reflect on your role in this relationship. Where can you bring more patience, understanding, or compassion?

Healthy relationships require healthy boundaries. Visualize yourself communicating your needs clearly and kindly.

Practice forgiveness - both for others and yourself. Holding onto resentment hurts you more than anyone else.

Remember: you cannot control others, but you can control how you show up. Choose to show up with love.

Good communication starts with good listening. Imagine truly hearing someone without planning your response.

In conflicts, seek first to understand, then to be understood. There's wisdom in multiple perspectives.

Express gratitude for the people who enrich your life. Even challenging relationships teach us important lessons.

You deserve relationships built on mutual respect, kindness, and genuine care.

Visualize your relationships flourishing with open communication, shared laughter, and deep connection.

Carry this intention into your interactions today: to be present, patient, and loving.`,
      voice: 'alloy'
    },
    {
      id: '6',
      title: 'Energy Boost',
      description: 'A 8-minute energizing meditation to revitalize your mind and body.',
      duration: 8,
      category: 'meditation',
      icon: <Zap className="w-5 h-5" />,
      content: `Welcome to your energy boost session. Sometimes we need to recharge our inner batteries.

Sit up straight and take three energizing breaths - quick inhale through the nose, powerful exhale through the mouth.

Imagine golden light entering your body with each breath, filling you with vibrant energy.

Starting at the top of your head, feel this warm, energizing light flowing down through your entire body.

It reaches your forehead, clearing mental fog and sharpening your focus.

Down to your throat, giving you a clear, strong voice.

Into your chest, filling your heart with enthusiasm and joy.

Through your arms, preparing your hands for productive action.

Into your core, strengthening your personal power and determination.

Down your legs, grounding you while energizing your ability to move forward.

You are a being of infinite energy and potential. Feel this truth in every cell.

Visualize your day ahead going smoothly, with you feeling alert, positive, and capable.

You have the energy to accomplish your goals and spread positivity to others.

Take three more powerful breaths, and carry this revitalized energy with you.

You are ready to embrace your day with enthusiasm and strength.`,
      voice: 'nova'
    }
  ];

  const filteredSessions = selectedCategory === 'all' 
    ? audioSessions 
    : audioSessions.filter(session => session.category === selectedCategory);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', () => setIsPlaying(false));

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, [selectedSession]);

  const generateAudio = async (content: string, voice: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text: content,
          voice: voice,
          language: 'en'
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (error) throw error;

      return `data:audio/mp3;base64,${data.audioContent}`;
    } catch (error) {
      console.error('Error generating audio:', error);
      toast({
        title: "Audio Generation Error",
        description: "Failed to generate audio for this session.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const playSession = async (sessionData: AudioSession) => {
    setSelectedSession(sessionData);
    
    const audioUrl = await generateAudio(sessionData.content, selectedVoice);
    if (!audioUrl) return;

    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.volume = volume;
      audioRef.current.play();
      setIsPlaying(true);

      toast({
        title: "Session Started",
        description: `Now playing: ${sessionData.title}`,
      });
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(
        audioRef.current.currentTime + 30,
        audioRef.current.duration
      );
    }
  };

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(
        audioRef.current.currentTime - 30,
        0
      );
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const categoryIcons = {
    meditation: <Brain className="w-4 h-4" />,
    breathing: <Waves className="w-4 h-4" />,
    sleep: <Moon className="w-4 h-4" />,
    anxiety: <Heart className="w-4 h-4" />,
    confidence: <Sun className="w-4 h-4" />,
    relationships: <Leaf className="w-4 h-4" />
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <audio ref={audioRef} />

      {/* Header */}
      <Card className="bg-gradient-to-r from-aura-primary/10 to-aura-primary/5 border-aura-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-aura-primary">Audio Guided Sessions</CardTitle>
              <p className="text-foreground/70 mt-1">
                Personalized meditation and wellness sessions with AI-generated voice guidance
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Voice</label>
                <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                  <SelectTrigger className="w-36">
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
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sessions</SelectItem>
                    <SelectItem value="meditation">Meditation</SelectItem>
                    <SelectItem value="breathing">Breathing</SelectItem>
                    <SelectItem value="sleep">Sleep</SelectItem>
                    <SelectItem value="anxiety">Anxiety</SelectItem>
                    <SelectItem value="confidence">Confidence</SelectItem>
                    <SelectItem value="relationships">Relationships</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Audio Player */}
      {selectedSession && (
        <Card className="bg-card/50 backdrop-blur-sm border-aura-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  {selectedSession.icon}
                  <span>{selectedSession.title}</span>
                </h3>
                <p className="text-sm text-muted-foreground">{selectedSession.description}</p>
              </div>
              <Badge variant="secondary">{selectedSession.duration} min</Badge>
            </div>

            <div className="space-y-4">
              <Progress value={(currentTime / duration) * 100} className="w-full" />
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>

              <div className="flex items-center justify-center space-x-4">
                <Button variant="outline" size="sm" onClick={skipBackward}>
                  <SkipBack className="w-4 h-4" />
                </Button>
                
                <Button 
                  size="lg" 
                  onClick={togglePlayPause}
                  disabled={isLoading}
                  className="w-16 h-16 rounded-full bg-aura-primary hover:bg-aura-primary/90"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                  ) : isPlaying ? (
                    <Pause className="w-6 h-6 text-white" />
                  ) : (
                    <Play className="w-6 h-6 text-white" />
                  )}
                </Button>
                
                <Button variant="outline" size="sm" onClick={skipForward}>
                  <SkipForward className="w-4 h-4" />
                </Button>
                
                <Button variant="outline" size="sm" onClick={toggleMute}>
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Session Library */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSessions.map((session) => (
          <Card 
            key={session.id} 
            className={`cursor-pointer transition-all hover:shadow-md border-aura-primary/20 ${
              selectedSession?.id === session.id ? 'ring-2 ring-aura-primary' : ''
            }`}
            onClick={() => playSession(session)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-aura-primary/10 flex items-center justify-center">
                    {session.icon}
                  </div>
                  <CardTitle className="text-lg">{session.title}</CardTitle>
                </div>
                <Badge variant="outline" className="text-xs">
                  {session.duration}m
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{session.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  {categoryIcons[session.category]}
                  <span className="capitalize">{session.category}</span>
                </div>
                <Button size="sm" variant="outline">
                  {selectedSession?.id === session.id && isPlaying ? 'Playing' : 'Play'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AudioGuidedSessions;