import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useMusic } from '@/hooks/useMusic';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/hooks/useI18n';
import { 
  Play, 
  Pause, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Heart,
  Clock,
  Music,
  Sparkles,
  Crown,
  Plus,
  Repeat,
  Timer,
  Coffee,
  Moon,
  Sunset,
  Brain
} from 'lucide-react';

const HarmoniousMusic = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [timerMinutes, setTimerMinutes] = useState(30);
  const [timerActive, setTimerActive] = useState(false);
  const [timerRemaining, setTimerRemaining] = useState(0);
  const [mood, setMood] = useState('');
  const [volume, setVolume] = useState([75]);
  const [isMuted, setIsMuted] = useState(false);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAIRecommendations, setShowAIRecommendations] = useState(false);
  const [aiRecommendations, setAIRecommendations] = useState([]);

  const {
    tracks,
    playlists,
    loading,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
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

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timerRemaining > 0) {
      interval = setInterval(() => {
        setTimerRemaining(prev => {
          if (prev <= 1) {
            setTimerActive(false);
            pauseTrack();
            toast({
              title: "Timer Complete",
              description: "Your music session has ended.",
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerRemaining]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      // Auto-play next track in category
      const categoryTracks = getTracksByCategory(currentTrack?.category || '');
      const currentIndex = categoryTracks.findIndex(t => t.id === currentTrack?.id);
      if (currentIndex < categoryTracks.length - 1) {
        playTrack(categoryTracks[currentIndex + 1]);
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
  }, [currentTrack]);

  const playTrack = async (track: any) => {
    if (!user) return;

    // Check if premium track and user has access
    if (track.premium_only || track.pay_per_play_cost > 0) {
      // In a real app, check subscription status or handle payment
      toast({
        title: "Premium Track",
        description: `This track costs $${(track.pay_per_play_cost / 100).toFixed(2)} to play.`,
        variant: "destructive",
      });
      return;
    }

    await startMusicSession(track, selectedCategory, mood);
    
    if (audioRef.current) {
      audioRef.current.src = track.file_url;
      audioRef.current.volume = volume[0] / 100;
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
    if (isPlaying) {
      pauseTrack();
    } else if (currentTrack) {
      audioRef.current?.play();
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume[0] / 100;
    }
    setIsMuted(newVolume[0] === 0);
  };

  const toggleMute = () => {
    if (isMuted) {
      handleVolumeChange([75]);
    } else {
      handleVolumeChange([0]);
    }
  };

  const startTimer = () => {
    setTimerRemaining(timerMinutes * 60);
    setTimerActive(true);
  };

  const stopTimer = () => {
    setTimerActive(false);
    setTimerRemaining(0);
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    
    await createPlaylist(newPlaylistName);
    setNewPlaylistName('');
    setShowCreatePlaylist(false);
  };

  const loadAIRecommendations = async () => {
    const recommendations = await getAIRecommendations(mood, selectedCategory);
    setAIRecommendations(recommendations);
    setShowAIRecommendations(true);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'meditation': return <Brain className="w-4 h-4" />;
      case 'sleep': return <Moon className="w-4 h-4" />;
      case 'relaxation': return <Sunset className="w-4 h-4" />;
      case 'journaling': return <Coffee className="w-4 h-4" />;
      default: return <Music className="w-4 h-4" />;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredTracks = selectedCategory === 'all' 
    ? tracks 
    : getTracksByCategory(selectedCategory);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <audio ref={audioRef} />
      
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
          <Music className="w-8 h-8 text-primary" />
          Harmonious Music
        </h1>
        <p className="text-muted-foreground">
          AI-curated music for meditation, relaxation, and wellness
        </p>
      </div>

      {/* Music Player */}
      {currentTrack && (
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Music className="w-8 h-8 text-primary" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold truncate">{currentTrack.title}</h3>
                <p className="text-muted-foreground truncate">{currentTrack.artist}</p>
                
                <div className="mt-2 space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">{formatTime(currentTime)}</span>
                    <Progress value={(currentTime / duration) * 100} className="flex-1" />
                    <span className="text-sm text-muted-foreground">{formatTime(duration)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Volume Control */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                
                <div className="w-20">
                  <Slider
                    value={volume}
                    onValueChange={handleVolumeChange}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Play/Pause */}
                <Button onClick={togglePlay} size="lg">
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </Button>

                {/* Timer */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Timer className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Music Timer</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Timer Duration (minutes)</label>
                        <Slider
                          value={[timerMinutes]}
                          onValueChange={(value) => setTimerMinutes(value[0])}
                          max={120}
                          min={5}
                          step={5}
                          className="mt-2"
                        />
                        <p className="text-sm text-muted-foreground mt-1">{timerMinutes} minutes</p>
                      </div>
                      
                      {timerActive && (
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">
                            {formatTime(timerRemaining)}
                          </p>
                          <p className="text-sm text-muted-foreground">remaining</p>
                        </div>
                      )}
                      
                      <div className="flex space-x-2">
                        {!timerActive ? (
                          <Button onClick={startTimer} className="flex-1">
                            <Timer className="w-4 h-4 mr-2" />
                            Start Timer
                          </Button>
                        ) : (
                          <Button onClick={stopTimer} variant="outline" className="flex-1">
                            Stop Timer
                          </Button>
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="meditation">Meditation</SelectItem>
            <SelectItem value="sleep">Sleep</SelectItem>
            <SelectItem value="relaxation">Relaxation</SelectItem>
            <SelectItem value="journaling">Journaling</SelectItem>
          </SelectContent>
        </Select>

        <Select value={mood} onValueChange={setMood}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="How are you feeling?" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Any Mood</SelectItem>
            <SelectItem value="calm">Calm</SelectItem>
            <SelectItem value="stressed">Stressed</SelectItem>
            <SelectItem value="anxious">Anxious</SelectItem>
            <SelectItem value="happy">Happy</SelectItem>
            <SelectItem value="sad">Sad</SelectItem>
            <SelectItem value="tired">Tired</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={loadAIRecommendations} variant="outline">
          <Sparkles className="w-4 h-4 mr-2" />
          AI Recommendations
        </Button>

        <Dialog open={showCreatePlaylist} onOpenChange={setShowCreatePlaylist}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
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
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
              />
              <div className="flex space-x-2">
                <Button onClick={handleCreatePlaylist} className="flex-1">
                  Create
                </Button>
                <Button variant="outline" onClick={() => setShowCreatePlaylist(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Music Library */}
      <Tabs defaultValue="tracks" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tracks">Music Library</TabsTrigger>
          <TabsTrigger value="playlists">My Playlists</TabsTrigger>
          <TabsTrigger value="recommendations">For You</TabsTrigger>
        </TabsList>

        <TabsContent value="tracks" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <Music className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p>Loading music library...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTracks.map((track) => (
                <Card key={track.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                          {getCategoryIcon(track.category)}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">{track.title}</h4>
                        <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatTime(track.duration_seconds)}
                        </p>
                        
                        <div className="flex flex-wrap gap-1 mt-2">
                          {track.mood_tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {track.premium_only && (
                            <Badge variant="outline" className="text-xs">
                              <Crown className="w-3 h-3 mr-1" />
                              Premium
                            </Badge>
                          )}
                        </div>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => playTrack(track)}
                        className="flex-shrink-0"
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="playlists" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {playlists.map((playlist) => (
              <Card key={playlist.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">{playlist.name}</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {playlist.description || 'Custom playlist'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {playlist.track_ids.length} tracks
                  </p>
                  <Button size="sm" className="mt-3 w-full">
                    <Play className="w-4 h-4 mr-2" />
                    Play Playlist
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          {showAIRecommendations ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {aiRecommendations.map((track: any) => (
                <Card key={track.id} className="hover:shadow-lg transition-shadow border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="text-xs font-medium text-primary">AI Recommended</span>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                          {getCategoryIcon(track.category)}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">{track.title}</h4>
                        <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatTime(track.duration_seconds)}
                        </p>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => playTrack(track)}
                        className="flex-shrink-0"
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Get Personalized Recommendations</h3>
              <p className="text-muted-foreground mb-4">
                Let our AI suggest music based on your mood and preferences
              </p>
              <Button onClick={loadAIRecommendations}>
                <Sparkles className="w-4 h-4 mr-2" />
                Get AI Recommendations
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HarmoniousMusic;