import { User } from '@supabase/supabase-js';

export function getDisplayName(user?: User | null, profile?: any) {
  const raw =
    profile?.display_name ||
    profile?.full_name ||
    user?.user_metadata?.name ||
    (user?.email ? user.email.split('@')[0] : null);
  return (raw?.toString().trim() || 'vän'); // Swedish fallback
}