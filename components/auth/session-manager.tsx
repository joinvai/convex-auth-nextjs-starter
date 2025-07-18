"use client";

import { useEffect, useState, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useAuthErrorHandler, SessionExpiredError } from "./error-handler";

interface SessionManagerProps {
  children: React.ReactNode;
  onSessionExpired?: () => void;
  sessionCheckInterval?: number; // in milliseconds
}

export function SessionManager({ 
  children, 
  onSessionExpired,
  sessionCheckInterval = 60000 // Check every minute by default
}: SessionManagerProps) {
  const userSession = useQuery(api.users.getUserSession);
  
  const [sessionWarningShown, setSessionWarningShown] = useState(false);
  const [lastSessionCheck, setLastSessionCheck] = useState<number>(Date.now());

  const { handleError } = useAuthErrorHandler({
    context: "session-manager",
    showToast: false, // We'll handle session-specific toasts
    retryConfig: {
      maxRetries: 2,
      baseDelay: 5000, // Longer delay for session checks
    }
  });

  const isAuthenticated = userSession?.isAuthenticated ?? false;
  const isLoading = userSession === undefined;

  // Handle session expiration with enhanced error handling
  const handleSessionExpired = useCallback(() => {
    if (!sessionWarningShown) {
      setSessionWarningShown(true);
      
      // Create a proper session expired error
      const sessionError = new SessionExpiredError();
      handleError(sessionError, "session-expiration");
      
      toast.error("Your session has expired. Please sign in again.", {
        duration: 8000,
        action: {
          label: "Refresh",
          onClick: () => window.location.reload(),
        },
      });
      
      if (onSessionExpired) {
        onSessionExpired();
      }
    }
  }, [sessionWarningShown, onSessionExpired, handleError]);

  // Monitor session status
  useEffect(() => {
    if (isLoading) return;

    // If user was authenticated but now isn't, handle session expiration
    if (!isAuthenticated && userSession === null && !isLoading) {
      // Only trigger if we had a previous session
      if (lastSessionCheck > 0) {
        handleSessionExpired();
      }
    }

    // Update last session check
    if (isAuthenticated && userSession?.isAuthenticated) {
      setLastSessionCheck(Date.now());
      setSessionWarningShown(false); // Reset warning flag when session is active
    }
  }, [isAuthenticated, userSession, isLoading, lastSessionCheck, handleSessionExpired]);

  // Periodic session health check
  useEffect(() => {
    if (!isAuthenticated || isLoading) return;

    const interval = setInterval(() => {
      // Check if session is still valid
      if (userSession && !userSession.sessionActive) {
        handleSessionExpired();
      }
      
      // Update last check timestamp
      setLastSessionCheck(Date.now());
    }, sessionCheckInterval);

    return () => clearInterval(interval);
  }, [isAuthenticated, isLoading, userSession, sessionCheckInterval, handleSessionExpired]);

  // Handle page visibility changes to refresh session when user returns
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated) {
        // User returned to the page, refresh session status
        setLastSessionCheck(Date.now());
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isAuthenticated]);

  // Handle storage events for cross-tab session management
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // If another tab signed out, this tab should also reflect the change
      if (e.key === 'convex-auth-signout' && e.newValue === 'true') {
        // Clear the flag and reload to sync auth state
        localStorage.removeItem('convex-auth-signout');
        window.location.reload();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Store session persistence data in localStorage for debugging
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sessionData = {
        isAuthenticated,
        lastCheck: lastSessionCheck,
        timestamp: Date.now(),
      };
      
      localStorage.setItem('convex-session-debug', JSON.stringify(sessionData));
    }
  }, [isAuthenticated, lastSessionCheck]);

  return <>{children}</>;
}

// Hook for components to access session information
export function useSessionInfo() {
  const userSession = useQuery(api.users.getUserSession);
  
  const isAuthenticated = userSession?.isAuthenticated ?? false;
  const isLoading = userSession === undefined;
  
  return {
    isAuthenticated,
    isLoading,
    sessionActive: userSession?.sessionActive ?? false,
    user: userSession?.user ?? null,
    lastChecked: userSession?.lastChecked ?? null,
  };
}