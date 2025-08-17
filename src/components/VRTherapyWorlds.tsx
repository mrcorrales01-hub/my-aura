import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Eye, 
  Play, 
  Pause, 
  Square, 
  Users, 
  Clock, 
  Star,
  Headphones,
  Activity,
  Sparkles
} from 'lucide-react';
import { useVRTherapy } from '@/hooks/useVRTherapy';

const VRTherapyWorlds = () => {
  const {
    vrWorlds,
    aiAvatars,
    activeSession,
    groupSessions,
    loading,
    startVRSession,
    completeVRSession,
    joinGroupSession,
    getSessionStats
  } = useVRTherapy();

  const [selectedWorld, setSelectedWorld] = useState<string>('');
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');
  const [sessionTimer, setSessionTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const stats = getSessionStats();

  const worldTypes = [
    { 
      type: 'beach', 
      name: 'Beach Therapy', 
      icon: '🏖️', 
      description: 'Calming ocean waves and warm sunlight',
      benefits: ['Stress Relief', 'Anxiety Reduction', 'Deep Relaxation']
    },
    { 
      type: 'forest', 
      name: 'Forest Healing', 
      icon: '🌲', 
      description: 'Peaceful woodland with nature sounds',
      benefits: ['Grounding', 'Mindfulness', 'Connection to Nature']
    },
    { 
      type: 'mountain', 
      name: 'Mountain Retreat', 
      icon: '⛰️', 
      description: 'Serene peaks with panoramic views',
      benefits: ['Clarity', 'Perspective', 'Inner Strength']
    },
    { 
      type: 'cosmic', 
      name: 'Cosmic Journey', 
      icon: '🌌', 
      description: 'Transcendent space meditation',
      benefits: ['Expansion', 'Wonder', 'Universal Connection']
    }
  ];

  const avatarTypes = [
    { 
      type: 'therapist', 
      name: 'Professional Therapist', 
      icon: '👩‍⚕️', 
      description: 'Trained therapeutic guidance'
    },
    { 
      type: 'friend', 
      name: 'Supportive Friend', 
      icon: '👥', 
      description: 'Casual, encouraging companion'
    },
    { 
      type: 'mentor', 
      name: 'Wise Mentor', 
      icon: '🧙‍♂️', 
      description: 'Deep insights and wisdom'
    },
    { 
      type: 'inner_child', 
      name: 'Inner Child', 
      icon: '🧒', 
      description: 'Healing childhood wounds'
    }
  ];

  const handleStartSession = async (sessionType: string) => {
    if (!selectedWorld) return;

    const session = await startVRSession(selectedWorld, sessionType, selectedAvatar);
    if (session) {
      setIsTimerRunning(true);
      // Start timer
      const interval = setInterval(() => {
        setSessionTimer(prev => prev + 1);
      }, 1000);

      // Store interval reference for cleanup
      (session as any).timerInterval = interval;
    }
  };

  const handleCompleteSession = async () => {
    if (!activeSession) return;

    const durationMinutes = Math.floor(sessionTimer / 60);
    const success = await completeVRSession(
      activeSession.id,
      durationMinutes,
      undefined, // effectiveness rating - would be collected from user
      '', // session notes - would be collected from user
      {} // biometric data - would come from connected devices
    );

    if (success) {
      setIsTimerRunning(false);
      setSessionTimer(0);
      clearInterval((activeSession as any).timerInterval);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          VR Therapy Worlds 🥽
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Immerse yourself in therapeutic virtual environments designed for deep healing and relaxation
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Play className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{stats.totalSessions}</div>
              <div className="text-sm text-muted-foreground">VR Sessions</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{stats.totalMinutes}</div>
              <div className="text-sm text-muted-foreground">Minutes</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Star className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.avgRating}</div>
              <div className="text-sm text-muted-foreground">Avg Rating</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Active Session */}
      {activeSession && (
        <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">VR Session Active</h3>
                <p className="text-muted-foreground">
                  {vrWorlds.find(w => w.id === activeSession.world_id)?.name} • {formatTime(sessionTimer)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
              >
                {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleCompleteSession}
              >
                <Square className="w-4 h-4 mr-2" />
                End Session
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* World Selection */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
          Choose Your Therapeutic World
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {worldTypes.map((worldType) => {
            const worlds = vrWorlds.filter(w => w.environment_type === worldType.type);
            
            return worlds.map((world) => (
              <Card 
                key={world.id}
                className={`p-4 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  selectedWorld === world.id 
                    ? 'ring-2 ring-purple-500 bg-purple-50' 
                    : 'hover:shadow-glow'
                }`}
                onClick={() => setSelectedWorld(world.id)}
              >
                <div className="text-center space-y-3">
                  <div className="text-4xl">{worldType.icon}</div>
                  <div>
                    <h3 className="font-semibold">{world.name}</h3>
                    <p className="text-sm text-muted-foreground">{world.description}</p>
                  </div>
                  
                  <div className="space-y-2">
                    {worldType.benefits.map((benefit, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            ));
          })}
        </div>
      </div>

      {/* Avatar Selection */}
      {selectedWorld && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-600" />
            Choose Your AI Guide (Optional)
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {avatarTypes.map((avatarType) => {
              const avatars = aiAvatars.filter(a => a.avatar_type === avatarType.type);
              
              return avatars.map((avatar) => (
                <Card 
                  key={avatar.id}
                  className={`p-4 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    selectedAvatar === avatar.id 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'hover:shadow-glow'
                  }`}
                  onClick={() => setSelectedAvatar(selectedAvatar === avatar.id ? '' : avatar.id)}
                >
                  <div className="text-center space-y-2">
                    <div className="text-3xl">{avatarType.icon}</div>
                    <div>
                      <h3 className="font-semibold">{avatar.name}</h3>
                      <p className="text-sm text-muted-foreground">{avatarType.description}</p>
                    </div>
                  </div>
                </Card>
              ));
            })}
          </div>
        </div>
      )}

      {/* Session Controls */}
      {selectedWorld && !activeSession && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Start Your Journey</h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            <Button
              size="lg"
              className="h-20 flex-col space-y-2 bg-green-600 hover:bg-green-700"
              onClick={() => handleStartSession('meditation')}
            >
              <Headphones className="w-6 h-6" />
              <span>Guided Meditation</span>
            </Button>
            
            <Button
              size="lg"
              className="h-20 flex-col space-y-2 bg-blue-600 hover:bg-blue-700"
              onClick={() => handleStartSession('exposure_therapy')}
            >
              <Activity className="w-6 h-6" />
              <span>Exposure Therapy</span>
            </Button>
            
            <Button
              size="lg"
              className="h-20 flex-col space-y-2 bg-purple-600 hover:bg-purple-700"
              onClick={() => handleStartSession('roleplay')}
            >
              <Users className="w-6 h-6" />
              <span>AI Roleplay</span>
            </Button>
          </div>
        </div>
      )}

      {/* Group Sessions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center">
          <Users className="w-5 h-5 mr-2 text-green-600" />
          Join Group VR Sessions
        </h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          {groupSessions.slice(0, 4).map((session) => (
            <Card key={session.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h3 className="font-semibold">{session.session_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {vrWorlds.find(w => w.id === session.world_id)?.name}
                  </p>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {session.current_participants}/{session.max_participants}
                    </span>
                    {session.scheduled_at && (
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {new Date(session.scheduled_at).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => joinGroupSession(session.id)}
                  disabled={session.current_participants >= session.max_participants}
                >
                  Join
                </Button>
              </div>
              
              <Progress 
                value={(session.current_participants / session.max_participants) * 100} 
                className="mt-3"
              />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VRTherapyWorlds;