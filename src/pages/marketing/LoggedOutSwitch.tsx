import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

export default function LoggedOutSwitch({ app }: { app: JSX.Element }) {
  const [ready, setReady] = useState(false);
  const [logged, setLogged] = useState<boolean>(false);
  
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setLogged(!!session);
      setReady(true);
    })();
  }, []);
  
  if (!ready) return <div className="p-4">Loading...</div>;
  
  const flag = (import.meta.env.VITE_MARKETING_HOME || '').toLowerCase() === 'true';
  if (!flag) return app;
  if (logged) return app;
  
  return <Navigate to="/welcome" replace />;
}
