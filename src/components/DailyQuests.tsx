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
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [todayPoints, setTodayPoints] = useState(0);
  const [streakDays, setStreakDays] = useState(3);
  const [level, setLevel] = useState(1);
  const [levelProgress, setLevelProgress] = useState(45);
  const { toast } = useToast();

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
    setAchievements(userAchievements);
  }, []);

  const completeQuest = (questId: string) => {
    setQuests(prev => prev.map(quest => {
      if (quest.id === questId && !quest.completed) {
        setTodayPoints(current => current + quest.points);
        setLevelProgress(current => {
          const newProgress = current + (quest.points / 10);
          if (newProgress >= 100) {
            setLevel(currentLevel => currentLevel + 1);
            return newProgress - 100;
          }
          return newProgress;
        });

        toast({
          title: `Quest Completed! 🎉`,
          description: `You earned ${quest.points} points for "${quest.title}"`,
        });

        // Check for achievements
        checkAchievements(quest);

        return { ...quest, completed: true };
      }
      return quest;
    }));
  };

  const checkAchievements = (completedQuest: Quest) => {
    setAchievements(prev => prev.map(achievement => {
      if (achievement.id === '2' && completedQuest.category === 'mindfulness') {
        const newProgress = Math.min(achievement.progress + 1, achievement.maxProgress);
        if (newProgress === achievement.maxProgress && !achievement.unlocked) {
          toast({
            title: "Achievement Unlocked! 🏆",
            description: achievement.title,
          });
          return { ...achievement, progress: newProgress, unlocked: true };
        }
        return { ...achievement, progress: newProgress };
      }
      return achievement;
    }));
  };

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
              <div className="text-2xl font-bold">{todayPoints}</div>
              <div className="text-white/80 text-sm">Points Today</div>
            </div>
            <Zap className="w-8 h-8 text-white/80" />
          </div>
        </Card>
        
        <Card className="p-4 bg-white/80 backdrop-blur-sm border-0 shadow-aura">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-aura-primary">{streakDays}</div>
              <div className="text-foreground/70 text-sm">Day Streak</div>
            </div>
            <Target className="w-8 h-8 text-aura-primary" />
          </div>
        </Card>
        
        <Card className="p-4 bg-white/80 backdrop-blur-sm border-0 shadow-aura">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-aura-secondary">Level {level}</div>
              <div className="text-foreground/70 text-sm">{Math.round(levelProgress)}% to next</div>
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
          <span className="text-sm font-medium text-aura-primary">Level {level} Progress</span>
          <span className="text-sm text-foreground/70">{Math.round(levelProgress)}/100 XP</span>
        </div>
        <Progress value={levelProgress} className="h-3" />
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
                onClick={() => !quest.completed && completeQuest(quest.id)}
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
                    <Button size="sm" variant="outline" className="border-aura-primary/20 text-aura-primary hover:bg-aura-primary hover:text-white">
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
          {achievements.map((achievement) => {
            const Icon = achievement.icon;
            return (
              <Card 
                key={achievement.id}
                className={`p-4 ${
                  achievement.unlocked 
                    ? 'bg-aura-growth/10 border border-aura-growth/30' 
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    achievement.unlocked ? 'bg-aura-growth text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-medium ${achievement.unlocked ? 'text-aura-growth' : 'text-gray-500'}`}>
                      {achievement.title}
                    </h3>
                    <p className="text-sm text-foreground/70">{achievement.description}</p>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-foreground/60 mb-1">
                        <span>Progress</span>
                        <span>{achievement.progress}/{achievement.maxProgress}</span>
                      </div>
                      <Progress 
                        value={(achievement.progress / achievement.maxProgress) * 100} 
                        className="h-2"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default DailyQuests;