import { useTranslation } from 'react-i18next';
import { Card } from '@/components/Card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuthContext } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Heart, MessageCircle, BookOpen, CheckSquare, Phone } from 'lucide-react';

const NewAuraHome = () => {
  const { t } = useTranslation(['home', 'common']);
  const { user, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          {t('home:greeting')}
        </h1>
        <p className="text-muted-foreground">
          {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        
        {/* Quick Mood Check */}
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <Heart className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">{t('home:quickMood')}</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Rate your mood from 1-10
          </p>
          <div className="flex flex-wrap gap-2">
            {[1,2,3,4,5,6,7,8,9,10].map(num => (
              <Button key={num} variant="outline" size="sm" className="w-8 h-8 p-0">
                {num}
              </Button>
            ))}
          </div>
        </Card>

        {/* Recommended Exercises */}
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <MessageCircle className="h-5 w-5 text-blue-500" />
            <h2 className="font-semibold text-foreground">{t('home:recommended')}</h2>
          </div>
          <div className="space-y-2">
            <div className="p-2 bg-muted rounded-lg">
              <p className="text-sm font-medium">Breathing Exercise</p>
              <p className="text-xs text-muted-foreground">5 minutes</p>
            </div>
            <div className="p-2 bg-muted rounded-lg">
              <p className="text-sm font-medium">Grounding 5-4-3-2-1</p>
              <p className="text-xs text-muted-foreground">3 minutes</p>
            </div>
          </div>
        </Card>

        {/* Recent Journal */}
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <BookOpen className="h-5 w-5 text-green-500" />
            <h2 className="font-semibold text-foreground">{t('home:recentJournal')}</h2>
          </div>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-3">No entries yet</p>
            <Button variant="outline" size="sm">
              Start writing
            </Button>
          </div>
        </Card>

        {/* Today's Tasks */}
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <CheckSquare className="h-5 w-5 text-purple-500" />
            <h2 className="font-semibold text-foreground">{t('home:todaysTasks')}</h2>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span className="text-sm">Morning meditation</span>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span className="text-sm">Gratitude journal</span>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span className="text-sm">Evening reflection</span>
            </div>
          </div>
        </Card>

        {/* Crisis Card */}
        <Card className="border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20 md:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3 mb-3">
            <Phone className="h-5 w-5 text-red-600" />
            <h2 className="font-semibold text-red-700 dark:text-red-400">{t('home:crisisHelp')}</h2>
          </div>
          <p className="text-sm text-red-600/80 dark:text-red-400/80 mb-4">
            24/7 support available
          </p>
          <Button 
            className="w-full bg-red-600 hover:bg-red-700 text-white"
            size="sm"
          >
            {t('home:openCrisis')}
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default NewAuraHome;