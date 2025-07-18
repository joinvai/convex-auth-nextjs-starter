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

      // Call external onSubmit if provided
      if (onSubmit) {
        onSubmit(data.email);
      }

      // Sign in with Convex Auth using Resend provider
      await signIn("resend", { email: data.email });
      
      setSuccess(true);
    } catch (err) {
      console.error("Sign-in error:", err);
      setError(err instanceof Error ? err.message : "Failed to send sign-in link. Please try again.");
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
            We've sent a magic link to your email address. Click the link to sign in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={() => {
              setSuccess(false);
              form.reset();
            }}
            className="w-full"
          >
            Send another link
          </Button>
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