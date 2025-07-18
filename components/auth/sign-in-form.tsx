"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type SignInFormData = z.infer<typeof signInSchema>;

interface SignInFormProps {
  onSubmit?: (email: string) => void;
  isLoading?: boolean;
  error?: string;
}

export function SignInForm({ onSubmit, isLoading: externalLoading, error: externalError }: SignInFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [lastEmailSent, setLastEmailSent] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { signIn } = useAuthActions();

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleSubmit = async (data: SignInFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      // Check if we're sending to the same email too frequently
      if (lastEmailSent === data.email && retryCount >= 3) {
        setError("Too many attempts. Please wait a few minutes before trying again.");
        return;
      }

      // Call external onSubmit if provided
      if (onSubmit) {
        onSubmit(data.email);
      }

      // Sign in with Convex Auth using Resend provider
      await signIn("resend", { email: data.email });
      
      // Track successful email send
      setLastEmailSent(data.email);
      setRetryCount(lastEmailSent === data.email ? retryCount + 1 : 1);
      setSuccess(true);
    } catch (err) {
      console.error("Sign-in error:", err);
      
      // Enhanced error handling with specific messages
      let errorMessage = "Failed to send sign-in link. Please try again.";
      
      if (err instanceof Error) {
        const message = err.message.toLowerCase();
        if (message.includes("rate limit") || message.includes("too many requests")) {
          errorMessage = "Too many requests. Please wait a moment before trying again.";
        } else if (message.includes("invalid email") || message.includes("email")) {
          errorMessage = "Please check your email address and try again.";
        } else if (message.includes("network") || message.includes("connection")) {
          errorMessage = "Network error. Please check your connection and try again.";
        } else if (message.includes("server") || message.includes("service")) {
          errorMessage = "Service temporarily unavailable. Please try again in a few minutes.";
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const currentError = externalError || error;
  const currentLoading = externalLoading || isLoading;

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            We've sent a magic link to <strong>{form.getValues("email")}</strong>. 
            Click the link to sign in to your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="font-medium">What happens next?</span>
            </div>
            <ul className="space-y-1 text-xs">
              <li>• Check your email inbox (and spam folder)</li>
              <li>• Click the "Sign In" button in the email</li>
              <li>• You'll be automatically signed in</li>
              <li>• The link expires in 15 minutes</li>
            </ul>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setSuccess(false);
                setError(null);
              }}
              className="flex-1"
            >
              Send another link
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setSuccess(false);
                setError(null);
                form.reset();
              }}
              className="flex-1"
            >
              Use different email
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign in to ShipOrSkip</CardTitle>
        <CardDescription>
          Enter your email address and we'll send you a magic link to sign in.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      disabled={currentLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {currentError && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {currentError}
              </div>
            )}

            <Button
              type="submit"
              disabled={currentLoading}
              className="w-full"
            >
              {currentLoading ? "Sending link..." : "Send sign-in link"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}