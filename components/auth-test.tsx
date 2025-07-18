"use client";

import { useAuthActions } from "@convex-dev/auth/react";

export function AuthTest() {
  const { signIn, signOut } = useAuthActions();
  
  return (
    <div className="p-4 border rounded">
      <h3>Auth Context Test</h3>
      <p>✅ ConvexAuthProvider is working - auth actions are available</p>
      <p>signIn function: {typeof signIn}</p>
      <p>signOut function: {typeof signOut}</p>
    </div>
  );
}