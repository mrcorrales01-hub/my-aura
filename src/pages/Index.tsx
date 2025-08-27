import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import {
  MessageCircle,
  Brain,
  Video,
  Music,
  Users,
  Award,
  Globe,
} from 'lucide-react';

/*
 * This component provides a cleaner, more focused landing page for the
 * Aura Wellness app. It features a bold hero section, a concise list
 * of core features, and a call‑to‑action. Replace the existing
 * Index.tsx file in src/pages with this file to improve the first
 * impression of your app. All strings are currently hard‑coded but can
 * easily be internationalized via your existing translation hooks.
 */

const features = [
  {
    icon: MessageCircle,
    title: 'AI Coach Auri',
    description:
      'Chat with an AI‑powered coach for real‑time guidance using CBT, DBT and ACT techniques.',
    link: '/chat',
  },
  {
    icon: Brain,
    title: 'Mood Tracking',
    description:
      'Record your mood and visualize patterns over time. Gain insights with AI‑driven analysis.',
    link: '/mood',
  },
  {
    icon: Video,
    title: 'Therapist Marketplace',
    description:
      'Connect with licensed therapists worldwide for secure video sessions with instant booking.',
    link: '/therapist',
  },
  {
    icon: Music,
    title: 'Therapeutic Music',
    description:
      'Listen to curated music and nature sounds designed to help you relax and focus.',
    link: '/music',
  },
  {
    icon: Users,
    title: 'Safe Community',
    description:
      'Join moderated forums and support groups. Share your journey and connect with others.',
    link: '/community',
  },
  {
    icon: Award,
    title: 'Gamification',
    description:
      'Earn badges and rewards as you progress on your wellness journey.',
    link: '/profile',
  },
  {
    icon: Globe,
    title: 'Multi‑Language',
    description:
      'Access the entire platform in 22 languages with culturally sensitive content.',
    link: '/settings',
  },
];

export default function ImprovedIndex() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top navigation bar */}
      <Navigation />
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-500 text-white overflow-hidden py-24">
        <div className="container mx-auto px-6 md:px-12 flex flex-col items-center text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold drop-shadow-xl">
            My Aura
          </h1>
          <p className="text-lg md:text-2xl max-w-2xl">
            Complete Mental Health & Wellness Platform
          </p>
          <p className="max-w-3xl text-sm md:text-base mt-2">
            AI coaching, licensed therapists, mood tracking, crisis support, therapeutic
            music, video exercises and safe community – all in one place.
          </p>
          {user ? (
            <Link
              to="/dashboard"
              className="bg-white text-indigo-700 hover:bg-gray-100 font-medium px-6 py-3 rounded-full shadow-lg mt-4"
            >
              Go to Dashboard
            </Link>
          ) : (
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <Link
                to="/signup"
                className="bg-white text-indigo-700 hover:bg-gray-100 font-medium px-6 py-3 rounded-full shadow-lg"
              >
                Start Free Trial
              </Link>
              <Link
                to="/pricing"
                className="bg-indigo-100 text-white hover:bg-indigo-200 font-medium px-6 py-3 rounded-full shadow-lg"
              >
                View Pricing
              </Link>
            </div>
          )}
        </div>
        {/* subtle background pattern */}
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1524594019417-340aaacb3f09?auto=format&fit=crop&w=800&q=60')] bg-cover bg-center"></div>
      </section>
      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="text-center text-3xl md:text-4xl font-bold mb-10">
            Explore our key features
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, description, link }) => (
              <Link
                key={title}
                to={link}
                className="group flex flex-col items-start p-6 bg-white rounded-2xl shadow hover:shadow-xl transition-shadow duration-300"
              >
                <Icon className="h-8 w-8 text-indigo-600 mb-4 group-hover:text-indigo-800" />
                <h3 className="text-xl font-semibold mb-2 group-hover:text-indigo-800">
                  {title}
                </h3>
                <p className="text-sm text-gray-600 mb-4 flex-1">
                  {description}
                </p>
                <span className="text-indigo-600 group-hover:text-indigo-800 font-medium inline-flex items-center">
                  Explore
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="ml-1 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 12h14m-6-6l6 6-6 6"
                    />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-16 bg-indigo-600 text-white text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Ready to start your wellness journey?
        </h2>
        <p className="max-w-lg mx-auto mb-6">
          Join thousands who are transforming their mental health with AI‑powered
          coaching and comprehensive wellness tools.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link
            to="/signup"
            className="bg-white text-indigo-700 hover:bg-indigo-100 font-medium px-6 py-3 rounded-full shadow"
          >
            Start Free Trial
          </Link>
          <Link
            to="/pricing"
            className="bg-indigo-200 text-indigo-900 hover:bg-indigo-300 font-medium px-6 py-3 rounded-full shadow"
          >
            View Plans
          </Link>
        </div>
      </section>
    </div>
  );
}
      </section>
    </div>
  );
}
