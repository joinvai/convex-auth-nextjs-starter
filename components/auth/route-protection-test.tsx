"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSessionInfo } from "./session-manager";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface RouteTestResult {
  route: string;
  accessible: boolean;
  redirected: boolean;
  error?: string;
}

export function RouteProtectionTest() {
  const { isAuthenticated, isLoading } = useSessionInfo();
  const [testResults, setTestResults] = useState<RouteTestResult[]>([]);
  const [testing, setTesting] = useState(false);
  const router = useRouter();

  const protectedRoutes = ['/dashboard', '/protected'];
  const publicRoutes = ['/'];

  const testRoute = async (route: string): Promise<RouteTestResult> => {
    try {
      const response = await fetch(route, { 
        method: 'HEAD',
        redirect: 'manual'
      });
      
      return {
        route,
        accessible: response.status === 200,
        redirected: response.status >= 300 && response.status < 400,
      };
    } catch (error) {
      return {
        route,
        accessible: false,
        redirected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const runTests = async () => {
    setTesting(true);
    const results: RouteTestResult[] = [];
    
    // Test protected routes
    for (const route of protectedRoutes) {
      const result = await testRoute(route);
      results.push(result);
    }
    
    // Test public routes
    for (const route of publicRoutes) {
      const result = await testRoute(route);
      results.push(result);
    }
    
    setTestResults(results);
    setTesting(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Route Protection Test</CardTitle>
          <CardDescription>Loading authentication status...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Route Protection Test</CardTitle>
        <CardDescription>
          Test the authentication and authorization system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">Authentication Status</p>
            <Badge variant={isAuthenticated ? "default" : "secondary"}>
              {isAuthenticated ? "Authenticated" : "Not Authenticated"}
            </Badge>
          </div>
          <Button onClick={runTests} disabled={testing}>
            {testing ? "Testing..." : "Run Route Tests"}
          </Button>
        </div>

        {testResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Test Results</h4>
            {testResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded">
                <span className="text-sm font-mono">{result.route}</span>
                <div className="flex gap-2">
                  <Badge variant={result.accessible ? "default" : "secondary"}>
                    {result.accessible ? "Accessible" : "Blocked"}
                  </Badge>
                  {result.redirected && (
                    <Badge variant="outline">Redirected</Badge>
                  )}
                  {result.error && (
                    <Badge variant="destructive">Error</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Manual Navigation Tests</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              asChild 
              variant="outline" 
              size="sm"
              className={!isAuthenticated ? "opacity-50" : ""}
            >
              <Link href="/dashboard">Test Dashboard</Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              size="sm"
              className={!isAuthenticated ? "opacity-50" : ""}
            >
              <Link href="/protected">Test Protected</Link>
            </Button>
          </div>
          {!isAuthenticated && (
            <p className="text-xs text-muted-foreground">
              These routes should redirect you to sign in
            </p>
          )}
        </div>

        <div className="bg-muted rounded-lg p-4 space-y-2">
          <h4 className="text-sm font-semibold">Expected Behavior</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Unauthenticated users should be redirected from protected routes</li>
            <li>• Authenticated users should access protected routes normally</li>
            <li>• Middleware should handle redirects automatically</li>
            <li>• Fallback components should show for unauthorized access</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}