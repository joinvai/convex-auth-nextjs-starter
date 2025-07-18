"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SignOutButton } from "./sign-out-button";
import { useSessionInfo } from "./session-manager";
import { useEffect, useState } from "react";
import { User, Clock, Shield, Mail, RefreshCw } from "lucide-react";

export function UserProfile() {
  const { isAuthenticated, isLoading } = useSessionInfo();
  const currentUser = useQuery(api.users.getCurrentUser);
  const userSession = useQuery(api.users.getUserSession);
  const updateLastActive = useMutation(api.users.updateLastActive);
  
  const [lastActiveUpdate, setLastActiveUpdate] = useState<Date | null>(null);
  const [sessionDuration, setSessionDuration] = useState<string>("");

  // Update last active timestamp periodically
  useEffect(() => {
    if (!isAuthenticated) return;

    const updateActivity = async () => {
      try {
        await updateLastActive();
        setLastActiveUpdate(new Date());
      } catch (error) {
        console.error("Failed to update last active:", error);
      }
    };

    // Update immediately
    updateActivity();

    // Update every 5 minutes
    const interval = setInterval(updateActivity, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, updateLastActive]);

  // Calculate session duration
  useEffect(() => {
    if (!userSession?.lastChecked) return;

    const updateDuration = () => {
      const now = Date.now();
      const sessionStart = userSession.lastChecked;
      const duration = now - sessionStart;
      
      const minutes = Math.floor(duration / (1000 * 60));
      const hours = Math.floor(minutes / 60);
      
      if (hours > 0) {
        setSessionDuration(`${hours}h ${minutes % 60}m`);
      } else {
        setSessionDuration(`${minutes}m`);
      }
    };

    updateDuration();
    const interval = setInterval(updateDuration, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [userSession?.lastChecked]);

  // Handle session expiration (this would typically be handled by Convex Auth automatically)
  useEffect(() => {
    if (isAuthenticated && userSession && !userSession.sessionActive) {
      console.warn("Session appears to be expired");
      // In a real app, you might want to show a notification or redirect
    }
  }, [isAuthenticated, userSession]);

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!isAuthenticated || !currentUser) {
    return null;
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          User Profile
        </CardTitle>
        <CardDescription>
          Your account information and session details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User Information */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Email:</span>
            <span className="text-sm text-muted-foreground">{currentUser.email}</span>
          </div>
          
          {currentUser.name && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Name:</span>
              <span className="text-sm text-muted-foreground">{currentUser.name}</span>
            </div>
          )}

          {currentUser.emailVerificationTime && (
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Email Verified:</span>
              <Badge variant="secondary" className="text-xs">
                {formatDate(currentUser.emailVerificationTime)}
              </Badge>
            </div>
          )}
        </div>

        {/* Session Information */}
        <div className="space-y-3 pt-3 border-t">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Session Information
          </h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <Badge variant="default" className="text-xs">
                ✅ Active
              </Badge>
            </div>
            
            {sessionDuration && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-mono text-xs">{sessionDuration}</span>
              </div>
            )}
            
            {lastActiveUpdate && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Active:</span>
                <span className="font-mono text-xs">
                  {lastActiveUpdate.toLocaleTimeString()}
                </span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-muted-foreground">User ID:</span>
              <span className="font-mono text-xs truncate max-w-24" title={currentUser._id}>
                {currentUser._id.slice(-8)}
              </span>
            </div>
          </div>
        </div>

        {/* Session Actions */}
        <div className="space-y-3 pt-3 border-t">
          <div className="flex gap-2">
            <SignOutButton className="flex-1" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              Refresh
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground text-center">
            Session persists across page refreshes and browser restarts
          </div>
        </div>

        {/* Debug Information (only in development) */}
        {process.env.NODE_ENV === 'development' && userSession && (
          <details className="pt-3 border-t">
            <summary className="text-xs text-muted-foreground cursor-pointer">
              Debug Info (Development Only)
            </summary>
            <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-auto">
              {JSON.stringify({
                isAuthenticated: userSession.isAuthenticated,
                sessionActive: userSession.sessionActive,
                userId: userSession.userId,
                lastChecked: userSession.lastChecked ? new Date(userSession.lastChecked).toISOString() : null,
              }, null, 2)}
            </pre>
          </details>
        )}
      </CardContent>
    </Card>
  );
}