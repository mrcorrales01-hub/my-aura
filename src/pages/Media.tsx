import React from 'react';
import { VideoList } from '@/features/media/VideoList';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const Media = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Video Exercises</h1>
        <VideoList />
      </div>
      <Footer />
    </div>
  );
};

export default Media;