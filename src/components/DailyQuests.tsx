import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  CheckCircle, 
  Clock, 
  Zap, 
  Heart, 
  Brain,
  Sparkles,
  Trophy,
  Star,
  Gift,
  Wind,
  Smile,
  Book,
  Moon,
  Sun
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useGamification } from '@/hooks/useGamification';
import AchievementBadge from './AchievementBadge';

interface Quest {
  id: string;
  title: string;
  description: string;
  icon: any;
  category: 'mindfulness' | 'physical' | 'social' | 'mental' | 'self-care';
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  timeEstimate: string;
  completed: boolean;
  color: string;
  bgColor: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

const DailyQuests = () => {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [todayPoints, setTodayPoints] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();
  const { achievements, userStats, loading, completeQuest } = useGamification();

  // Initialize daily quests
  useEffect(() => {
    const dailyQuests: Quest[] = [
      {
        id: '1',
        title: '3 Deep Breaths',
        description: 'Take three slow, mindful breaths to center yourself',
        icon: Wind,
        category: 'mindfulness',
        difficulty: 'easy',
        points: 10,
        timeEstimate: '1 min',
        completed: false,
        color: 'text-aura-serenity',
        bgColor: 'bg-aura-serenity/10'
      },
      {
        id: '2',
        title: 'Gratitude Note',
        description: 'Write down 3 things you\'re grateful for today',
        icon: Heart,
        category: 'mental',
        difficulty: 'easy',
        points: 15,
        timeEstimate: '3 min',
        completed: false,
        color: 'text-aura-warm',
        bgColor: 'bg-aura-warm/10'
      },
      {
        id: '3',
        title: 'Smile at Someone',
        description: 'Share a genuine smile with a friend, family member, or stranger',
        icon: Smile,
        category: 'social',
        difficulty: 'easy',
        points: 10,
        timeEstimate: '30 sec',
        completed: false,
        color: 'text-aura-secondary',
        bgColor: 'bg-aura-secondary/10'
      },
      {
        id: '4',
        title: '5-Minute Walk',
        description: 'Take a short walk outside or around your space',
        icon: Sun,
        category: 'physical',
        difficulty: 'medium',
        points: 20,
        timeEstimate: '5 min',
        completed: false,
        color: 'text-aura-growth',
        bgColor: 'bg-aura-growth/10'
      },
      {
        id: '5',
        title: 'Learn Something New',
        description: 'Read an interesting article or watch an educational video',
        icon: Book,
        category: 'mental',
        difficulty: 'medium',
        points: 25,
        timeEstimate: '10 min',
        completed: false,
        color: 'text-aura-primary',
        bgColor: 'bg-aura-primary/10'
      },
      {
        id: '6',
        title: 'Digital Detox Hour',
        description: 'Spend 1 hour away from screens doing something you enjoy',
        icon: Moon,
        category: 'self-care',
        difficulty: 'hard',
        points: 35,
        timeEstimate: '60 min',
        completed: false,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50'
      }
    ];

    const userAchievements: Achievement[] = [
      {
        id: '1',
        title: 'First Steps',
        description: 'Complete your first daily quest',
        icon: Star,
        unlocked: true,
        progress: 1,
        maxProgress: 1
      },
      {
        id: '2',
        title: 'Mindful Week',
        description: 'Complete 7 mindfulness quests',
        icon: Brain,
        unlocked: false,
        progress: 3,
        maxProgress: 7
      },
      {
        id: '3',
        title: 'Streak Master',
        description: 'Maintain a 7-day quest streak',
        icon: Trophy,
        unlocked: false,
        progress: 3,
        maxProgress: 7
      },
      {
        id: '4',
        title: 'Point Collector',
        description: 'Earn 500 total points',
        icon: Gift,
        unlocked: false,
        progress: 245,
        maxProgress: 500
      }
    ];

    setQuests(dailyQuests);
  }, []);

  const handleCompleteQuest = async (questId: string) => {
    const quest = quests.find(q => q.id === questId);
    if (!quest || quest.completed) return;

    // Complete quest in gamification system
    const success = await completeQuest(quest.title, quest.points);
    
    if (success) {
      // Update local state
      setQuests(prev => prev.map(q => 
        q.id === questId ? { ...q, completed: true } : q
      ));
      setTodayPoints(current => current + quest.points);
    }
  };

  // Reset quests daily
  useEffect(() => {
    const checkDailyReset = () => {
      const today = new Date().toDateString();
      const lastReset = localStorage.getItem('lastQuestReset');
      
      if (lastReset !== today) {
        setQuests(prev => prev.map(quest => ({ ...quest, completed: false })));
        setTodayPoints(0);
        localStorage.setItem('lastQuestReset', today);
      }
    };

    checkDailyReset();
    // Check every hour for day change
    const interval = setInterval(checkDailyReset, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const completedQuests = quests.filter(quest => quest.completed).length;
  const totalQuests = quests.length;
  const completionPercentage = Math.round((completedQuests / totalQuests) * 100);

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4 bg-aura-gradient text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{userStats.totalXP}</div>
              <div className="text-white/80 text-sm">Total XP</div>
            </div>
            <Zap className="w-8 h-8 text-white/80" />
          </div>
        </Card>
        
        <Card className="p-4 bg-white/80 backdrop-blur-sm border-0 shadow-aura">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-aura-primary">{userStats.streakCount}</div>
              <div className="text-foreground/70 text-sm">Day Streak</div>
            </div>
            <Target className="w-8 h-8 text-aura-primary" />
          </div>
        </Card>
        
        <Card className="p-4 bg-white/80 backdrop-blur-sm border-0 shadow-aura">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-aura-secondary">Level {userStats.level}</div>
              <div className="text-foreground/70 text-sm">{userStats.xpToNextLevel} XP to next</div>
            </div>
            <Trophy className="w-8 h-8 text-aura-secondary" />
          </div>
        </Card>
        
        <Card className="p-4 bg-white/80 backdrop-blur-sm border-0 shadow-aura">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-aura-growth">{completedQuests}/{totalQuests}</div>
              <div className="text-foreground/70 text-sm">Completed</div>
            </div>
            <CheckCircle className="w-8 h-8 text-aura-growth" />
          </div>
        </Card>
      </div>

      {/* Level Progress */}
      <Card className="p-4 bg-white/80 backdrop-blur-sm border-0 shadow-aura">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-aura-primary">Level {userStats.level} Progress</span>
          <span className="text-sm text-foreground/70">{userStats.xpToNextLevel} XP to next level</span>
        </div>
        <Progress value={((100 - userStats.xpToNextLevel) / 100) * 100} className="h-3" />
      </Card>

      {/* Daily Quests */}
      <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-aura">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-aura-primary flex items-center">
            <Sparkles className="w-6 h-6 mr-2" />
            Today's Micro-Quests
          </h2>
          <Badge variant="secondary" className="bg-aura-growth/20 text-aura-growth border-0">
            {completionPercentage}% Complete
          </Badge>
        </div>

        <div className="grid gap-4">
          {quests.map((quest) => {
            const Icon = quest.icon;
            return (
              <Card 
                key={quest.id}
                className={`p-4 transition-all duration-300 ${
                  quest.completed 
                    ? 'bg-aura-secondary/10 border border-aura-secondary/30' 
                    : 'hover:shadow-lg cursor-pointer'
                }`}
                onClick={() => !quest.completed && handleCompleteQuest(quest.id)}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full ${quest.bgColor} flex items-center justify-center`}>
                    {quest.completed ? (
                      <CheckCircle className="w-6 h-6 text-aura-secondary" />
                    ) : (
                      <Icon className={`w-6 h-6 ${quest.color}`} />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className={`font-medium ${quest.completed ? 'line-through text-foreground/60' : 'text-aura-primary'}`}>
                        {quest.title}
                      </h3>
                      <Badge variant="outline" className={getDifficultyColor(quest.difficulty)}>
                        {quest.difficulty}
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground/70 mb-2">{quest.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-foreground/60">
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {quest.timeEstimate}
                      </span>
                      <span className="flex items-center">
                        <Zap className="w-3 h-3 mr-1" />
                        {quest.points} points
                      </span>
                    </div>
                  </div>
                  
                  {!quest.completed && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-aura-primary/20 text-aura-primary hover:bg-aura-primary hover:text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCompleteQuest(quest.id);
                      }}
                    >
                      Complete
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </Card>

      {/* Achievements */}
      <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-aura">
        <h2 className="text-xl font-semibold text-aura-primary mb-4 flex items-center">
          <Trophy className="w-6 h-6 mr-2" />
          Achievements
        </h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          {achievements.slice(0, 8).map((achievement) => (
            <AchievementBadge
              key={achievement.id}
              achievement={achievement}
              size="sm"
              showProgress={true}
            />
          ))}
        </div>
      </Card>
    </div>
  );
};

export default DailyQuests;