import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useMentalHealthTimeline } from '@/hooks/useMentalHealthTimeline';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Brain, 
  Heart, 
  Activity, 
  Moon, 
  Download,
  Share,
  Sparkles,
  Target,
  Award,
  AlertCircle
} from 'lucide-react';

const MentalHealthTimeline: React.FC = () => {
  const {
    timeline,
    stats,
    loading,
    dateRange,
    setDateRange,
    generateTimelineEntry,
    shareTimeline,
  } = useMentalHealthTimeline();

  // Prepare chart data
  const chartData = timeline.map(entry => ({
    date: entry.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: entry.overallScore,
    mood: entry.moodAverage || 0,
    sleep: entry.sleepQuality || 0,
    stress: entry.stressLevel ? 10 - entry.stressLevel : 0, // Invert stress for positive visualization
    activity: entry.activityLevel || 0,
  })).reverse(); // Reverse to show chronological order

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Target className="w-4 h-4 text-blue-500" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-blue-600';
    if (score >= 4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleShareTimeline = () => {
    const providerEmail = prompt('Enter your healthcare provider\'s email:');
    if (providerEmail) {
      const start = new Date();
      start.setDate(start.getDate() - 30); // Last 30 days
      shareTimeline(providerEmail, { start, end: new Date() });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Your Digital Twin</h1>
          <p className="text-muted-foreground mt-1">
            AI-powered insights into your mental health journey
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">1 Week</SelectItem>
              <SelectItem value="month">1 Month</SelectItem>
              <SelectItem value="3months">3 Months</SelectItem>
              <SelectItem value="6months">6 Months</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleShareTimeline} variant="outline" size="sm">
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Current Score</p>
                  <p className={`text-2xl font-bold ${getScoreColor(stats.currentScore)}`}>
                    {stats.currentScore.toFixed(1)}
                  </p>
                </div>
                <Brain className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Weekly Trend</p>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(stats.weeklyTrend)}
                    <span className="text-lg font-semibold capitalize">
                      {stats.weeklyTrend}
                    </span>
                  </div>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Monthly Average</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {stats.monthlyAverage.toFixed(1)}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 font-medium">Best Day</p>
                  <p className="text-lg font-bold text-orange-700">
                    {stats.bestDay?.overallScore.toFixed(1) || 'N/A'}
                  </p>
                  <p className="text-xs text-orange-600">
                    {stats.bestDay?.date.toLocaleDateString() || ''}
                  </p>
                </div>
                <Award className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Timeline Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Mental Health Timeline
          </CardTitle>
          <CardDescription>
            Track your mental wellness journey over time with AI-powered insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="detailed">Detailed Metrics</TabsTrigger>
              <TabsTrigger value="insights">AI Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip 
                      formatter={(value: any) => [value.toFixed(1), 'Score']}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#3B82F6" 
                      fill="#3B82F6" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="detailed" className="space-y-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#3B82F6" name="Overall Score" />
                    <Line type="monotone" dataKey="mood" stroke="#10B981" name="Mood" />
                    <Line type="monotone" dataKey="sleep" stroke="#8B5CF6" name="Sleep Quality" />
                    <Line type="monotone" dataKey="stress" stroke="#F59E0B" name="Stress (Inverted)" />
                    <Line type="monotone" dataKey="activity" stroke="#EF4444" name="Activity Level" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
              <div className="grid gap-4">
                {timeline.slice(0, 5).map((entry) => (
                  <Card key={entry.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {entry.date.toLocaleDateString()}
                        </span>
                        <Badge variant="outline" className={getScoreColor(entry.overallScore)}>
                          Score: {entry.overallScore.toFixed(1)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {entry.aiInsights.summary}
                      </p>
                      {entry.aiInsights.trends.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {entry.aiInsights.trends.map((trend, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {trend}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {stats?.bestDay && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-500" />
              Personalized Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-green-600">What's Working Well</h3>
                <ul className="text-sm space-y-1">
                  <li>• Consistent mood tracking shows engagement</li>
                  <li>• {stats.weeklyTrend === 'improving' ? 'Positive upward trend' : 'Stable patterns'}</li>
                  <li>• Regular use of wellness features</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-blue-600">Areas for Growth</h3>
                <ul className="text-sm space-y-1">
                  <li>• Consider daily mindfulness practices</li>
                  <li>• Maintain consistent sleep schedule</li>
                  <li>• Regular check-ins with AI coach</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MentalHealthTimeline;