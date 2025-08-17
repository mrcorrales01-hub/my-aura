import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Lock, Star } from 'lucide-react';

interface AchievementBadgeProps {
  achievement: {
    id: string;
    name: string;
    description: string;
    category: string;
    badge_icon: string;
    badge_color: string;
    points: number;
    unlocked?: boolean;
    progress?: number;
    unlocked_at?: string;
  };
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  interactive?: boolean;
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  size = 'md',
  showProgress = true,
  interactive = true
}) => {
  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'quest': return 'bg-blue-100 text-blue-800';
      case 'roleplay': return 'bg-purple-100 text-purple-800';
      case 'mood': return 'bg-green-100 text-green-800';
      case 'streak': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card 
      className={`
        ${sizeClasses[size]} 
        transition-all duration-300 
        ${interactive ? 'hover:shadow-lg hover:scale-105 cursor-pointer' : ''}
        ${achievement.unlocked 
          ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 shadow-lg' 
          : 'bg-gray-50 border border-gray-200'
        }
      `}
    >
      <div className="flex flex-col items-center space-y-3">
        {/* Achievement Icon */}
        <div 
          className={`
            ${iconSizes[size]} 
            rounded-full flex items-center justify-center text-2xl font-bold shadow-md
            ${achievement.unlocked 
              ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white animate-pulse' 
              : 'bg-gray-300 text-gray-500'
            }
          `}
          style={achievement.unlocked ? { backgroundColor: achievement.badge_color } : {}}
        >
          {achievement.unlocked ? (
            <span className="text-xl">{achievement.badge_icon}</span>
          ) : (
            <Lock className="w-1/2 h-1/2" />
          )}
        </div>

        {/* Achievement Info */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <h3 className={`font-semibold ${textSizes[size]} ${
              achievement.unlocked ? 'text-gray-900' : 'text-gray-500'
            }`}>
              {achievement.name}
            </h3>
            {achievement.unlocked && (
              <Trophy className="w-4 h-4 text-yellow-600" />
            )}
          </div>

          <p className={`text-xs text-gray-600 ${size === 'lg' ? 'text-sm' : ''}`}>
            {achievement.description}
          </p>

          {/* Category and Points */}
          <div className="flex items-center justify-center space-x-2">
            <Badge variant="secondary" className={getCategoryColor(achievement.category)}>
              {achievement.category}
            </Badge>
            <Badge variant="outline" className="text-yellow-700 border-yellow-300">
              <Star className="w-3 h-3 mr-1" />
              {achievement.points} XP
            </Badge>
          </div>

          {/* Progress Bar */}
          {showProgress && !achievement.unlocked && achievement.progress !== undefined && (
            <div className="w-full space-y-1">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Progress</span>
                <span>{achievement.progress}%</span>
              </div>
              <Progress 
                value={achievement.progress} 
                className="h-2 bg-gray-200"
              />
            </div>
          )}

          {/* Unlock Date */}
          {achievement.unlocked && achievement.unlocked_at && (
            <p className="text-xs text-gray-500">
              Unlocked {new Date(achievement.unlocked_at).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default AchievementBadge;