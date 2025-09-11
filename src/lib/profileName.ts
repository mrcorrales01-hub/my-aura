export const getDisplayName = (p?: {display_name?: string; full_name?: string; email?: string}) => {
  const n = p?.display_name || p?.full_name || (p?.email?.split('@')[0]) || 'vän';  
  return n.charAt(0).toUpperCase() + n.slice(1);
};