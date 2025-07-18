"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { SessionManager } from "./auth/session-manager";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

interface ConvexClientProviderProps {
  children: React.ReactNode;
}

export function ConvexClientProvider({ children }: ConvexClientProviderProps) {
  return (
    <ConvexProvider client={convex}>
      <ConvexAuthProvider client={convex}>
        <SessionManager>
          {children}
        </SessionManager>
      </ConvexAuthProvider>
    </ConvexProvider>
  );
}