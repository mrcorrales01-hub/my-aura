import React from 'react';
import { CommunityFeed } from '@/components/community/CommunityFeed';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const Community: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Community Support
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Connect with others on similar journeys. Share your experiences, offer support, 
              and find strength in community. All interactions are moderated by AI to ensure a safe, 
              supportive environment.
            </p>
          </div>

          <CommunityFeed />
        </div>
      </div>
    </div>
  );
};

export default Community;