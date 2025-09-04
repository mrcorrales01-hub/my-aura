import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Heart, Clock, Star } from 'lucide-react';

interface VideoExercise {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  category: 'breathing' | 'meditation' | 'movement' | 'relaxation';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isFavorite: boolean;
  progress?: number; // percentage completed
  rating: number;
}

const mockVideos: VideoExercise[] = [
  {
    id: '1',
    title: 'Morning Breathing Exercise',
    description: 'Start your day with a calming breathing routine',
    duration: 10,
    category: 'breathing',
    difficulty: 'beginner',
    isFavorite: false,
    progress: 0,
    rating: 4.8,
  },
  {
    id: '2',
    title: 'Mindful Meditation',
    description: 'A gentle introduction to mindfulness',
    duration: 15,
    category: 'meditation',
    difficulty: 'beginner',
    isFavorite: true,
    progress: 60,
    rating: 4.9,
  },
  {
    id: '3',
    title: 'Gentle Yoga Flow',
    description: 'Relaxing movements for stress relief',
    duration: 20,
    category: 'movement',
    difficulty: 'intermediate',
    isFavorite: false,
    progress: 0,
    rating: 4.7,
  },
  {
    id: '4',
    title: 'Evening Wind Down',
    description: 'Prepare your mind for restful sleep',
    duration: 12,
    category: 'relaxation',
    difficulty: 'beginner',
    isFavorite: true,
    progress: 100,
    rating: 4.9,
  },
];

export function VideoList() {
  const { t } = useTranslation();
  const [videos, setVideos] = useState(mockVideos);

  const toggleFavorite = (id: string) => {
    setVideos(prev => 
      prev.map(video => 
        video.id === id ? { ...video, isFavorite: !video.isFavorite } : video
      )
    );
  };

  const getCategoryColor = (category: VideoExercise['category']) => {
    switch (category) {
      case 'breathing': return 'bg-blue-500';
      case 'meditation': return 'bg-purple-500';
      case 'movement': return 'bg-green-500';
      case 'relaxation': return 'bg-indigo-500';
      default: return 'bg-gray-500';
    }
  };

  const getDifficultyColor = (difficulty: VideoExercise['difficulty']) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const favoriteVideos = videos.filter(video => video.isFavorite);
  const continueVideos = videos.filter(video => video.progress && video.progress > 0 && video.progress < 100);
  const recommendedVideos = videos.filter(video => video.rating >= 4.8);

  const VideoCard = ({ video }: { video: VideoExercise }) => (
    <Card key={video.id} className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{video.title}</CardTitle>
            <CardDescription className="mt-1">{video.description}</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleFavorite(video.id)}
            className="ml-2"
          >
            <Heart
              className={`h-4 w-4 ${video.isFavorite ? 'fill-red-500 text-red-500' : ''}`}
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{video.duration} min</span>
            <Star className="h-4 w-4 ml-2" />
            <span>{video.rating}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge className={getCategoryColor(video.category)}>
              {video.category}
            </Badge>
            <Badge variant="secondary" className={getDifficultyColor(video.difficulty)}>
              {video.difficulty}
            </Badge>
          </div>
          
          {video.progress !== undefined && video.progress > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{video.progress}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all" 
                  style={{ width: `${video.progress}%` }}
                />
              </div>
            </div>
          )}
          
          <Button className="w-full mt-4">
            <Play className="mr-2 h-4 w-4" />
            {video.progress === 100 ? 'Watch Again' : video.progress && video.progress > 0 ? 'Continue' : 'Start'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Videos</TabsTrigger>
          <TabsTrigger value="favorites">{t('media.favorites')}</TabsTrigger>
          <TabsTrigger value="continue">{t('media.continue')}</TabsTrigger>
          <TabsTrigger value="recommended">{t('media.recommended')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {videos.map(video => <VideoCard key={video.id} video={video} />)}
          </div>
        </TabsContent>
        
        <TabsContent value="favorites" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {favoriteVideos.length > 0 ? (
              favoriteVideos.map(video => <VideoCard key={video.id} video={video} />)
            ) : (
              <p className="text-muted-foreground col-span-full text-center py-8">
                No favorite videos yet. Click the heart icon to add videos to your favorites!
              </p>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="continue" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {continueVideos.length > 0 ? (
              continueVideos.map(video => <VideoCard key={video.id} video={video} />)
            ) : (
              <p className="text-muted-foreground col-span-full text-center py-8">
                No videos in progress. Start watching a video to see it here!
              </p>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="recommended" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recommendedVideos.map(video => <VideoCard key={video.id} video={video} />)}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}