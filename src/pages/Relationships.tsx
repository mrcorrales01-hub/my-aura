import { useI18n } from '@/hooks/useI18n';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, MessageCircle, Users, Trophy, ArrowRight, Star } from 'lucide-react';

export default function Relationships() {
  const { t } = useI18n();
  
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          {t('nav.relationships')}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Build stronger, healthier relationships through AI-guided coaching, communication exercises, and conflict resolution tools.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Sessions Completed</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Communication Score</p>
                <p className="text-2xl font-bold">-</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Conflicts Resolved</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Achievements</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="coaching" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="coaching">Coaching</TabsTrigger>
          <TabsTrigger value="exercises">Exercises</TabsTrigger>
          <TabsTrigger value="roleplay">Roleplay</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="coaching" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="group hover:shadow-lg transition-all cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <MessageCircle className="h-6 w-6 text-blue-500" />
                  <CardTitle>Communication Skills</CardTitle>
                </div>
                <CardDescription>
                  Learn effective communication techniques for healthier relationships
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Sessions Available:</span>
                    <Badge>4 modules</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Estimated Time:</span>
                    <span>15-20 min each</span>
                  </div>
                  <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground" variant="outline">
                    <span>Start Learning</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Users className="h-6 w-6 text-green-500" />
                  <CardTitle>Conflict Resolution</CardTitle>
                </div>
                <CardDescription>
                  Develop skills to resolve disagreements constructively
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Sessions Available:</span>
                    <Badge>5 modules</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Estimated Time:</span>
                    <span>20-25 min each</span>
                  </div>
                  <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground" variant="outline">
                    <span>Start Learning</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Heart className="h-6 w-6 text-red-500" />
                  <CardTitle>Empathy Building</CardTitle>
                </div>
                <CardDescription>
                  Strengthen your ability to understand and connect with others
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Sessions Available:</span>
                    <Badge>4 modules</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Estimated Time:</span>
                    <span>15-20 min each</span>
                  </div>
                  <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground" variant="outline">
                    <span>Start Learning</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Star className="h-6 w-6 text-yellow-500" />
                  <CardTitle>Couples Exercises</CardTitle>
                </div>
                <CardDescription>
                  Interactive exercises for partners to do together
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Sessions Available:</span>
                    <Badge>6 modules</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Estimated Time:</span>
                    <span>25-30 min each</span>
                  </div>
                  <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground" variant="outline">
                    <span>Start Together</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="exercises" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Relationship Exercises</CardTitle>
              <CardDescription>
                Quick activities to improve your relationship skills
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[
                  { title: 'Active Listening', time: '5 min', difficulty: 'Beginner' },
                  { title: 'Gratitude Expression', time: '3 min', difficulty: 'Beginner' },
                  { title: 'Conflict Simulation', time: '10 min', difficulty: 'Intermediate' },
                  { title: 'Empathy Challenge', time: '8 min', difficulty: 'Intermediate' },
                  { title: 'Deep Conversation Starter', time: '15 min', difficulty: 'Advanced' },
                  { title: 'Trust Building Exercise', time: '12 min', difficulty: 'Advanced' },
                ].map((exercise, index) => (
                  <Card key={index} className="group hover:shadow-md transition-all">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{exercise.title}</h4>
                          <Badge variant="outline">{exercise.difficulty}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Estimated time: {exercise.time}
                        </div>
                        <Button size="sm" className="w-full" variant="outline">
                          Try Exercise
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roleplay" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI-Guided Roleplay Scenarios</CardTitle>
              <CardDescription>
                Practice relationship skills in realistic scenarios with AI feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    title: 'Difficult Conversation with Partner',
                    description: 'Practice discussing sensitive topics respectfully',
                    level: 'Intermediate',
                    participants: '2 people'
                  },
                  {
                    title: 'Family Conflict Resolution',
                    description: 'Navigate disagreements with family members',
                    level: 'Beginner',
                    participants: '1-3 people'
                  },
                  {
                    title: 'Workplace Relationship Issues',
                    description: 'Handle interpersonal challenges at work',
                    level: 'Advanced',
                    participants: '2-4 people'
                  }
                ].map((scenario, index) => (
                  <Card key={index} className="group hover:shadow-md transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <h4 className="font-medium">{scenario.title}</h4>
                          <p className="text-sm text-muted-foreground">{scenario.description}</p>
                          <div className="flex items-center space-x-4 text-xs">
                            <Badge variant="outline">{scenario.level}</Badge>
                            <span className="text-muted-foreground">{scenario.participants}</span>
                          </div>
                        </div>
                        <Button variant="outline">
                          Start Roleplay
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Relationship Journey</CardTitle>
              <CardDescription>
                Track your progress in building better relationships
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Communication Skills</span>
                    <span className="text-sm text-muted-foreground">0/4 modules</span>
                  </div>
                  <Progress value={0} className="h-2" />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Conflict Resolution</span>
                    <span className="text-sm text-muted-foreground">0/5 modules</span>
                  </div>
                  <Progress value={0} className="h-2" />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Empathy Building</span>
                    <span className="text-sm text-muted-foreground">0/4 modules</span>
                  </div>
                  <Progress value={0} className="h-2" />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Couples Exercises</span>
                    <span className="text-sm text-muted-foreground">0/6 modules</span>
                  </div>
                  <Progress value={0} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No relationship coaching activity yet</p>
                <p className="text-sm">Start your first session to begin tracking progress!</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}