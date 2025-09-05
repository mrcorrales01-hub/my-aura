import React, { useState } from 'react';
import { MoodForm } from '@/features/mood/MoodForm';
import { MoodList } from '@/features/mood/MoodList';
import { MoodChart } from '@/components/MoodChart';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const Mood = () => {
  const [entries, setEntries] = useState([]);

  const handleMoodSubmit = (entry: any) => {
    setEntries(prev => [...prev, entry]);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Mood Tracking</h1>
        <div className="grid gap-8">
          <MoodForm onSubmit={handleMoodSubmit} />
          <MoodChart entries={entries} />
          <MoodList entries={entries} />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Mood;