import { createBrowserRouter } from 'react-router-dom';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Chat from '@/pages/Chat';
import Mood from '@/pages/Mood';
import Media from '@/pages/Media';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';
import Health from '@/pages/Health';
import ChatBox from '@/features/auri/components/ChatBox';
import RoleplayPage from '@/features/auri/roleplays/RoleplayPage';

export const router = createBrowserRouter([
  { path: '/', element: <Index /> },
  { path: '/auth', element: <Auth /> },
  { path: '/chat', element: <ChatBox /> },
  { path: '/roleplay', element: <RoleplayPage /> },
  { path: '/health', element: <Health /> },
  { path: '/mood', element: <Mood /> },
  { path: '/media', element: <Media /> },
  { path: '/settings', element: <Settings /> },
  { path: '*', element: <NotFound /> },
]);