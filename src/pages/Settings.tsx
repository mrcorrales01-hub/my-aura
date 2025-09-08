import React from 'react';
import { LanguageSwitcher } from '@/features/settings/LanguageSwitcher';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { DemoControls } from '@/components/DemoControls';

const Settings = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>
        <div className="max-w-2xl space-y-6">
          <LanguageSwitcher />
          <DemoControls />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Settings;