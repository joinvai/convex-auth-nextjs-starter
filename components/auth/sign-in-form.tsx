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
import { useAuthErrorHandler, getUserFriendlyErrorMessage } from "./error-handler";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from "lucide-react";

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
  const { signIn } = useAuthActions();
  
  const { executeWithRetry, isRetrying, retryCount, RateLimitError } = useAuthErrorHandler({
    showToast: false, // We'll handle UI feedback ourselves
    context: "sign-in-form",
    retryConfig: {
      maxRetries: 2, // Limit retries for email sending
      baseDelay: 2000,
    }
  });

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
      if (lastEmailSent === data.email && retryCount >= 2) {
        throw new RateLimitError("Too many attempts for this email. Please wait a few minutes before trying again.");
      }

      // Call external onSubmit if provided
      if (onSubmit) {
        onSubmit(data.email);
      }

      // Execute sign-in with retry logic
      await executeWithRetry(async () => {
        await signIn("resend", { email: data.email });
      }, "magic-link-send");
      
      // Track successful email send
      setLastEmailSent(data.email);
      setSuccess(true);
    } catch (err) {
      const friendlyMessage = getUserFriendlyErrorMessage(err);
      setError(friendlyMessage);
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
            We&apos;ve sent a magic link to <strong>{form.getValues("email")}</strong>. 
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
              <li>• Click the &quot;Sign In&quot; button in the email</li>
              <li>• You&apos;ll be automatically signed in</li>
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
          Enter your email address and we&apos;ll send you a magic link to sign in.
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
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {currentError}
                </AlertDescription>
              </Alert>
            )}

            {isRetrying && retryCount > 0 && (
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription>
                  Retrying... (Attempt {retryCount + 1})
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={currentLoading || isRetrying}
              className="w-full"
            >
              {currentLoading || isRetrying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isRetrying ? "Retrying..." : "Sending link..."}
                </>
              ) : (
                "Send sign-in link"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}