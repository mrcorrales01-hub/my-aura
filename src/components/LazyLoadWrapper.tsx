import React, { Suspense } from 'react';
import { useToast } from "@/hooks/use-toast";
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

interface LazyLoadWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const LazyLoadWrapper = ({ children, fallback }: LazyLoadWrapperProps) => {
  const { toast } = useToast();

  const handleError = () => {
    toast({
      title: "Loading Error",
      description: "Failed to load component. Please try refreshing the page.",
      variant: "destructive",
    });
  };

  return (
    <Suspense fallback={fallback || <LoadingSkeleton />}>
      <div onError={handleError}>
        {children}
      </div>
    </Suspense>
  );
};