"use client";

import { useConvexAuth } from "@convex-dev/auth/react";
import { Skeleton } from "@/components/ui/skeleton";
import { SignInForm } from "./sign-in-form";

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
  const { isLoading, isAuthenticated } = useConvexAuth();

  // Show loading state while authentication status is being determined
  if (isLoading) {
    if (loadingFallback) {
      return <>{loadingFallback}</>;
    }
    
    // Default loading state
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
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