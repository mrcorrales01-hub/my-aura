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

import VisitHub from '@/pages/visit/VisitHub';
import VisitPrepare from '@/pages/visit/VisitPrepare';
import VisitPractice from '@/pages/visit/VisitPractice';
import VisitAfter from '@/pages/visit/VisitAfter';

export const router = createBrowserRouter([
  { path: '/', element: <Index /> },
  { path: '/auth', element: <Auth /> },
  { path: '/onboarding', element: <Onboarding /> },
  { path: '/chat', element: <ErrorBoundaryWrapper><Chat /></ErrorBoundaryWrapper> },
  { path: '/visit', element: <ErrorBoundaryWrapper><VisitHub /></ErrorBoundaryWrapper> },
  { path: '/visit/prepare', element: <ErrorBoundaryWrapper><VisitPrepare /></ErrorBoundaryWrapper> },
  
  { path: '/visit/practice', element: <ErrorBoundaryWrapper><VisitPractice /></ErrorBoundaryWrapper> },
  { path: '/visit/after', element: <ErrorBoundaryWrapper><VisitAfter /></ErrorBoundaryWrapper> },
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