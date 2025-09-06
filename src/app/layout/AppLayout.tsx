import { Outlet, Navigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { AppNavigation } from '@/components/layout/AppNavigation';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const AppLayout = () => {
  const { user, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <AppNavigation />
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;