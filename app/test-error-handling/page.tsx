"use client";

import { ErrorHandlingTest } from "@/components/auth/error-handling-test";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, Info } from "lucide-react";

export default function TestErrorHandlingPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Error Handling Test Suite</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          This page tests the comprehensive error handling system implemented for the authentication flow.
          It includes error boundaries, retry mechanisms, user-friendly error messages, and network error handling.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Features Implemented
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="default">✓</Badge>
              <span className="text-sm">Error Boundaries</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default">✓</Badge>
              <span className="text-sm">Retry Mechanisms</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default">✓</Badge>
              <span className="text-sm">User-Friendly Messages</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default">✓</Badge>
              <span className="text-sm">Network Error Handling</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default">✓</Badge>
              <span className="text-sm">Rate Limit Handling</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default">✓</Badge>
              <span className="text-sm">Session Management</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Error Types Handled
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Network</Badge>
              <span className="text-sm">Connection issues</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Rate Limit</Badge>
              <span className="text-sm">Too many requests</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Session</Badge>
              <span className="text-sm">Expired sessions</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Email</Badge>
              <span className="text-sm">Service unavailable</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Config</Badge>
              <span className="text-sm">Misconfiguration</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Generic</Badge>
              <span className="text-sm">Unknown errors</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              Requirements Met
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">4.4</Badge>
              <span className="text-sm">Magic link security</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">5.4</Badge>
              <span className="text-sm">Email error handling</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">7.4</Badge>
              <span className="text-sm">Provider errors</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">8.4</Badge>
              <span className="text-sm">TypeScript errors</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>How to test:</strong> Use the buttons below to simulate different error scenarios. 
          The &quot;Error Handler Tests&quot; will show retry behavior and user-friendly messages, while 
          &quot;Error Boundary Tests&quot; will demonstrate how the error boundary catches and displays errors.
        </AlertDescription>
      </Alert>

      <ErrorHandlingTest />
    </div>
  );
}