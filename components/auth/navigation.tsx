"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useSessionInfo } from "./session-manager";
import { SignOutButton } from "./sign-out-button";
import { cn } from "@/lib/utils";

const publicRoutes = [
  { href: "/", label: "Home" },
];

const protectedRoutes = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/protected", label: "Protected" },
];

export function Navigation() {
  const { isAuthenticated, isLoading } = useSessionInfo();
  const pathname = usePathname();

  if (isLoading) {
    return (
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <span className="font-bold">ShipOrSkip</span>
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-4 w-16 bg-muted animate-pulse rounded"></div>
            <div className="h-4 w-16 bg-muted animate-pulse rounded"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">ShipOrSkip</span>
          </Link>
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="flex items-center space-x-2">
            {/* Public routes - always visible */}
            {publicRoutes.map((route) => (
              <Button
                key={route.href}
                asChild
                variant={pathname === route.href ? "default" : "ghost"}
                size="sm"
              >
                <Link href={route.href}>{route.label}</Link>
              </Button>
            ))}
            
            {/* Protected routes - only visible when authenticated */}
            {isAuthenticated && protectedRoutes.map((route) => (
              <Button
                key={route.href}
                asChild
                variant={pathname === route.href ? "default" : "ghost"}
                size="sm"
              >
                <Link href={route.href}>{route.label}</Link>
              </Button>
            ))}
          </div>
          
          {/* Authentication actions */}
          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <SignOutButton size="sm" />
            ) : (
              <Button asChild size="sm">
                <Link href="/">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}