"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthenticationWrapper } from "./authentication-wrapper";
import { useSessionInfo } from "./session-manager";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
}

export function ProtectedRoute({ 
  children, 
  fallback,
  redirectTo = "/",
  requireAuth = true
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useSessionInfo();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we're not loading and auth requirement isn't met
    if (!isLoading && requireAuth && !isAuthenticated) {
      const currentPath = window.location.pathname;
      const redirectUrl = `${redirectTo}${redirectTo.includes('?') ? '&' : '?'}redirect=${encodeURIComponent(currentPath)}`;
      router.push(redirectUrl);
    }
  }, [isLoading, isAuthenticated, requireAuth, redirectTo, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground">Verifying access...</p>
        <div className="space-y-2 w-full max-w-md">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated, show fallback
  if (requireAuth && !isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Authentication Required</h1>
          <p className="text-muted-foreground max-w-md">
            You need to be signed in to access this page. Please authenticate to continue.
          </p>
        </div>
        <Button onClick={() => router.push(redirectTo)}>
          Go to Sign In
        </Button>
      </div>
    );
  }

  // If user is authenticated or auth is not required, show protected content
  return <>{children}</>;
}

// Higher-order component for wrapping pages with protection
export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    fallback?: React.ReactNode;
    redirectTo?: string;
    requireAuth?: boolean;
  }
) {
  const ProtectedComponent = (props: P) => {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };

  ProtectedComponent.displayName = `withProtectedRoute(${Component.displayName || Component.name})`;
  
  return ProtectedComponent;
}