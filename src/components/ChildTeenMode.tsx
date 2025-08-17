import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Palette, 
  Star, 
  Trophy, 
  Heart, 
  Smile, 
  Frown, 
  Angry, 
  AlertCircle,
  BookOpen,
  GamepadIcon,
  Gift
} from 'lucide-react';

interface ChildActivity {
  id: string;
  activity_type: string;
  activity_data: any;
  completion_status: string;
  points_earned: number;
  created_at: string;
  completed_at?: string;
}

const emotionColors = {
  happy: { color: 'bg-yellow-400', icon: Smile },
  sad: { color: 'bg-blue-400', icon: Frown },
  angry: { color: 'bg-red-400', icon: Angry },
  worried: { color: 'bg-purple-400', icon: AlertCircle },
  excited: { color: 'bg-green-400', icon: Star },
  calm: { color: 'bg-blue-200', icon: Heart }
};

const ChildTeenMode: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentActivity, setCurrentActivity] = useState<ChildActivity | null>(null);
  const [selectedEmotion, setSelectedEmotion] = useState<string>('');
  const [drawingData, setDrawingData] = useState<any>(null);
  const [storyText, setStoryText] = useState('');
  const [activities, setActivities] = useState<ChildActivity[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);

  const emotionActivities = [
    {
      id: 'emotion_drawing',
      title: 'Draw Your Feelings',
      description: 'Express how you feel through colors and shapes',
      icon: Palette,
      points: 20
    },
    {
      id: 'mood_game',
      title: 'Feeling Faces Game',
      description: 'Match emotions with situations',
      icon: GamepadIcon,
      points: 15
    },
    {
      id: 'story_creation',
      title: 'Create Your Story',
      description: 'Tell a story about your day or feelings',
      icon: BookOpen,
      points: 25
    }
  ];

  const startActivity = async (activityType: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('child_activities')
        .insert({
          user_id: user.id,
          activity_type: activityType,
          activity_data: {},
          completion_status: 'in_progress'
        })
        .select()
        .single();

      if (error) throw error;
      setCurrentActivity(data);
    } catch (error) {
      console.error('Error starting activity:', error);
      toast({
        title: "Oops!",
        description: "Couldn't start the activity. Let's try again!",
        variant: "destructive",
      });
    }
  };

  const completeActivity = async (activityData: any, pointsEarned: number) => {
    if (!currentActivity || !user) return;

    try {
      const { error } = await supabase
        .from('child_activities')
        .update({
          activity_data: activityData,
          completion_status: 'completed',
          points_earned: pointsEarned,
          completed_at: new Date().toISOString()
        })
        .eq('id', currentActivity.id);

      if (error) throw error;

      setTotalPoints(prev => prev + pointsEarned);
      setCurrentActivity(null);
      
      toast({
        title: "🎉 Great Job!",
        description: `You earned ${pointsEarned} points! Keep up the amazing work!`,
      });

      // Refresh activities
      fetchActivities();
    } catch (error) {
      console.error('Error completing activity:', error);
    }
  };

  const fetchActivities = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('child_activities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActivities(data || []);
      
      const total = data?.reduce((sum, activity) => sum + (activity.points_earned || 0), 0) || 0;
      setTotalPoints(total);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  React.useEffect(() => {
    if (user) {
      fetchActivities();
    }
  }, [user]);

  const EmotionDrawingActivity = () => (
    <Card className="border-2 border-dashed border-primary/30">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <Palette className="w-8 h-8 text-primary" />
          Draw Your Feelings
        </CardTitle>
        <CardDescription className="text-lg">
          Pick a color that matches how you feel and create something beautiful!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <p className="text-lg font-semibold mb-4">How are you feeling today?</p>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(emotionColors).map(([emotion, { color, icon: Icon }]) => (
              <Button
                key={emotion}
                variant={selectedEmotion === emotion ? "default" : "outline"}
                className={`h-20 flex flex-col gap-2 ${selectedEmotion === emotion ? color : ''}`}
                onClick={() => setSelectedEmotion(emotion)}
              >
                <Icon className="w-6 h-6" />
                <span className="capitalize">{emotion}</span>
              </Button>
            ))}
          </div>
        </div>

        {selectedEmotion && (
          <div className="bg-muted/50 p-6 rounded-lg">
            <p className="text-center text-lg mb-4">
              Great choice! Now imagine drawing with this feeling. What would you create?
            </p>
            <textarea
              placeholder="Describe what you would draw or tell us about your feeling..."
              className="w-full p-4 rounded-lg border min-h-[100px] text-lg"
              value={storyText}
              onChange={(e) => setStoryText(e.target.value)}
            />
            <Button
              className="w-full mt-4 text-lg py-6"
              onClick={() => completeActivity({ emotion: selectedEmotion, description: storyText }, 20)}
              disabled={!storyText.trim()}
            >
              <Gift className="w-5 h-5 mr-2" />
              Share My Creation!
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const MoodGameActivity = () => (
    <Card className="border-2 border-dashed border-green-300">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <GamepadIcon className="w-8 h-8 text-green-600" />
          Feeling Faces Game
        </CardTitle>
        <CardDescription className="text-lg">
          Match the feelings with the right situations!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center p-6 bg-green-50 rounded-lg">
            <p className="text-lg font-semibold mb-4">
              🎈 Imagine it's your birthday party! How would you feel?
            </p>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(emotionColors).slice(0, 4).map(([emotion, { icon: Icon }]) => (
                <Button
                  key={emotion}
                  variant="outline"
                  className="h-16 text-lg"
                  onClick={() => {
                    if (emotion === 'happy' || emotion === 'excited') {
                      completeActivity({ 
                        scenario: 'birthday_party', 
                        selectedEmotion: emotion, 
                        correct: true 
                      }, 15);
                    } else {
                      toast({
                        title: "Try again!",
                        description: "Think about how you'd feel at a fun party!",
                      });
                    }
                  }}
                >
                  <Icon className="w-6 h-6 mr-2" />
                  <span className="capitalize">{emotion}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const StoryCreationActivity = () => (
    <Card className="border-2 border-dashed border-purple-300">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <BookOpen className="w-8 h-8 text-purple-600" />
          Create Your Story
        </CardTitle>
        <CardDescription className="text-lg">
          Tell us about your day or create an amazing adventure!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-purple-50 p-6 rounded-lg">
          <p className="text-lg font-semibold mb-4">
            ✨ Start your story with: "Once upon a time..."
          </p>
          <textarea
            placeholder="Once upon a time... (Tell us about your day, a dream, or make up a fun story!)"
            className="w-full p-4 rounded-lg border min-h-[150px] text-lg"
            value={storyText}
            onChange={(e) => setStoryText(e.target.value)}
          />
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Words: {storyText.split(' ').filter(word => word.length > 0).length}
            </div>
            <Button
              onClick={() => completeActivity({ story: storyText, wordCount: storyText.split(' ').length }, 25)}
              disabled={storyText.trim().length < 20}
              className="text-lg px-8"
            >
              <Trophy className="w-5 h-5 mr-2" />
              Share My Story!
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (currentActivity) {
    switch (currentActivity.activity_type) {
      case 'emotion_drawing':
        return <EmotionDrawingActivity />;
      case 'mood_game':
        return <MoodGameActivity />;
      case 'story_creation':
        return <StoryCreationActivity />;
      default:
        return null;
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Points Display */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                <Star className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{totalPoints} Stars</h3>
                <p className="text-muted-foreground">You're doing amazing!</p>
              </div>
            </div>
            <div className="text-right">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                Level {Math.floor(totalPoints / 100) + 1}
              </Badge>
              <Progress value={(totalPoints % 100)} className="w-32 mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activities */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {emotionActivities.map((activity) => {
          const Icon = activity.icon;
          return (
            <Card key={activity.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">{activity.title}</CardTitle>
                <CardDescription className="text-base">
                  {activity.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Badge variant="outline" className="mb-4">
                  +{activity.points} Stars
                </Badge>
                <Button
                  onClick={() => startActivity(activity.id)}
                  className="w-full text-lg py-6"
                  size="lg"
                >
                  Start Activity!
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activities */}
      {activities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              Your Amazing Work
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {activities.slice(0, 4).map((activity) => (
                <div key={activity.id} className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold capitalize">
                      {activity.activity_type.replace('_', ' ')}
                    </h4>
                    <Badge variant="secondary">
                      +{activity.points_earned} stars
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(activity.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ChildTeenMode;