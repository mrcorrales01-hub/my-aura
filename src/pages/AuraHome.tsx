import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { MoodQuickCheck } from '@/components/MoodQuickCheck';
import { HomeHeader } from '@/features/home/components/HomeHeader';
import { QuickActions } from '@/features/home/components/QuickActions';
import { MoodMiniChart } from '@/features/home/components/MoodMiniChart';
import { RecentJournal } from '@/features/home/components/RecentJournal';
import { TodayTasks } from '@/features/home/components/TodayTasks';
import { ExerciseCard } from '@/features/home/components/ExerciseCard';
import { CrisisCard } from '@/features/home/components/CrisisCard';
import { StreakHeatmap } from '@/features/mood/components/StreakHeatmap';
import RecommendedExercises from '@/features/reco/RecommendedExercises';

const AuraHome = () => {
  const { user, loading } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div data-testid="home-header">
          <HomeHeader />
        </div>

        {/* Quick Mood Check */}
        <div className="mb-6" data-testid="mood-quick-check">
          <MoodQuickCheck />
        </div>

        {/* Quick Actions */}
        <div className="mb-6" data-testid="quick-actions">
          <QuickActions />
        </div>

        {/* Data Panels - Responsive Grid */}
        <div className="grid gap-4 md:gap-6">
          {/* Streak Heatmap - Full width on mobile, positioned prominently */}
          <div className="col-span-full">
            <StreakHeatmap />
          </div>
          
          {/* Mobile: Stack all cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {/* Mood Chart - Spans 2 columns on larger screens */}
            <div className="sm:col-span-2 lg:col-span-1">
              <MoodMiniChart />
            </div>

            {/* Recent Journal */}
            <div className="lg:col-span-1">
              <RecentJournal />
            </div>

            {/* Today's Tasks */}
            <div className="lg:col-span-1">
              <TodayTasks />
            </div>

            {/* Recommended Exercises */}
            <div className="lg:col-span-1">
              <RecommendedExercises />
            </div>
          </div>

          {/* Crisis Card - Full width, always visible */}
          <div className="mt-4">
            <CrisisCard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuraHome;