import React from 'react';
import { Community as CommunityComponent } from '@/components/Community';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const Community: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <CommunityComponent />;
};

export default Community;