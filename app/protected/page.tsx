import { AuthenticationWrapper } from "@/components/auth/authentication-wrapper";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ProtectedPage() {
  return (
    <AuthenticationWrapper
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
          <h1 className="text-2xl font-bold">Protected Area</h1>
          <p className="text-muted-foreground text-center max-w-md">
            This page requires authentication. Please sign in to continue.
          </p>
          <Button asChild>
            <Link href="/">Go to Sign In</Link>
          </Button>
        </div>
      }
    >
      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Protected Content</h1>
          <div className="flex gap-4">
            <Button asChild variant="outline">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <SignOutButton />
          </div>
        </div>
        
        <div className="max-w-2xl space-y-6">
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">🔒 Secure Area</h2>
            <p className="text-muted-foreground mb-4">
              Congratulations! You have successfully accessed a protected route.
              This demonstrates that the authentication system is working correctly.
            </p>
            
            <div className="bg-muted rounded-lg p-4">
              <h3 className="font-semibold mb-2">How it works:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Middleware checks authentication status</li>
                <li>• Unauthenticated users are redirected</li>
                <li>• AuthenticationWrapper provides fallback UI</li>
                <li>• Protected content is only shown to authenticated users</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-2">Navigation</h3>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/">Home</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AuthenticationWrapper>
  );
}