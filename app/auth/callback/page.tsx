"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionInfo } from "@/components/auth/session-manager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthErrorBoundary } from "@/components/auth/auth-error-boundary";
import { useAuthErrorHandler, getUserFriendlyErrorMessage } from "@/components/auth/error-handler";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export default function AuthCallbackPage() {
  return (
    <AuthErrorBoundary>
      <AuthCallbackContent />
    </AuthErrorBoundary>
  );
}

function AuthCallbackContent() {
  const { isLoading, isAuthenticated } = useSessionInfo();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { handleError } = useAuthErrorHandler({
    context: "auth-callback",
    showToast: false, // We'll handle UI feedback in the component
  });

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        setStatus("success");
        // Redirect to home page after successful authentication
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        setStatus("error");
        // Handle the authentication failure
        const error = new Error("Magic link authentication failed");
        const authError = handleError(error, "callback-verification");
        setErrorMessage(getUserFriendlyErrorMessage(authError));
      }
    }
  }, [isLoading, isAuthenticated, router, handleError]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Signing you in...</CardTitle>
            <CardDescription>
              Please wait while we verify your magic link.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-sm text-muted-foreground text-center">
              This should only take a moment...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-green-600">✅ Sign-in successful!</CardTitle>
            <CardDescription>
              You have been successfully authenticated.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Redirecting you to the application...
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: "100%" }}></div>
              </div>
            </div>
            <Button
              onClick={() => router.push("/")}
              className="w-full"
            >
              Continue to App
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Authentication failed
          </CardTitle>
          <CardDescription>
            There was a problem with your magic link.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {errorMessage && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}

          <div className="text-sm text-muted-foreground space-y-2">
            <p>This could happen if:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>The magic link has expired (links expire after 15 minutes)</li>
              <li>The link has already been used</li>
              <li>There was a network error during verification</li>
              <li>The link was corrupted or incomplete</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="flex-1"
            >
              Try Again
            </Button>
            <Button
              onClick={() => router.push("/")}
              className="flex-1"
            >
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}