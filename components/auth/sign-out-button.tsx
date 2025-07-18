"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { useAuthErrorHandler } from "./error-handler";

interface SignOutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
  showIcon?: boolean;
  clearAllSessions?: boolean; // Option to clear all user sessions
}

export function SignOutButton({
  variant = "outline",
  size = "default",
  className,
  children = "Sign out",
  showIcon = false,
  clearAllSessions = false
}: SignOutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { signOut } = useAuthActions();
  const currentUser = useQuery(api.users.getCurrentUser);
  const performSecureSignOut = useMutation(api.users.performSecureSignOut);

  const { executeWithRetry, handleError } = useAuthErrorHandler({
    context: "sign-out",
    retryConfig: {
      maxRetries: 1, // Only retry once for sign-out
      baseDelay: 1000,
    }
  });

  const handleSignOut = async () => {
    try {
      setIsLoading(true);

      // Signal to other tabs that user is signing out
      if (typeof window !== 'undefined') {
        localStorage.setItem('convex-auth-signout', 'true');
      }

      // Execute secure sign-out with session cleanup
      await executeWithRetry(async () => {
        // First perform secure session cleanup
        if (currentUser) {
          await performSecureSignOut({
            email: currentUser.email,
            clearAllSessions: clearAllSessions,
          });
        }

        // Then perform the actual sign-out
        await signOut();
      }, "secure-sign-out");

      // Clear session debug data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('convex-session-debug');
        localStorage.removeItem('convex-auth-signout');
      }

      toast.success(
        clearAllSessions
          ? "Successfully signed out from all devices"
          : "Successfully signed out",
        {
          duration: 2000,
        }
      );

    } catch (error) {
      // Clean up localStorage even if sign-out fails
      if (typeof window !== 'undefined') {
        localStorage.removeItem('convex-auth-signout');
      }

      // Use the error handler for consistent error handling
      const authError = handleError(error, "sign-out");

      // Show a fallback toast if the error handler didn't show one
      if (!authError.retryable) {
        toast.error("Sign-out failed. Please refresh the page.", {
          duration: 5000,
          action: {
            label: "Refresh",
            onClick: () => window.location.reload(),
          },
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleSignOut}
      disabled={isLoading}
    >
      {showIcon && <LogOut className="h-4 w-4 mr-2" />}
      {isLoading ? "Signing out..." : children}
    </Button>
  );
}