"use client";

import { AuthenticationWrapper } from "./authentication-wrapper";
import { UserProfile } from "./user-profile";
import { MagicLinkTest } from "./magic-link-test";
import { useSessionInfo } from "./session-manager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function AuthDemo() {
  const sessionInfo = useSessionInfo();
  const isAuthenticated = sessionInfo.isAuthenticated;

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
        {/* This content is only shown when authenticated - now shows detailed user profile */}
        <UserProfile />
      </AuthenticationWrapper>

      {/* Magic Link Test Component */}
      <MagicLinkTest />

      {/* Enhanced status indicator with session information */}
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-lg">System Status</CardTitle>
          <CardDescription>
            Real-time authentication and session information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Authentication:</span>
            <Badge variant={isAuthenticated ? "default" : "secondary"}>
              {isAuthenticated ? "✅ Signed In" : "❌ Not Signed In"}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Session:</span>
            <Badge variant={sessionInfo.sessionActive ? "default" : "secondary"}>
              {sessionInfo.sessionActive ? "🟢 Active" : "🔴 Inactive"}
            </Badge>
          </div>
          
          {sessionInfo.user && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">User Email:</span>
              <span className="text-sm text-muted-foreground truncate max-w-48">
                {sessionInfo.user.email}
              </span>
            </div>
          )}
          
          {sessionInfo.lastChecked && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Last Check:</span>
              <span className="text-xs font-mono text-muted-foreground">
                {new Date(sessionInfo.lastChecked).toLocaleTimeString()}
              </span>
            </div>
          )}

          <div className="pt-2 border-t text-xs text-muted-foreground">
            Session persists across page refreshes and browser restarts.
            Try refreshing the page to see session persistence in action.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}