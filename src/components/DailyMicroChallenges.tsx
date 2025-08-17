import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  CheckCircle, 
  Clock, 
  Zap,
  Heart,
  Brain,
  Wind,
  Star,
  Trophy,
  Coins,
  Timer,
  RotateCcw
} from 'lucide-react';
import { useMicroChallenges } from '@/hooks/useMicroChallenges';

const DailyMicroChallenges = () => {
  const {
    todaysChallenges,
    activeChallenge,
    loading,
    startChallenge,
    completeChallenge,
    getTodayProgress,
    getWeeklyStats,
    generateDailyChallenges
  } = useMicroChallenges();

  const [challengeTimer, setChallengeTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  const todayProgress = getTodayProgress();
  const weeklyStats = getWeeklyStats();

  const challengeIcons = {
    breathing: Wind,
    gratitude: Heart,
    meditation: Brain,
    movement: Zap
  };

  const challengeColors = {
    breathing: 'text-blue-600 bg-blue-100',
    gratitude: 'text-pink-600 bg-pink-100',
    meditation: 'text-purple-600 bg-purple-100',
    movement: 'text-orange-600 bg-orange-100'
  };

  useEffect(() => {
    if (activeChallenge && isTimerRunning) {
      const interval = setInterval(() => {
        setChallengeTimer(prev => {
          if (prev >= activeChallenge.duration_seconds) {
            setIsTimerRunning(false);
            return activeChallenge.duration_seconds;
          }
          return prev + 1;
        });
      }, 1000);
      
      setTimerInterval(interval);
      return () => clearInterval(interval);
    }
  }, [activeChallenge, isTimerRunning]);

  const handleStartChallenge = async (challenge: any) => {
    await startChallenge(challenge);
    setChallengeTimer(0);
    setIsTimerRunning(true);
  };

  const handleCompleteChallenge = async () => {
    if (!activeChallenge) return;

    const success = await completeChallenge(activeChallenge.id, 5); // Default rating
    if (success) {
      setIsTimerRunning(false);
      setChallengeTimer(0);
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
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
          <div className="grid md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Daily Micro-Challenges ⚡
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Quick 1-2 minute wellness activities designed to boost your mental health throughout the day
        </p>
      </div>

      {/* Progress Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {todayProgress.completed}/{todayProgress.total}
              </div>
              <div className="text-sm text-muted-foreground">Today</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
              <Coins className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">{todayProgress.coinsEarned}</div>
              <div className="text-sm text-muted-foreground">Coins Earned</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{weeklyStats.streak}</div>
              <div className="text-sm text-muted-foreground">Day Streak</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Star className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{weeklyStats.totalCompleted}</div>
              <div className="text-sm text-muted-foreground">This Week</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Today's Progress</h3>
          <Badge variant="secondary">
            {Math.round(todayProgress.progress)}% Complete
          </Badge>
        </div>
        <Progress value={todayProgress.progress} className="h-3" />
        <div className="flex justify-between text-sm text-muted-foreground mt-2">
          <span>{todayProgress.completed} completed</span>
          <span>{todayProgress.total - todayProgress.completed} remaining</span>
        </div>
      </Card>

      {/* Active Challenge */}
      {activeChallenge && (
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Timer className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-semibold">Challenge in Progress</h3>
            </div>
            
            <div className="text-4xl font-mono font-bold text-blue-600">
              {formatTime(challengeTimer)}
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-lg">{activeChallenge.title}</h4>
              <p className="text-muted-foreground">{activeChallenge.description}</p>
            </div>

            {/* Challenge Instructions */}
            <Card className="p-4 bg-white/60">
              <div className="space-y-2">
                <h5 className="font-medium">Follow these steps:</h5>
                <ol className="text-sm text-left space-y-1">
                  {activeChallenge.instructions?.steps?.map((step: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                        {index + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </Card>

            <div className="flex items-center justify-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
              >
                {isTimerRunning ? 'Pause' : 'Resume'}
              </Button>
              
              <Button
                onClick={handleCompleteChallenge}
                disabled={challengeTimer < activeChallenge.duration_seconds}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete Challenge
              </Button>
            </div>

            <Progress 
              value={(challengeTimer / activeChallenge.duration_seconds) * 100} 
              className="w-full max-w-md mx-auto"
            />
          </div>
        </Card>
      )}

      {/* Available Challenges */}
      {!activeChallenge && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Today's Challenges</h2>
            {todaysChallenges.length === 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={generateDailyChallenges}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Generate New
              </Button>
            )}
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            {todaysChallenges.map((challenge) => {
              const IconComponent = challengeIcons[challenge.challenge_type as keyof typeof challengeIcons];
              const colorClass = challengeColors[challenge.challenge_type as keyof typeof challengeColors];
              const isCompleted = !!challenge.completed_at;
              
              return (
                <Card 
                  key={challenge.id}
                  className={`p-4 transition-all duration-300 ${
                    isCompleted ? 'bg-green-50 border-green-200' : 'hover:shadow-lg hover:shadow-glow'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      
                      {isCompleted ? (
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Done
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <Clock className="w-3 h-3 mr-1" />
                          {challenge.duration_seconds}s
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-semibold">{challenge.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {challenge.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-yellow-600">
                        <Coins className="w-4 h-4 mr-1" />
                        +{challenge.reward_coins} coins
                      </div>
                      
                      {!isCompleted && (
                        <Button
                          size="sm"
                          onClick={() => handleStartChallenge(challenge)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Start
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Weekly Stats */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center">
          <Trophy className="w-5 h-5 mr-2 text-purple-600" />
          This Week's Achievement
        </h3>
        
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{weeklyStats.totalCompleted}</div>
            <div className="text-sm text-muted-foreground">Challenges</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{weeklyStats.totalCoins}</div>
            <div className="text-sm text-muted-foreground">Coins Earned</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{weeklyStats.avgRating}</div>
            <div className="text-sm text-muted-foreground">Avg Rating</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{weeklyStats.streak}</div>
            <div className="text-sm text-muted-foreground">Day Streak</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DailyMicroChallenges;