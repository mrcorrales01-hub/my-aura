import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/contexts/AuthContext';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { HeaderStatusBadge } from '@/components/HeaderStatusBadge';

export function Navbar() {
  const { user, signOut } = useAuthContext();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <nav className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold text-primary">
            My Aura 2.0
          </Link>
          
          <div className="flex items-center space-x-4">
            <HeaderStatusBadge />
            <LanguageSwitcher />
            {user ? (
              <Button onClick={handleSignOut} variant="outline" size="sm">
                Logout
              </Button>
            ) : (
              <Button asChild variant="outline" size="sm">
                <Link to="/auth">Login</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}