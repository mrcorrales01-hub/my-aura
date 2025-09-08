import { createBrowserRouter } from 'react-router-dom';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Chat from '@/pages/Chat';
import Mood from '@/pages/Mood';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';
import Health from '@/pages/Health';
import ExercisePlayer from '@/pages/ExercisePlayer';
import RoleplayPage from '@/features/auri/roleplays/RoleplayPage';

export const router = createBrowserRouter([
  { path: '/', element: <Index /> },
  { path: '/auth', element: <Auth /> },
  { path: '/chat', element: <Chat /> },
  { path: '/roleplay', element: <RoleplayPage /> },
  { path: '/health', element: <Health /> },
  { path: '/mood', element: <Mood /> },
  { path: '/settings', element: <Settings /> },
  { path: '/exercises/:slug', element: <ExercisePlayer /> },
  { path: '*', element: <NotFound /> },
]);