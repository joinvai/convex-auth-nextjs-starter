"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthErrorBoundary } from "./auth-error-boundary";
import { 
  useAuthErrorHandler, 
  NetworkError, 
  RateLimitError, 
  SessionExpiredError, 
  EmailServiceError, 
  ConfigurationError,
  getUserFriendlyErrorMessage,
  isRecoverableError
} from "./error-handler";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Component that throws errors for testing
function ErrorThrower({ errorType }: { errorType: string }) {
  const throwError = () => {
    switch (errorType) {
      case "network":
        throw new NetworkError("Network connection failed");
      case "rateLimit":
        throw new RateLimitError("Too many requests");
      case "sessionExpired":
        throw new SessionExpiredError("Session has expired");
      case "emailService":
        throw new EmailServiceError("Email service unavailable");
      case "configuration":
        throw new ConfigurationError("Invalid API configuration");
      case "generic":
        throw new Error("Generic error for testing");
      default:
        throw new Error("Unknown error type");
    }
  };

  // This will trigger the error boundary
  throwError();
  return null;
}

export function ErrorHandlingTest() {
  const [activeTest, setActiveTest] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Array<{
    type: string;
    message: string;
    recoverable: boolean;
    severity: string;
  }>>([]);

  const { executeWithRetry, handleError, isRetrying, retryCount } = useAuthErrorHandler({
    context: "error-handling-test",
    showToast: false, // Don't show toasts during testing
  });

  const testErrorTypes = [
    { key: "network", label: "Network Error", description: "Simulates connection issues" },
    { key: "rateLimit", label: "Rate Limit Error", description: "Simulates too many requests" },
    { key: "sessionExpired", label: "Session Expired", description: "Simulates expired session" },
    { key: "emailService", label: "Email Service Error", description: "Simulates email service issues" },
    { key: "configuration", label: "Configuration Error", description: "Simulates config problems" },
    { key: "generic", label: "Generic Error", description: "Simulates unknown errors" },
  ];

  const testErrorHandling = async (errorType: string) => {
    try {
      await executeWithRetry(async () => {
        // Simulate different error types
        switch (errorType) {
          case "network":
            throw new NetworkError("Simulated network error");
          case "rateLimit":
            throw new RateLimitError("Simulated rate limit error");
          case "sessionExpired":
            throw new SessionExpiredError("Simulated session expiration");
          case "emailService":
            throw new EmailServiceError("Simulated email service error");
          case "configuration":
            throw new ConfigurationError("Simulated configuration error");
          case "generic":
            throw new Error("Simulated generic error");
          default:
            throw new Error("Unknown error type");
        }
      }, `test-${errorType}`);
    } catch (error) {
      const authError = handleError(error, `test-${errorType}`);
      const friendlyMessage = getUserFriendlyErrorMessage(error);
      const recoverable = isRecoverableError(error);

      setTestResults(prev => [...prev, {
        type: errorType,
        message: friendlyMessage,
        recoverable,
        severity: authError.severity || "unknown",
      }]);
    }
  };

  const testErrorBoundary = (errorType: string) => {
    setActiveTest(errorType);
  };

  const resetTests = () => {
    setActiveTest(null);
    setTestResults([]);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Error Handling Test Suite</CardTitle>
          <CardDescription>
            Test the comprehensive error handling system for authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button onClick={resetTests} variant="outline" size="sm">
              Reset Tests
            </Button>
            {isRetrying && (
              <Badge variant="secondary">
                Retrying... (Attempt {retryCount + 1})
              </Badge>
            )}
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-3">Error Handler Tests</h3>
            <p className="text-sm text-muted-foreground mb-4">
              These tests use the error handler with retry logic
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {testErrorTypes.map((test) => (
                <Button
                  key={test.key}
                  onClick={() => testErrorHandling(test.key)}
                  variant="outline"
                  size="sm"
                  className="justify-start"
                  disabled={isRetrying}
                >
                  {test.label}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-3">Error Boundary Tests</h3>
            <p className="text-sm text-muted-foreground mb-4">
              These tests trigger the error boundary component
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {testErrorTypes.map((test) => (
                <Button
                  key={`boundary-${test.key}`}
                  onClick={() => testErrorBoundary(test.key)}
                  variant="outline"
                  size="sm"
                  className="justify-start"
                >
                  {test.label} (Boundary)
                </Button>
              ))}
            </div>
          </div>

          {testResults.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-3">Test Results</h3>
                <div className="space-y-2">
                  {testResults.map((result, index) => (
                    <Alert key={index}>
                      <AlertDescription>
                        <div className="flex items-center justify-between">
                          <div>
                            <strong>{result.type}:</strong> {result.message}
                          </div>
                          <div className="flex gap-2">
                            <Badge variant={result.recoverable ? "default" : "destructive"}>
                              {result.recoverable ? "Recoverable" : "Non-recoverable"}
                            </Badge>
                            <Badge variant="outline">
                              {result.severity}
                            </Badge>
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Error Boundary Test Area */}
      {activeTest && (
        <AuthErrorBoundary
          onError={(error, errorInfo) => {
            console.log("Error boundary caught:", error, errorInfo);
            // Reset after error is caught
            setTimeout(() => setActiveTest(null), 100);
          }}
        >
          <ErrorThrower errorType={activeTest} />
        </AuthErrorBoundary>
      )}
    </div>
  );
}