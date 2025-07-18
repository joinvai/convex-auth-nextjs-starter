"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";

interface SignOutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
}

export function SignOutButton({ 
  variant = "outline", 
  size = "default", 
  className,
  children = "Sign out"
}: SignOutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { signOut } = useAuthActions();

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut();
    } catch (error) {
      console.error("Sign-out error:", error);
      // Note: We don't show error UI here as sign-out should generally always work
      // and any errors would be handled by the auth system
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
      {isLoading ? "Signing out..." : children}
    </Button>
  );
}