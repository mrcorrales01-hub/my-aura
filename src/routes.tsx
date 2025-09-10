import { createBrowserRouter } from 'react-router-dom';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Chat from '@/pages/Chat';
import Mood from '@/pages/Mood';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';
import Onboarding from '@/pages/Onboarding';
import { ErrorBoundaryWrapper } from '@/components/ErrorBoundaryWrapper';
import PlanPage from '@/pages/PlanPage';
import Pricing from '@/pages/Pricing';
import ExercisePlayer from '@/pages/ExercisePlayer';
import RoleplayPage from '@/pages/Roleplay';
import RoleplayRun from '@/pages/RoleplayRun';

export const router = createBrowserRouter([
  { path: '/', element: <Index /> },
  { path: '/auth', element: <Auth /> },
  { path: '/onboarding', element: <Onboarding /> },
  { path: '/chat', element: <ErrorBoundaryWrapper><Chat /></ErrorBoundaryWrapper> },
  { path: '/roleplay', element: <ErrorBoundaryWrapper><RoleplayPage /></ErrorBoundaryWrapper> },
  { path: '/roleplay/:id', element: <ErrorBoundaryWrapper><RoleplayRun /></ErrorBoundaryWrapper> },
  { path: '/plan', element: <ErrorBoundaryWrapper><PlanPage /></ErrorBoundaryWrapper> },
  { path: '/pricing', element: <ErrorBoundaryWrapper><Pricing /></ErrorBoundaryWrapper> },
  { path: '/mood', element: <ErrorBoundaryWrapper><Mood /></ErrorBoundaryWrapper> },
  { path: '/settings', element: <ErrorBoundaryWrapper><Settings /></ErrorBoundaryWrapper> },
  { path: '/exercises/:slug', element: <ErrorBoundaryWrapper><ExercisePlayer /></ErrorBoundaryWrapper> },
  { path: '/404', element: <NotFound /> },
  { path: '*', element: <NotFound /> },
]);