import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, Volume2, VolumeX, Clock, Heart, Brain, Moon, Coffee, BookOpen, Sparkles, Timer, Plus } from 'lucide-react';
import { useMusic } from '@/hooks/useMusic';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/hooks/useI18n';
import { useToast } from '@/hooks/use-toast';

const HarmoniousMusic = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const {
    tracks,
    playlists,
    loading,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    currentSession,
    setIsPlaying,
    setCurrentTime,
    setDuration,
    startMusicSession,
    completeMusicSession,
    createPlaylist,
    getAIRecommendations,
    getTracksByCategory,
    getTracksByMood
  } = useMusic();

  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [showTimer, setShowTimer] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(20);
  const [timerActive, setTimerActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [playlistDescription, setPlaylistDescription] = useState('');
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      if (currentSession) {
        completeMusicSession(currentSession.id, audio.currentTime);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentSession, completeMusicSession, setCurrentTime, setDuration, setIsPlaying]);

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setTimerActive(false);
            pauseTrack();
            toast({
              title: "Sleep timer finished",
              description: "Music has been paused. Sweet dreams! 😴",
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeRemaining, toast]);

  const playTrack = async (track: any) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to play music",
        variant: "destructive",
      });
      return;
    }

    // Check premium requirement (simplified for now)
    if (track.premium_only) {
      toast({
        title: "Premium Required",
        description: "This track requires a premium subscription",
        variant: "destructive",
      });
      return;
    }

    // Start music session
    const session = await startMusicSession(track);
    if (!session) return;

    // Set up audio
    if (audioRef.current) {
      audioRef.current.src = track.file_url;
      audioRef.current.volume = (isMuted ? 0 : volume) / 100;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseTrack = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    if (!currentTrack) return;
    
    if (isPlaying) {
      pauseTrack();
    } else {
      audioRef.current?.play();
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    const vol = newVolume[0];
    setVolume(vol);
    setIsMuted(vol === 0);
    if (audioRef.current) {
      audioRef.current.volume = vol / 100;
    }
  };

  const startTimer = () => {
    setTimeRemaining(timerMinutes * 60);
    setTimerActive(true);
    setShowTimer(false);
  };

  const stopTimer = () => {
    setTimerActive(false);
    setTimeRemaining(0);
  };

  const handleCreatePlaylist = async () => {
    if (!playlistName.trim()) return;
    
    await createPlaylist(playlistName, playlistDescription);
    setPlaylistName('');
    setPlaylistDescription('');
    setShowCreatePlaylist(false);
  };

  const loadAIRecommendations = async () => {
    setLoadingRecommendations(true);
    try {
      const recommendations = await getAIRecommendations(
        selectedMood || 'calm',
        'general',
        75, // default heart rate
        new Date().getHours()
      );
      setAiRecommendations(recommendations);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'relax': return <Heart className="h-4 w-4" />;
      case 'focus': return <Brain className="h-4 w-4" />;
      case 'sleep': return <Moon className="h-4 w-4" />;
      case 'grounding': return <Coffee className="h-4 w-4" />;
      case 'journaling': return <BookOpen className="h-4 w-4" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const categories = ['relax', 'focus', 'sleep', 'grounding', 'journaling'];
  const moods = ['calm', 'energizing', 'peaceful', 'uplifting', 'grounding'];

  const filteredTracks = tracks.filter(track => {
    const categoryMatch = !selectedCategory || track.category === selectedCategory;
    const moodMatch = !selectedMood || track.mood_tags.includes(selectedMood);
    return categoryMatch && moodMatch;
  });

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading music library...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <audio ref={audioRef} />
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Harmonious Music
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          AI-curated music for your wellness journey
        </p>
      </div>

      {/* Music Player */}
      {currentTrack && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              {currentTrack.cover_image_url && (
                <img 
                  src={currentTrack.cover_image_url} 
                  alt={currentTrack.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              
              <div className="flex-1">
                <h3 className="font-semibold">{currentTrack.title}</h3>
                <p className="text-sm text-muted-foreground">{currentTrack.artist}</p>
                
                {/* Progress Bar */}
                <div className="mt-2">
                  <Slider
                    value={[currentTime]}
                    max={duration}
                    step={1}
                    onValueChange={(value) => {
                      if (audioRef.current) {
                        audioRef.current.currentTime = value[0];
                        setCurrentTime(value[0]);
                      }
                    }}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center space-x-2">
                <Button onClick={togglePlay} size="sm">
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    max={100}
                    step={1}
                    onValueChange={handleVolumeChange}
                    className="w-20"
                  />
                </div>

                <Dialog open={showTimer} onOpenChange={setShowTimer}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Timer className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Sleep Timer</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Timer Duration (minutes)</label>
                        <Slider
                          value={[timerMinutes]}
                          max={120}
                          min={5}
                          step={5}
                          onValueChange={(value) => setTimerMinutes(value[0])}
                          className="mt-2"
                        />
                        <p className="text-sm text-muted-foreground mt-1">{timerMinutes} minutes</p>
                      </div>
                      <Button onClick={startTimer} className="w-full">
                        Start Timer
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {timerActive && (
                  <div className="flex items-center space-x-2 px-3 py-1 bg-primary/10 rounded-full">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm font-mono">{formatTime(timeRemaining)}</span>
                    <Button variant="ghost" size="sm" onClick={stopTimer}>
                      ×
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      <div className="mb-6 flex flex-wrap gap-4">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                <div className="flex items-center space-x-2">
                  {getCategoryIcon(category)}
                  <span className="capitalize">{category}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedMood} onValueChange={setSelectedMood}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by mood" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Moods</SelectItem>
            {moods.map(mood => (
              <SelectItem key={mood} value={mood}>
                <span className="capitalize">{mood}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={loadAIRecommendations} disabled={loadingRecommendations}>
          <Sparkles className="h-4 w-4 mr-2" />
          AI Recommendations
        </Button>

        <Dialog open={showCreatePlaylist} onOpenChange={setShowCreatePlaylist}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Create Playlist
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Playlist</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Playlist name"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
              />
              <Textarea
                placeholder="Description (optional)"
                value={playlistDescription}
                onChange={(e) => setPlaylistDescription(e.target.value)}
              />
              <Button onClick={handleCreatePlaylist} className="w-full">
                Create Playlist
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Music Library */}
      <Tabs defaultValue="library" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="library">Music Library</TabsTrigger>
          <TabsTrigger value="playlists">My Playlists</TabsTrigger>
          <TabsTrigger value="recommendations">For You</TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTracks.map((track) => (
              <Card key={track.id} className="group hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  {track.cover_image_url && (
                    <img 
                      src={track.cover_image_url} 
                      alt={track.title}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  )}
                  
                  <h3 className="font-semibold mb-1">{track.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{track.artist}</p>
                  <p className="text-xs text-muted-foreground mb-3">{track.description}</p>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {track.mood_tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {track.premium_only && (
                      <Badge variant="default" className="text-xs">
                        Premium
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {formatTime(track.duration_seconds)}
                    </span>
                    <Button 
                      size="sm" 
                      onClick={() => playTrack(track)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="playlists" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playlists.map((playlist) => (
              <Card key={playlist.id} className="group hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-1">{playlist.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{playlist.description}</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    {playlist.track_ids.length} tracks
                  </p>
                  <Button size="sm" variant="outline" className="w-full">
                    Play Playlist
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="mt-6">
          {aiRecommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aiRecommendations.map((track) => (
                <Card key={track.id} className="group hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    {track.cover_image_url && (
                      <img 
                        src={track.cover_image_url} 
                        alt={track.title}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                      />
                    )}
                    
                    <h3 className="font-semibold mb-1">{track.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{track.artist}</p>
                    
                    {track.matchReason && (
                      <p className="text-xs text-primary mb-3">{track.matchReason}</p>
                    )}
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {track.mood_tags.slice(0, 3).map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <Button 
                      size="sm" 
                      onClick={() => playTrack(track)}
                      className="w-full"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Play
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">Get AI Recommendations</h3>
                <p className="text-muted-foreground mb-4">
                  Let Auri suggest the perfect music for your current mood and needs
                </p>
                <Button onClick={loadAIRecommendations} disabled={loadingRecommendations}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {loadingRecommendations ? 'Loading...' : 'Get Recommendations'}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HarmoniousMusic;