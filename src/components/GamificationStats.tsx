import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Target, 
  Zap, 
  TrendingUp,
  Calendar,
  Brain,
  Heart,
  Star
} from 'lucide-react';
import { useGamification } from '@/hooks/useGamification';
import AchievementBadge from './AchievementBadge';

const GamificationStats: React.FC = () => {
  const { achievements, userStats, loading } = useGamification();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="h-16 bg-gray-200 rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const recentAchievements = achievements
    .filter(a => a.unlocked)
    .sort((a, b) => new Date(b.unlocked_at!).getTime() - new Date(a.unlocked_at!).getTime())
    .slice(0, 3);

  const inProgressAchievements = achievements
    .filter(a => !a.unlocked && (a.progress || 0) > 0)
    .sort((a, b) => (b.progress || 0) - (a.progress || 0))
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-yellow-800">{userStats.level}</div>
              <div className="text-yellow-600 text-sm">Level</div>
            </div>
            <Trophy className="w-8 h-8 text-yellow-600" />
          </div>
          <div className="mt-2">
            <Progress 
              value={((100 - userStats.xpToNextLevel) / 100) * 100} 
              className="h-2" 
            />
            <div className="text-xs text-yellow-600 mt-1">
              {userStats.xpToNextLevel} XP to next level
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-800">{userStats.totalXP}</div>
              <div className="text-blue-600 text-sm">Total XP</div>
            </div>
            <Zap className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-800">{userStats.streakCount}</div>
              <div className="text-green-600 text-sm">Day Streak</div>
            </div>
            <Target className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-purple-800">
                {achievements.filter(a => a.unlocked).length}
              </div>
              <div className="text-purple-600 text-sm">Achievements</div>
            </div>
            <Star className="w-8 h-8 text-purple-600" />
          </div>
        </Card>
      </div>

      {/* Activity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Quest Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Completed Quests</span>
              <Badge variant="secondary">{userStats.totalQuests}</Badge>
            </div>
            <div className="text-sm text-gray-600">
              Keep completing daily micro-quests to build healthy habits!
            </div>
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              Roleplay Training
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Sessions Completed</span>
              <Badge variant="secondary">{userStats.totalRoleplaysSessions}</Badge>
            </div>
            <div className="text-sm text-gray-600">
              Practice conversations to build confidence!
            </div>
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-600" />
              Mood Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Mood Entries</span>
              <Badge variant="secondary">{userStats.totalMoodEntries}</Badge>
            </div>
            <div className="text-sm text-gray-600">
              Track your emotions to understand patterns!
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <Card className="p-6">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-600" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentAchievements.map((achievement) => (
                <AchievementBadge
                  key={achievement.id}
                  achievement={achievement}
                  size="sm"
                  showProgress={false}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* In Progress */}
      {inProgressAchievements.length > 0 && (
        <Card className="p-6">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {inProgressAchievements.map((achievement) => (
                <AchievementBadge
                  key={achievement.id}
                  achievement={achievement}
                  size="sm"
                  showProgress={true}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Achievements */}
      <Card className="p-6">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Star className="w-6 h-6 text-purple-600" />
            All Achievements ({achievements.filter(a => a.unlocked).length}/{achievements.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {achievements.map((achievement) => (
              <AchievementBadge
                key={achievement.id}
                achievement={achievement}
                size="sm"
                showProgress={true}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GamificationStats;