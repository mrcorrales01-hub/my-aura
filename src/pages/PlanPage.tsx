import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Plus, Target, CheckCircle2, Calendar, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { getSubscription, canUseFeature } from '@/lib/subscription';

interface Goal {
  id: string;
  title: string;
  category: string;
  target_value: number;
  current_progress: number;
  unit: string;
  due_date: string;
  created_at: string;
}

interface Task {
  id: string;
  title: string;
  completed_at: string | null;
  quest_date: string;
}

const PlanPage = () => {
  const { t } = useTranslation(['common', 'plan']);
  const { user } = useAuthContext();
  const { toast } = useToast();
  
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [newGoal, setNewGoal] = useState({
    title: '',
    category: 'wellness',
    target_value: 1,
    unit: 'times',
    due_date: ''
  });

  useEffect(() => {
    if (user) {
      loadData();
      getSubscription().then(setSubscription);
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    // Load goals (user_goals table)
    const { data: goalsData } = await supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Load today's tasks (daily_quests table)
    const today = new Date().toISOString().split('T')[0];
    const { data: tasksData } = await supabase
      .from('daily_quests')
      .select('*')
      .eq('user_id', user.id)
      .eq('quest_date', today)
      .order('created_at', { ascending: false });

    setGoals(goalsData || []);
    setTasks(tasksData || []);
  };

  const handleAddGoal = async () => {
    if (!user || !newGoal.title.trim()) return;

    // Check subscription limits
    if (subscription && !canUseFeature(subscription, 'planGoals', 1)) {
      const currentCount = goals.length;
      toast({
        title: 'Goal limit reached',
        description: `You've reached your limit of ${subscription.limits.planGoals} goals. Upgrade to Plus for unlimited goals.`,
        variant: 'destructive'
      });
      return;
    }

    const { data, error } = await supabase
      .from('user_goals')
      .insert({
        user_id: user.id,
        title: newGoal.title,
        category: newGoal.category,
        target_value: newGoal.target_value,
        unit: newGoal.unit,
        due_date: newGoal.due_date || null,
        current_progress: 0
      })
      .select()
      .single();

    if (error) {
      toast({
        title: 'Error creating goal',
        description: error.message,
        variant: 'destructive'
      });
      return;
    }

    // Seed 2-3 daily tasks for the coming week
    const tasks = [
      { title: `Work on: ${newGoal.title}`, days: [0, 2, 4] }, // Mon, Wed, Fri
      { title: `Check progress: ${newGoal.title}`, days: [6] }, // Sunday
    ];

    const today = new Date();
    const weekTasks = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayOfWeek = date.getDay();
      
      tasks.forEach(task => {
        if (task.days.includes(dayOfWeek)) {
          weekTasks.push({
            user_id: user.id,
            title: task.title,
            quest_date: dateStr,
            quest_type: 'plan_related'
          });
        }
      });
    }

    if (weekTasks.length > 0) {
      await supabase.from('daily_quests').insert(weekTasks);
    }

    setGoals([data, ...goals]);
    setNewGoal({
      title: '',
      category: 'wellness',
      target_value: 1,
      unit: 'times',
      due_date: ''
    });
    setShowAddGoal(false);
    
    toast({
      title: 'Goal created!',
      description: 'Daily tasks have been added to help you achieve this goal.'
    });
  };

  const toggleTask = async (taskId: string, completed: boolean) => {
    const { error } = await supabase
      .from('daily_quests')
      .update({ completed_at: completed ? new Date().toISOString() : null })
      .eq('id', taskId);

    if (!error) {
      setTasks(tasks.map(task => 
        task.id === taskId 
          ? { ...task, completed_at: completed ? new Date().toISOString() : null }
          : task
      ));

      if (completed) {
        // Confetti effect would go here
        toast({
          title: '🎉 Task completed!',
          description: 'Great job staying on track!'
        });
      }
    }
  };

  const getProgress = (goal: Goal) => {
    return Math.min((goal.current_progress / goal.target_value) * 100, 100);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Sign in to view your plan</h2>
          <Button onClick={() => window.location.href = '/auth'}>
            Sign In
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <main className="main-shell max-w-4xl mx-auto p-4 space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Target className="w-8 h-8 text-primary" />
            My Plan
          </h1>
          <p className="text-muted-foreground">Your personal wellness journey</p>
        </div>
        
        <Dialog open={showAddGoal} onOpenChange={setShowAddGoal}>
          <DialogTrigger asChild>
            <motion.div whileTap={{ scale: 0.98 }}>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Goal
              </Button>
            </motion.div>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Goal Title</Label>
                <Input
                  id="title"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="e.g., Meditate daily"
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={newGoal.category} onValueChange={(value) => setNewGoal({ ...newGoal, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wellness">Wellness</SelectItem>
                    <SelectItem value="fitness">Fitness</SelectItem>
                    <SelectItem value="mindfulness">Mindfulness</SelectItem>
                    <SelectItem value="habits">Habits</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="target">Target</Label>
                  <Input
                    id="target"
                    type="number"
                    value={newGoal.target_value}
                    onChange={(e) => setNewGoal({ ...newGoal, target_value: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Select value={newGoal.unit} onValueChange={(value) => setNewGoal({ ...newGoal, unit: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="times">times</SelectItem>
                      <SelectItem value="minutes">minutes</SelectItem>
                      <SelectItem value="days">days</SelectItem>
                      <SelectItem value="hours">hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="due_date">Due Date (optional)</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={newGoal.due_date}
                  onChange={(e) => setNewGoal({ ...newGoal, due_date: e.target.value })}
                />
              </div>
              
              <Button onClick={handleAddGoal} className="w-full">
                Create Goal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Today's Tasks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Today's Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No tasks for today. Create a goal to get started!
              </p>
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {tasks.map((task) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50"
                    >
                      <Checkbox
                        checked={!!task.completed_at}
                        onCheckedChange={(checked) => toggleTask(task.id, checked as boolean)}
                      />
                      <span className={`${task.completed_at ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Active Goals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Active Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            {goals.length === 0 ? (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No goals yet. Start your wellness journey!</p>
                <Button onClick={() => setShowAddGoal(true)}>
                  Create Your First Goal
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <AnimatePresence>
                  {goals.map((goal, index) => (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 border rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold">{goal.title}</h3>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {goal.category}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{goal.current_progress}/{goal.target_value} {goal.unit}</span>
                        </div>
                        <Progress value={getProgress(goal)} className="w-full" />
                        
                        {goal.due_date && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            Due: {new Date(goal.due_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Weekly Review (Plus/Pro only) */}
      {subscription?.limits?.hasWeeklyReview && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ✨ Weekly Review
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Plus</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Your personalized weekly insights will appear here. Complete more tasks to unlock insights!
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </main>
  );
};

export default PlanPage;