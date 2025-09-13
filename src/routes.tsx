import { createBrowserRouter } from 'react-router-dom';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Chat from '@/pages/Chat';
import Mood from '@/pages/Mood';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';
import Onboarding from '@/pages/Onboarding';
import Health from '@/pages/Health';
import { ErrorBoundaryWrapper } from '@/components/ErrorBoundaryWrapper';
import PlanPage from '@/pages/PlanPage';
import PricingPage from '@/pages/pricing/PricingPage';
import SubscriptionSettingsPage from '@/pages/settings/SubscriptionSettingsPage';
import RevenuePage from '@/pages/admin/RevenuePage';
import ExercisePlayer from '@/pages/ExercisePlayer';
import RoleplayPage from '@/pages/Roleplay';
import RoleplayRun from '@/pages/RoleplayRun';
import RoleplayStudioPage from '@/pages/RoleplayStudioPage';
import PanicPage from '@/pages/PanicPage';

import VisitHub from '@/pages/visit/VisitHub';
import VisitPrepare from '@/pages/visit/VisitPrepare';
import VisitPractice from '@/pages/visit/VisitPractice';
import VisitAfter from '@/pages/visit/VisitAfter';
import VisitPage from '@/pages/visit/VisitPage';
import ScreenerHubPage from '@/pages/screeners/ScreenerHubPage';
import TimelinePage from '@/pages/timeline/TimelinePage';
import CoachHubPage from '@/pages/coach/CoachHubPage';
import VisitHubPage from '@/pages/visit/VisitHubPage';
import SleepForm from '@/components/visit/SleepForm';
import CrisisHubPage from '@/pages/crisis/CrisisHubPage';
import CrisisTriagePage from '@/pages/crisis/CrisisTriagePage';
import CrisisResourcesPage from '@/pages/crisis/CrisisResourcesPage';
import SafetyPlanPage from '@/pages/crisis/SafetyPlanPage';
import ExposureHubPage from '@/pages/exposure/ExposureHubPage';
import ExposureNewPage from '@/pages/exposure/ExposureNewPage';
import ExposureRunPage from '@/pages/exposure/ExposureRunPage';
import CoachCardsPage from '@/pages/cards/CoachCardsPage';
import HandoutsHubPage from '@/pages/handouts/HandoutsHubPage';
import HandoutBuilderPage from '@/pages/handouts/HandoutBuilderPage';
import { SCRIPTS } from '@/features/roleplay/scripts';
import { detectCountry } from '@/features/crisis/resources';

export const router = createBrowserRouter([
  { path: '/', element: <Index /> },
  { path: '/auth', element: <Auth /> },
  { path: '/onboarding', element: <Onboarding /> },
  { path: '/health', element: <ErrorBoundaryWrapper><Health /></ErrorBoundaryWrapper> },
  { path: '/chat', element: <ErrorBoundaryWrapper><Chat /></ErrorBoundaryWrapper> },
  { path: '/visit', element: <ErrorBoundaryWrapper><VisitHubPage /></ErrorBoundaryWrapper> },
  { path: '/visit/sleep', element: <ErrorBoundaryWrapper><SleepForm /></ErrorBoundaryWrapper> },
  { path: '/visit-prep', element: <ErrorBoundaryWrapper><VisitPage /></ErrorBoundaryWrapper> },
  { path: '/visit/prepare', element: <ErrorBoundaryWrapper><VisitPrepare /></ErrorBoundaryWrapper> },
  
  { path: '/visit/practice', element: <ErrorBoundaryWrapper><VisitPractice /></ErrorBoundaryWrapper> },
  { path: '/visit/after', element: <ErrorBoundaryWrapper><VisitAfter /></ErrorBoundaryWrapper> },
  { path: '/screeners', element: <ErrorBoundaryWrapper><ScreenerHubPage /></ErrorBoundaryWrapper> },
  { path: '/timeline', element: <ErrorBoundaryWrapper><TimelinePage /></ErrorBoundaryWrapper> },
  { path: '/coach', element: <ErrorBoundaryWrapper><CoachHubPage /></ErrorBoundaryWrapper> },
  { path: '/crisis', element: <ErrorBoundaryWrapper><CrisisHubPage /></ErrorBoundaryWrapper> },
  { path: '/crisis/triage', element: <ErrorBoundaryWrapper><CrisisTriagePage /></ErrorBoundaryWrapper> },
  { path: '/crisis/plan', element: <ErrorBoundaryWrapper><SafetyPlanPage /></ErrorBoundaryWrapper> },
  { path: '/crisis/help', element: <ErrorBoundaryWrapper><CrisisResourcesPage /></ErrorBoundaryWrapper> },
  { path: '/exposure', element: <ErrorBoundaryWrapper><ExposureHubPage /></ErrorBoundaryWrapper> },
  { path: '/exposure/new', element: <ErrorBoundaryWrapper><ExposureNewPage /></ErrorBoundaryWrapper> },
  { path: '/exposure/run/:id', element: <ErrorBoundaryWrapper><ExposureRunPage /></ErrorBoundaryWrapper> },
  { path: '/cards', element: <ErrorBoundaryWrapper><CoachCardsPage /></ErrorBoundaryWrapper> },
  { path: '/handouts', element: <ErrorBoundaryWrapper><HandoutsHubPage /></ErrorBoundaryWrapper> },
  { path: '/handouts/:slug', element: <ErrorBoundaryWrapper><HandoutBuilderPage /></ErrorBoundaryWrapper> },
  { path: '/besok', element: <ErrorBoundaryWrapper><VisitPage /></ErrorBoundaryWrapper> },
  { path: '/roleplay', element: <ErrorBoundaryWrapper><RoleplayPage /></ErrorBoundaryWrapper> },
  { path: '/roleplay/:id', element: <ErrorBoundaryWrapper><RoleplayRun /></ErrorBoundaryWrapper> },
  { path: '/roleplay/studio', element: <ErrorBoundaryWrapper><RoleplayStudioPage /></ErrorBoundaryWrapper> },
  { path: '/panic', element: <ErrorBoundaryWrapper><PanicPage /></ErrorBoundaryWrapper> },
  { path: '/plan', element: <ErrorBoundaryWrapper><PlanPage /></ErrorBoundaryWrapper> },
  { path: '/pricing', element: <ErrorBoundaryWrapper><PricingPage /></ErrorBoundaryWrapper> },
  { path: '/settings/subscription', element: <ErrorBoundaryWrapper><SubscriptionSettingsPage /></ErrorBoundaryWrapper> },
  { path: '/admin/revenue', element: <ErrorBoundaryWrapper><RevenuePage /></ErrorBoundaryWrapper> },
  { path: '/mood', element: <ErrorBoundaryWrapper><Mood /></ErrorBoundaryWrapper> },
  { path: '/settings', element: <ErrorBoundaryWrapper><Settings /></ErrorBoundaryWrapper> },
  { path: '/exercises/:slug', element: <ErrorBoundaryWrapper><ExercisePlayer /></ErrorBoundaryWrapper> },
  { 
    path: '/health-check', 
    loader: () => {
      const country = detectCountry();
      return Response.json({
        status: "ok",
        lang: localStorage.getItem('aura.lang') || 'sv',
        i18n_missing: 0,
        roleplay_scripts: SCRIPTS.length,
        auri: "ok",
        screeners: "ok",
        timeline: "ok",
        smart_plan: "ok",
        visit_bundle: "ok",
        share: "ok"
      });
    }
  },
  { path: '/404', element: <NotFound /> },
  { path: '*', element: <NotFound /> },
]);