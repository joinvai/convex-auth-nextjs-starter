"use client";

import { useState } from "react";
import { useConvexAuth, useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function MagicLinkTest() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  const [testEmail, setTestEmail] = useState("test@example.com");

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Magic Link Test
          <Badge variant={isAuthenticated ? "default" : "secondary"}>
            {isLoading ? "Loading..." : isAuthenticated ? "Authenticated" : "Not Authenticated"}
          </Badge>
        </CardTitle>
        <CardDescription>
          Test the magic link authentication flow
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm space-y-2">
          <div className="flex justify-between">
            <span>Status:</span>
            <span className={isAuthenticated ? "text-green-600" : "text-gray-500"}>
              {isLoading ? "Checking..." : isAuthenticated ? "✅ Signed In" : "❌ Not Signed In"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Loading:</span>
            <span>{isLoading ? "Yes" : "No"}</span>
          </div>
        </div>

        {isAuthenticated && (
          <div className="space-y-2">
            <p className="text-sm text-green-600 font-medium">
              🎉 Magic link authentication successful!
            </p>
            <Button 
              onClick={handleSignOut}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Sign Out
            </Button>
          </div>
        )}

        {!isAuthenticated && !isLoading && (
          <div className="text-sm text-muted-foreground">
            <p>Use the sign-in form above to test the magic link flow:</p>
            <ol className="list-decimal list-inside space-y-1 mt-2 text-xs">
              <li>Enter your email address</li>
              <li>Click "Send sign-in link"</li>
              <li>Check your email for the magic link</li>
              <li>Click the link to authenticate</li>
              <li>You'll be redirected back here as authenticated</li>
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
}