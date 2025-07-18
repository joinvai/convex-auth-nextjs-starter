"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { SignInForm } from "./sign-in-form";
import { useSessionInfo } from "./session-manager";

interface AuthenticationWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loadingFallback?: React.ReactNode;
}

export function AuthenticationWrapper({ 
  children, 
  fallback,
  loadingFallback 
}: AuthenticationWrapperProps) {
  const { isLoading, isAuthenticated } = useSessionInfo();

  // Show loading state while authentication status is being determined
  if (isLoading) {
    if (loadingFallback) {
      return <>{loadingFallback}</>;
    }
    
    // Enhanced loading state with better messaging for magic link flow
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-muted-foreground">
            Checking authentication status...
          </p>
        </div>
        <div className="space-y-2 w-full max-w-md">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-10 w-full max-w-md" />
      </div>
    );
  }

  // Show authenticated content if user is signed in
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Show fallback or default sign-in form if user is not authenticated
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default fallback is the sign-in form
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <SignInForm />
    </div>
  );
}