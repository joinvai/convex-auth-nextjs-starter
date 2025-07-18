"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

interface SignOutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
  showIcon?: boolean;
}

export function SignOutButton({ 
  variant = "outline", 
  size = "default", 
  className,
  children = "Sign out",
  showIcon = false
}: SignOutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { signOut } = useAuthActions();

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      
      // Signal to other tabs that user is signing out
      if (typeof window !== 'undefined') {
        localStorage.setItem('convex-auth-signout', 'true');
      }
      
      await signOut();
      
      // Clear session debug data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('convex-session-debug');
        localStorage.removeItem('convex-auth-signout');
      }
      
      toast.success("Successfully signed out", {
        duration: 2000,
      });
      
    } catch (error) {
      console.error("Sign-out error:", error);
      
      // Clean up localStorage even if sign-out fails
      if (typeof window !== 'undefined') {
        localStorage.removeItem('convex-auth-signout');
      }
      
      toast.error("Failed to sign out. Please try again.", {
        duration: 3000,
      });
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