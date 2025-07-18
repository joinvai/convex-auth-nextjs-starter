import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import { Navigation } from "@/components/auth/navigation";
import { AuthErrorBoundary } from "@/components/auth/auth-error-boundary";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ShipOrSkip",
  description: "Authentication demo with Convex and magic links",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ConvexClientProvider>
          <AuthErrorBoundary>
            <Navigation />
            <main>{children}</main>
          </AuthErrorBoundary>
        </ConvexClientProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
