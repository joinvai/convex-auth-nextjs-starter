"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

export class AuthErrorBoundary extends Component<Props, State> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    retryCount: 0,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      retryCount: 0,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Auth Error Boundary caught an error:", error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report error to monitoring service in production
    if (process.env.NODE_ENV === "production") {
      this.reportError(error, errorInfo);
    }
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // In a real application, you would send this to your error monitoring service
    // like Sentry, LogRocket, or similar
    console.error("Reporting error to monitoring service:", {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });
  };

  private handleRetry = () => {
    const { retryCount } = this.state;
    
    if (retryCount >= 3) {
      // Max retries reached, suggest page refresh
      window.location.reload();
      return;
    }

    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
    }));

    // Add a small delay before retry to prevent rapid retries
    this.retryTimeoutId = setTimeout(() => {
      // Force a re-render by updating state
      this.forceUpdate();
    }, 1000);
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  private getErrorMessage = (error: Error): string => {
    const message = error.message.toLowerCase();
    
    if (message.includes("network") || message.includes("fetch")) {
      return "Network connection error. Please check your internet connection and try again.";
    }
    
    if (message.includes("auth") || message.includes("authentication")) {
      return "Authentication error. Please try signing in again.";
    }
    
    if (message.includes("session") || message.includes("expired")) {
      return "Your session has expired. Please sign in again.";
    }
    
    if (message.includes("rate limit") || message.includes("too many")) {
      return "Too many requests. Please wait a moment before trying again.";
    }
    
    if (message.includes("email")) {
      return "Email service error. Please try again or contact support if the problem persists.";
    }
    
    if (message.includes("convex") || message.includes("database")) {
      return "Database connection error. Please try again in a moment.";
    }
    
    return "An unexpected error occurred. Please try again.";
  };

  private getErrorSeverity = (error: Error): "low" | "medium" | "high" => {
    const message = error.message.toLowerCase();
    
    if (message.includes("network") || message.includes("rate limit")) {
      return "low";
    }
    
    if (message.includes("auth") || message.includes("session")) {
      return "medium";
    }
    
    return "high";
  };

  public componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  public render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorMessage = this.getErrorMessage(this.state.error);
      const severity = this.getErrorSeverity(this.state.error);
      const { retryCount } = this.state;

      return (
        <div className="flex items-center justify-center min-h-[400px] p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Authentication Error
              </CardTitle>
              <CardDescription>
                Something went wrong with the authentication system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant={severity === "high" ? "destructive" : "default"}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {errorMessage}
                </AlertDescription>
              </Alert>

              {retryCount > 0 && (
                <div className="text-sm text-muted-foreground">
                  Retry attempt: {retryCount}/3
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={this.handleRetry}
                  variant="default"
                  className="flex-1"
                  disabled={retryCount >= 3}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {retryCount >= 3 ? "Refresh Page" : "Try Again"}
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex-1"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              </div>

              {/* Development error details */}
              {process.env.NODE_ENV === "development" && this.state.errorInfo && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-muted-foreground flex items-center gap-2">
                    <Bug className="h-4 w-4" />
                    Error Details (Development)
                  </summary>
                  <div className="mt-2 p-3 bg-muted rounded-md">
                    <div className="text-xs space-y-2">
                      <div>
                        <strong>Error:</strong>
                        <pre className="mt-1 text-xs overflow-auto">
                          {this.state.error.message}
                        </pre>
                      </div>
                      <div>
                        <strong>Stack:</strong>
                        <pre className="mt-1 text-xs overflow-auto max-h-32">
                          {this.state.error.stack}
                        </pre>
                      </div>
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="mt-1 text-xs overflow-auto max-h-32">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    </div>
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components to handle errors
export function useAuthErrorHandler() {
  const handleError = (error: Error, context?: string) => {
    console.error(`Auth error${context ? ` in ${context}` : ""}:`, error);
    
    // You could also dispatch to a global error state here
    // or show a toast notification
  };

  return { handleError };
}