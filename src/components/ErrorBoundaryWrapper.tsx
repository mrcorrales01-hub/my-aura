import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ReactNode } from "react";

interface ErrorBoundaryWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const ErrorBoundaryWrapper = ({ children, fallback }: ErrorBoundaryWrapperProps) => {
  return (
    <ErrorBoundary fallback={fallback}>
      {children}
    </ErrorBoundary>
  );
};