import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useVideoExercises } from '@/hooks/useVideoExercises';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/hooks/useI18n';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Heart,
  Clock,
  Video,
  Sparkles,
  Crown,
  User,
  CheckCircle,
  RotateCcw,
  Star,
  Brain,
  Wind,
  Activity,
  PenTool,
  Target
} from 'lucide-react';

const VideoExercises = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [mood, setMood] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [showSessionComplete, setShowSessionComplete] = useState(false);
  const [moodAfter, setMoodAfter] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');
  const [difficultyRating, setDifficultyRating] = useState(0);
  const [effectivenessRating, setEffectivenessRating] = useState(0);
  const [showAIRecommendations, setShowAIRecommendations] = useState(false);
  const [aiRecommendations, setAIRecommendations] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const {
    videos,
    sessions,
    loading,
    currentVideo,
    currentSession,
    setCurrentVideo,
    setCurrentSession,
    startVideoSession,
    updateSessionProgress,
    completeVideoSession,
    getAIRecommendations,
    getVideosByCategory,
    getVideosByDifficulty,
    getCompletedSessionsCount,
    getTotalWatchTime,
    formatDuration
  } = useVideoExercises();

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentSession) return;

    const handleTimeUpdate = () => {
      const currentTime = video.currentTime;
      updateSessionProgress(currentSession.id, Math.floor(currentTime));
    };

    const handleEnded = () => {
      setShowSessionComplete(true);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [currentSession]);

  const startVideo = async (video: any) => {
    if (!user) return;

    // Check if premium video and user has access
    if (video.premium_only) {
      toast({
        title: "Premium Video",
        description: "This video requires a premium subscription.",
        variant: "destructive",
      });
      return;
    }

    const session = await startVideoSession(video, mood);
    if (session && videoRef.current) {
      videoRef.current.src = video.video_url;
      videoRef.current.volume = volume / 100;
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume / 100;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (isMuted) {
      handleVolumeChange(75);
    } else {
      handleVolumeChange(0);
    }
  };

  const handleSessionComplete = async () => {
    if (!currentSession) return;

    await completeVideoSession(
      currentSession.id,
      Math.floor(videoRef.current?.currentTime || 0),
      moodAfter,
      difficultyRating,
      effectivenessRating,
      sessionNotes
    );

    setShowSessionComplete(false);
    setMoodAfter('');
    setSessionNotes('');
    setDifficultyRating(0);
    setEffectivenessRating(0);
  };

  const repeatVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (!isFullscreen) {
        videoRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const loadAIRecommendations = async () => {
    const recommendations = await getAIRecommendations(mood, [], sessions);
    setAIRecommendations(recommendations);
    setShowAIRecommendations(true);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'mindfulness': return <Target className="w-4 h-4" />;
      case 'breathing': return <Wind className="w-4 h-4" />;
      case 'stretching': return <Activity className="w-4 h-4" />;
      case 'journaling': return <PenTool className="w-4 h-4" />;
      default: return <Video className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-50 border-green-200';
      case 'intermediate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'advanced': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const renderStars = (rating: number, setRating: (rating: number) => void) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            className={`${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            } hover:text-yellow-400 transition-colors`}
          >
            <Star className="w-5 h-5 fill-current" />
          </button>
        ))}
      </div>
    );
  };

  const filteredVideos = videos.filter(video => {
    if (selectedCategory !== 'all' && video.category !== selectedCategory) return false;
    if (selectedDifficulty !== 'all' && video.difficulty_level !== selectedDifficulty) return false;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
          <Video className="w-8 h-8 text-primary" />
          Video Exercises
        </h1>
        <p className="text-muted-foreground">
          Short guided exercises for mindfulness, movement, and wellness
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{getCompletedSessionsCount()}</div>
            <div className="text-sm text-muted-foreground">Sessions Completed</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{formatDuration(getTotalWatchTime())}</div>
            <div className="text-sm text-muted-foreground">Total Practice Time</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Video className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{videos.length}</div>
            <div className="text-sm text-muted-foreground">Available Exercises</div>
          </CardContent>
        </Card>
      </div>

      {/* Video Player */}
      {currentVideo && (
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{currentVideo.title}</h3>
                  <p className="text-muted-foreground">{currentVideo.instructor}</p>
                  <Badge className={getDifficultyColor(currentVideo.difficulty_level)}>
                    {currentVideo.difficulty_level}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={toggleMute}>
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                  
                  <Button variant="outline" size="sm" onClick={repeatVideo}>
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-64 md:h-96"
                  controls
                  poster={currentVideo.thumbnail_url}
                >
                  Your browser does not support the video tag.
                </video>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button onClick={togglePlay}>
                    <Play className="w-4 h-4 mr-2" />
                    Play/Pause
                  </Button>
                  
                  <div className="flex items-center space-x-2">
                    <Volume2 className="w-4 h-4 text-muted-foreground" />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                      className="w-20"
                    />
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  {formatDuration(currentVideo.duration_seconds)}
                </div>
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
            <SelectItem value="mindfulness">Mindfulness</SelectItem>
            <SelectItem value="breathing">Breathing</SelectItem>
            <SelectItem value="stretching">Stretching</SelectItem>
            <SelectItem value="journaling">Journaling</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
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
      </div>

      {/* Video Library */}
      <Tabs defaultValue="library" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="library">Exercise Library</TabsTrigger>
          <TabsTrigger value="recommendations">For You</TabsTrigger>
          <TabsTrigger value="progress">My Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <Video className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p>Loading video exercises...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVideos.map((video) => (
                <Card key={video.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="relative mb-3">
                      <div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center">
                        {video.thumbnail_url ? (
                          <img 
                            src={video.thumbnail_url} 
                            alt={video.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          getCategoryIcon(video.category)
                        )}
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {formatDuration(video.duration_seconds)}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold line-clamp-2">{video.title}</h4>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        {video.instructor}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <Badge className={getDifficultyColor(video.difficulty_level)}>
                          {video.difficulty_level}
                        </Badge>
                        
                        {video.premium_only && (
                          <Badge variant="outline" className="text-xs">
                            <Crown className="w-3 h-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {video.description}
                      </p>

                      <Button
                        onClick={() => startVideo(video)}
                        className="w-full mt-3"
                        size="sm"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start Exercise
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          {showAIRecommendations ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {aiRecommendations.map((video: any) => (
                <Card key={video.id} className="hover:shadow-lg transition-shadow border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="text-xs font-medium text-primary">AI Recommended</span>
                    </div>
                    
                    <div className="relative mb-3">
                      <div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center">
                        {getCategoryIcon(video.category)}
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {formatDuration(video.duration_seconds)}
                      </div>
                    </div>
                    
                    <h4 className="font-semibold line-clamp-2">{video.title}</h4>
                    <p className="text-sm text-muted-foreground">{video.instructor}</p>
                    
                    <Button
                      onClick={() => startVideo(video)}
                      className="w-full mt-3"
                      size="sm"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Exercise
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Get Personalized Recommendations</h3>
              <p className="text-muted-foreground mb-4">
                Let our AI suggest exercises based on your mood and progress
              </p>
              <Button onClick={loadAIRecommendations}>
                <Sparkles className="w-4 h-4 mr-2" />
                Get AI Recommendations
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sessions.slice(0, 10).map((session) => {
              const video = videos.find(v => v.id === session.video_id);
              if (!video) return null;
              
              return (
                <Card key={session.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                          {getCategoryIcon(video.category)}
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-semibold">{video.title}</h4>
                        <p className="text-sm text-muted-foreground">{video.instructor}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(session.started_at).toLocaleDateString()}
                        </p>
                        
                        <div className="mt-2 flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span className="text-xs">{formatDuration(session.duration_watched)}</span>
                          </div>
                          
                          {session.completed && (
                            <div className="flex items-center space-x-1">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              <span className="text-xs text-green-600">Completed</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Session Complete Dialog */}
      <Dialog open={showSessionComplete} onOpenChange={setShowSessionComplete}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Exercise Complete! 🎉</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Great job completing this exercise! How did it go?
            </p>
            
            <div>
              <label className="text-sm font-medium">How are you feeling now?</label>
              <Select value={moodAfter} onValueChange={setMoodAfter}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select your mood" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="calm">Calm</SelectItem>
                  <SelectItem value="relaxed">Relaxed</SelectItem>
                  <SelectItem value="energized">Energized</SelectItem>
                  <SelectItem value="focused">Focused</SelectItem>
                  <SelectItem value="peaceful">Peaceful</SelectItem>
                  <SelectItem value="tired">Tired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Difficulty Rating</label>
              <div className="mt-1">
                {renderStars(difficultyRating, setDifficultyRating)}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Effectiveness Rating</label>
              <div className="mt-1">
                {renderStars(effectivenessRating, setEffectivenessRating)}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Notes (optional)</label>
              <Textarea
                placeholder="How did this exercise help you?"
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleSessionComplete} className="flex-1">
                Complete Session
              </Button>
              <Button variant="outline" onClick={() => setShowSessionComplete(false)}>
                Skip
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VideoExercises;