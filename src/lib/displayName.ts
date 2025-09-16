import { User } from '@supabase/supabase-js';

export const getDisplayName = (user: User | null): string => {
  if (!user) return 'vän';
  
  // Try to get display name from various sources
  const displayName = 
    user.user_metadata?.display_name ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    (user.email ? user.email.split('@')[0] : null);
    
  return displayName || 'vän';
};