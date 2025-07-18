import { AuthenticationWrapper } from "@/components/auth/authentication-wrapper";
import { UserProfile } from "@/components/auth/user-profile";
import { SignOutButton } from "@/components/auth/sign-out-button";

export default function DashboardPage() {
  return (
    <AuthenticationWrapper
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You need to be signed in to access the dashboard.
          </p>
        </div>
      }
    >
      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <SignOutButton />
        </div>
        
        <div className="grid gap-6">
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Welcome to your dashboard!</h2>
            <p className="text-muted-foreground mb-4">
              This is a protected route that only authenticated users can access.
            </p>
            <UserProfile />
          </div>
          
          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-2">Protected Content</h3>
            <p className="text-muted-foreground">
              This content is only visible to authenticated users. The middleware
              ensures that unauthenticated users are redirected to the sign-in page.
            </p>
          </div>
        </div>
      </div>
    </AuthenticationWrapper>
  );
}