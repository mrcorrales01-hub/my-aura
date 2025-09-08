import React from 'react';
import { Hero } from '@/components/Hero';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAuthContext } from '@/contexts/AuthContext';
import Dashboard from '@/components/Dashboard';
import RecommendedExercises from '@/features/reco/RecommendedExercises';

const Index = () => {
  const { user } = useAuthContext();

  if (user) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Dashboard />
            </div>
            <div className="space-y-6">
              <RecommendedExercises />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Footer />
    </div>
  );
};

export default Index;