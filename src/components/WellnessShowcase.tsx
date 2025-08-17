import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Music, 
  Video, 
  Sparkles, 
  Crown, 
  Clock, 
  Award,
  TrendingUp,
  Play,
  Headphones,
  Camera,
  Heart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/hooks/useI18n';

const WellnessShowcase = () => {
  const navigate = useNavigate();
  const { t } = useI18n();

  const newFeatures = [
    {
      title: 'Harmonious Music',
      description: 'AI-curated music that adapts to your mood, wearable data, and wellness goals',
      icon: Music,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      features: [
        'Mood-adaptive AI recommendations',
        'Pay-per-play premium tracks',
        'Timer & loop modes',
        'Custom playlists',
        '22-language support'
      ],
      stats: {
        tracks: '150+ tracks',
        categories: '4 categories',
        languages: '22 languages'
      },
      action: () => navigate('/music'),
      premium: true
    },
    {
      title: 'Video Exercises',
      description: 'Short 1-5 minute guided videos for mindfulness, breathing, and movement',
      icon: Video,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      features: [
        'AI-personalized suggestions',
        'Multilingual captions',
        'Progress tracking',
        'Difficulty ratings',
        'Loop & repeat options'
      ],
      stats: {
        videos: '50+ exercises',
        duration: '1-5 minutes',
        instructors: '10+ experts'
      },
      action: () => navigate('/videos'),
      premium: false
    }
  ];

  const integrationFeatures = [
    {
      icon: Sparkles,
      title: 'AI Integration',
      description: 'Both modules seamlessly integrate with your existing AI coach, mood tracker, and wellness data'
    },
    {
      icon: Award,
      title: 'Gamification',
      description: 'Unlock new tracks and videos by completing quests, maintaining streaks, and achieving goals'
    },
    {
      icon: TrendingUp,
      title: 'Progress Analytics',
      description: 'Track your wellness journey with detailed analytics and AI-powered insights'
    },
    {
      icon: Heart,
      title: 'Holistic Wellness',
      description: 'Complete ecosystem supporting mental health, mindfulness, and personal growth'
    }
  ];

  const wellnessStats = [
    { label: 'Total Features', value: '12+', icon: Sparkles, color: 'text-purple-600' },
    { label: 'Languages Supported', value: '22', icon: Crown, color: 'text-blue-600' },
    { label: 'AI Models', value: '5', icon: Music, color: 'text-green-600' },
    { label: 'User Progress Tracking', value: '100%', icon: TrendingUp, color: 'text-orange-600' }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">New Wellness Modules</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Introducing two powerful new modules to enhance your mental health journey: 
          AI-curated harmonious music and guided video exercises, both seamlessly integrated 
          with your existing wellness ecosystem.
        </p>
      </div>

      {/* New Features */}
      <div className="grid lg:grid-cols-2 gap-8">
        {newFeatures.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card key={index} className={`${feature.bgColor} ${feature.borderColor} border-2 hover:shadow-xl transition-all duration-300`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-full bg-white flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary" className="text-xs">New!</Badge>
                        {feature.premium && (
                          <Badge className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                            <Crown className="w-3 h-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <CardDescription className="text-base mt-3">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Key Features */}
                <div>
                  <h4 className="font-semibold mb-3 text-foreground">Key Features:</h4>
                  <ul className="space-y-2">
                    {feature.features.map((item, idx) => (
                      <li key={idx} className="flex items-center space-x-2 text-sm">
                        <div className={`w-2 h-2 rounded-full ${feature.color.replace('text-', 'bg-')}`} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(feature.stats).map(([key, value]) => (
                    <div key={key} className="text-center p-3 bg-white/60 rounded-lg">
                      <div className={`text-lg font-bold ${feature.color}`}>{value}</div>
                      <div className="text-xs text-muted-foreground capitalize">{key}</div>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <Button 
                  onClick={feature.action}
                  className={`w-full ${feature.color.replace('text-', 'bg-').replace('600', '500')} hover:opacity-90 text-white`}
                  size="lg"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Try {feature.title}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Integration Features */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Seamless Integration</CardTitle>
          <CardDescription className="text-center text-lg">
            These new modules work perfectly with your existing My Aura features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {integrationFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Wellness Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">Complete Wellness Ecosystem</CardTitle>
          <CardDescription className="text-center">
            My Aura now offers the most comprehensive digital mental health platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            {wellnessStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center p-4 bg-muted/30 rounded-lg">
                  <Icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                  <div className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-8 text-center space-y-6">
          <div className="flex items-center justify-center space-x-4">
            <Music className="w-8 h-8 text-purple-600" />
            <Sparkles className="w-10 h-10 text-primary" />
            <Video className="w-8 h-8 text-blue-600" />
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              Ready to Enhance Your Wellness Journey?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Experience the power of AI-curated music and guided video exercises, 
              perfectly integrated with your existing wellness tools and progress tracking.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Button 
              onClick={() => navigate('/music')}
              className="bg-purple-600 hover:bg-purple-700 text-white flex-1"
            >
              <Headphones className="w-4 h-4 mr-2" />
              Try Music
            </Button>
            <Button 
              onClick={() => navigate('/videos')}
              className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
            >
              <Camera className="w-4 h-4 mr-2" />
              Try Videos
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Both modules include free content with premium options available
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default WellnessShowcase;