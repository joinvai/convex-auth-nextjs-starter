
import { AuthDemo } from "@/components/auth/auth-demo";
import { AuthenticationWrapper } from "@/components/auth/authentication-wrapper";
import { RouteProtectionTest } from "@/components/auth/route-protection-test";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">ShipOrSkip</h1>
          <p className="text-xl text-muted-foreground">
            Authentication demo with Convex and magic links
          </p>
        </div>

        <AuthenticationWrapper
          fallback={
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-4">Welcome!</h2>
                <p className="text-muted-foreground mb-6">
                  Sign in with your email to access protected content and explore the features.
                </p>
              </div>
              <AuthDemo />
              
              <div className="bg-muted rounded-lg p-6">
                <h3 className="font-semibold mb-2">🔒 Protected Routes Available</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Once signed in, you'll have access to these protected areas:
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled>
                    Dashboard
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    Protected Content
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Sign in to enable these buttons
                </p>
              </div>
            </div>
          }
        >
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4">Welcome back!</h2>
              <p className="text-muted-foreground">
                You're successfully authenticated. Explore the protected areas of the application.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-2">📊 Dashboard</h3>
                <p className="text-muted-foreground mb-4">
                  Access your personal dashboard with user information and account details.
                </p>
                <Button asChild>
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              </div>
              
              <div className="bg-card rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-2">🔒 Protected Content</h3>
                <p className="text-muted-foreground mb-4">
                  View content that's only available to authenticated users.
                </p>
                <Button asChild variant="outline">
                  <Link href="/protected">View Protected</Link>
                </Button>
              </div>
            </div>
            
            <div className="bg-muted rounded-lg p-6">
              <h3 className="font-semibold mb-2">✅ Authentication Features</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Magic link authentication (passwordless)</li>
                <li>• Route protection with middleware</li>
                <li>• Session management and persistence</li>
                <li>• Automatic redirects for protected content</li>
                <li>• Fallback components for unauthenticated users</li>
              </ul>
            </div>
            
            <RouteProtectionTest />
          </div>
        </AuthenticationWrapper>
      </div>
    </div>
  );
}
