import React from 'react';
import { AuthForm } from '@/features/auth/AuthForm';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const Auth = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container max-w-md mx-auto py-16">
        <AuthForm />
      </div>
      <Footer />
    </div>
  );
};

export default Auth;