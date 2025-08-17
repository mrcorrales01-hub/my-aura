import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Target, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  Brain,
  Heart,
  Zap,
  Users,
  BookOpen,
  Sparkles,
  Plus,
  BarChart3
} from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  category: 'mental' | 'physical' | 'social' | 'career' | 'self-care';
  progress: number;
  target: number;
  unit: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
}

interface HabitData {
  id: string;
  name: string;
  streak: number;
  completedToday: boolean;
  category: string;
  color: string;
}

interface LifeArea {
  name: string;
  score: number;
  color: string;
  icon: any;
}

const MyPlan = () => {
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: '1',
      title: 'Daily Meditation Practice',
      category: 'mental',
      progress: 18,
      target: 30,
      unit: 'days',
      dueDate: '2024-02-15',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Exercise 3x per week',
      category: 'physical',
      progress: 8,
      target: 12,
      unit: 'sessions',
      dueDate: '2024-02-28',
      priority: 'medium'
    },
    {
      id: '3',
      title: 'Social connections',
      category: 'social',
      progress: 5,
      target: 10,
      unit: 'meetups',
      dueDate: '2024-02-20',
      priority: 'medium'
    }
  ]);

  const [habits, setHabits] = useState<HabitData[]>([
    { id: '1', name: 'Morning meditation', streak: 12, completedToday: true, category: 'Mindfulness', color: 'bg-aura-serenity' },
    { id: '2', name: 'Gratitude journal', streak: 8, completedToday: false, category: 'Reflection', color: 'bg-aura-warm' },
    { id: '3', name: 'Evening walk', streak: 5, completedToday: true, category: 'Exercise', color: 'bg-aura-growth' },
    { id: '4', name: 'Deep breathing', streak: 15, completedToday: true, category: 'Wellness', color: 'bg-aura-secondary' }
  ]);

  const lifeAreas: LifeArea[] = [
    { name: 'Mental Health', score: 85, color: 'text-aura-primary', icon: Brain },
    { name: 'Physical Health', score: 72, color: 'text-aura-growth', icon: Zap },
    { name: 'Relationships', score: 78, color: 'text-aura-warm', icon: Heart },
    { name: 'Career', score: 65, color: 'text-aura-secondary', icon: Target },
    { name: 'Personal Growth', score: 80, color: 'text-aura-serenity', icon: BookOpen },
    { name: 'Social Life', score: 70, color: 'text-purple-600', icon: Users }
  ];

  const toggleHabit = (habitId: string) => {
    setHabits(prev => prev.map(habit => 
      habit.id === habitId 
        ? { 
            ...habit, 
            completedToday: !habit.completedToday,
            streak: !habit.completedToday ? habit.streak + 1 : Math.max(0, habit.streak - 1)
          }
        : habit
    ));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const overallWellness = Math.round(lifeAreas.reduce((sum, area) => sum + area.score, 0) / lifeAreas.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-aura">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-aura-gradient flex items-center justify-center aura-glow">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-aura-primary">My Wellness Plan</h1>
              <p className="text-foreground/70">Personalized goals, habits, and life balance tracking</p>
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-aura-primary">{overallWellness}%</div>
            <div className="text-sm text-foreground/70">Overall Wellness</div>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="goals" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="goals" className="flex items-center space-x-2">
            <Target className="w-4 h-4" />
            <span>Goals</span>
          </TabsTrigger>
          <TabsTrigger value="habits" className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>Habits</span>
          </TabsTrigger>
          <TabsTrigger value="balance" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Life Balance</span>
          </TabsTrigger>
        </TabsList>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-aura-primary">Mental Health Goals</h2>
            <Button size="sm" variant="outline" className="border-aura-primary/20 text-aura-primary hover:bg-aura-primary hover:text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Goal
            </Button>
          </div>

          <div className="grid gap-4">
            {goals.map((goal) => (
              <Card key={goal.id} className="p-4 bg-white/80 backdrop-blur-sm border-0 shadow-aura">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-medium text-aura-primary">{goal.title}</h3>
                    <Badge variant="outline" className={getPriorityColor(goal.priority)}>
                      {goal.priority}
                    </Badge>
                  </div>
                  <div className="text-sm text-foreground/60">
                    Due: {new Date(goal.dueDate).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress: {goal.progress}/{goal.target} {goal.unit}</span>
                    <span>{Math.round((goal.progress / goal.target) * 100)}%</span>
                  </div>
                  <Progress value={(goal.progress / goal.target) * 100} className="h-2" />
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Habits Tab */}
        <TabsContent value="habits" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-aura-primary">Daily Habits</h2>
            <Button size="sm" variant="outline" className="border-aura-primary/20 text-aura-primary hover:bg-aura-primary hover:text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Habit
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {habits.map((habit) => (
              <Card 
                key={habit.id} 
                className={`p-4 cursor-pointer transition-all duration-300 ${
                  habit.completedToday 
                    ? 'bg-aura-secondary/10 border border-aura-secondary/30' 
                    : 'bg-white/80 backdrop-blur-sm border-0 shadow-aura hover:shadow-lg'
                }`}
                onClick={() => toggleHabit(habit.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full ${habit.color} flex items-center justify-center`}>
                      {habit.completedToday ? (
                        <CheckCircle className="w-5 h-5 text-white" />
                      ) : (
                        <Clock className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className={`font-medium ${habit.completedToday ? 'text-aura-secondary' : 'text-aura-primary'}`}>
                        {habit.name}
                      </h3>
                      <p className="text-sm text-foreground/70">{habit.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      <Sparkles className="w-4 h-4 text-aura-growth" />
                      <span className="font-medium text-aura-growth">{habit.streak}</span>
                    </div>
                    <div className="text-xs text-foreground/60">day streak</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Life Balance Tab */}
        <TabsContent value="balance" className="space-y-4">
          <h2 className="text-lg font-medium text-aura-primary">Life Balance Wheel</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-aura">
              <h3 className="font-medium text-aura-primary mb-4">Wellness Areas</h3>
              <div className="space-y-4">
                {lifeAreas.map((area) => {
                  const Icon = area.icon;
                  return (
                    <div key={area.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Icon className={`w-4 h-4 ${area.color}`} />
                          <span className="text-sm font-medium">{area.name}</span>
                        </div>
                        <span className="text-sm font-medium">{area.score}%</span>
                      </div>
                      <Progress value={area.score} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-aura">
              <h3 className="font-medium text-aura-primary mb-4">Insights & Recommendations</h3>
              <div className="space-y-4">
                <div className="p-3 bg-aura-growth/10 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-aura-growth" />
                    <span className="text-sm font-medium text-aura-growth">Strength</span>
                  </div>
                  <p className="text-sm text-foreground/80">
                    Your mental health practices are excellent! Keep up the consistent meditation.
                  </p>
                </div>
                
                <div className="p-3 bg-aura-warm/10 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="w-4 h-4 text-aura-warm" />
                    <span className="text-sm font-medium text-aura-warm">Focus Area</span>
                  </div>
                  <p className="text-sm text-foreground/80">
                    Consider dedicating more time to career development and professional growth.
                  </p>
                </div>
                
                <div className="p-3 bg-aura-serenity/10 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Sparkles className="w-4 h-4 text-aura-serenity" />
                    <span className="text-sm font-medium text-aura-serenity">Suggestion</span>
                  </div>
                  <p className="text-sm text-foreground/80">
                    Try scheduling one social activity this week to boost your social wellness score.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyPlan;