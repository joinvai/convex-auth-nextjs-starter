"use client";

import { useConvexAuth } from "@convex-dev/auth/react";
import { AuthenticationWrapper } from "./authentication-wrapper";
import { SignOutButton } from "./sign-out-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AuthDemo() {
  const { isAuthenticated } = useConvexAuth();

  return (
    <div className="space-y-6">
      <AuthenticationWrapper
        loadingFallback={
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Loading...</CardTitle>
              <CardDescription>Checking authentication status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        }
      >
        {/* This content is only shown when authenticated */}
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Welcome!</CardTitle>
            <CardDescription>
              You are successfully signed in to ShipOrSkip.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              ✅ Authentication successful
              <br />
              ✅ Session active
              <br />
              ✅ Protected content visible
            </div>
            
            <div className="flex gap-2">
              <SignOutButton />
              <SignOutButton variant="destructive" size="sm">
                Quick Sign Out
              </SignOutButton>
            </div>
          </CardContent>
        </Card>
      </AuthenticationWrapper>

      {/* Status indicator outside the wrapper */}
      <div className="text-center text-sm text-muted-foreground">
        Authentication Status: {isAuthenticated ? "✅ Signed In" : "❌ Not Signed In"}
      </div>
    </div>
  );
}