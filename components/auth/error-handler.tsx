"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { toast } from "sonner";

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

export interface ErrorHandlerOptions {
  retryConfig?: Partial<RetryConfig>;
  showToast?: boolean;
  logErrors?: boolean;
  context?: string;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
};

export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean = true,
    public severity: "low" | "medium" | "high" = "medium"
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export class NetworkError extends AuthError {
  constructor(message: string = "Network connection error") {
    super(message, "NETWORK_ERROR", true, "low");
    this.name = "NetworkError";
  }
}

export class RateLimitError extends AuthError {
  constructor(message: string = "Too many requests. Please wait before trying again.") {
    super(message, "RATE_LIMIT_ERROR", true, "low");
    this.name = "RateLimitError";
  }
}

export class SessionExpiredError extends AuthError {
  constructor(message: string = "Your session has expired. Please sign in again.") {
    super(message, "SESSION_EXPIRED", false, "medium");
    this.name = "SessionExpiredError";
  }
}

export class EmailServiceError extends AuthError {
  constructor(message: string = "Email service is temporarily unavailable") {
    super(message, "EMAIL_SERVICE_ERROR", true, "medium");
    this.name = "EmailServiceError";
  }
}

export class ConfigurationError extends AuthError {
  constructor(message: string = "Authentication service is misconfigured") {
    super(message, "CONFIGURATION_ERROR", false, "high");
    this.name = "ConfigurationError";
  }
}

export function parseError(error: unknown): AuthError {
  if (error instanceof AuthError) {
    return error;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // Network errors
    if (message.includes("network") || message.includes("fetch") || message.includes("connection")) {
      return new NetworkError(error.message);
    }
    
    // Rate limiting
    if (message.includes("rate limit") || message.includes("too many requests")) {
      return new RateLimitError(error.message);
    }
    
    // Session errors
    if (message.includes("session") || message.includes("expired") || message.includes("unauthorized")) {
      return new SessionExpiredError(error.message);
    }
    
    // Email service errors
    if (message.includes("email") || message.includes("resend") || message.includes("smtp")) {
      return new EmailServiceError(error.message);
    }
    
    // Configuration errors
    if (message.includes("api key") || message.includes("configuration") || message.includes("env")) {
      return new ConfigurationError(error.message);
    }
    
    // Generic auth error
    return new AuthError(error.message, "UNKNOWN_ERROR", true, "medium");
  }

  // Unknown error type
  return new AuthError("An unexpected error occurred", "UNKNOWN_ERROR", true, "high");
}

export function useAuthErrorHandler(options: ErrorHandlerOptions = {}) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const config = useMemo(() => ({ ...DEFAULT_RETRY_CONFIG, ...options.retryConfig }), [options.retryConfig]);

  const calculateDelay = useCallback((attempt: number): number => {
    const delay = Math.min(
      config.baseDelay * Math.pow(config.backoffFactor, attempt),
      config.maxDelay
    );
    // Add jitter to prevent thundering herd
    return delay + Math.random() * 1000;
  }, [config]);

  const logError = useCallback((error: AuthError, context?: string) => {
    if (options.logErrors !== false) {
      console.error(`Auth error${context ? ` in ${context}` : ""}:`, {
        message: error.message,
        code: error.code,
        severity: error.severity,
        retryable: error.retryable,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });
    }
  }, [options.logErrors]);

  const showErrorToast = useCallback((error: AuthError) => {
    if (options.showToast !== false) {
      const toastOptions = {
        duration: error.severity === "high" ? 8000 : 4000,
      };

      switch (error.severity) {
        case "low":
          toast.warning(error.message, toastOptions);
          break;
        case "medium":
          toast.error(error.message, toastOptions);
          break;
        case "high":
          toast.error(error.message, {
            ...toastOptions,
            action: {
              label: "Refresh",
              onClick: () => window.location.reload(),
            },
          });
          break;
      }
    }
  }, [options.showToast]);

  const executeWithRetry = useCallback(async function <T>(
    operation: () => Promise<T>,
    operationName?: string
  ): Promise<T> {
    let lastError: AuthError;
    
    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          setIsRetrying(true);
          const delay = calculateDelay(attempt - 1);
          await new Promise(resolve => {
            retryTimeoutRef.current = setTimeout(resolve, delay);
          });
        }

        const result = await operation();
        
        // Success - reset retry count
        setRetryCount(0);
        setIsRetrying(false);
        
        return result;
      } catch (error) {
        lastError = parseError(error);
        
        logError(lastError, operationName || options.context);
        
        // Don't retry if error is not retryable or we've reached max retries
        if (!lastError.retryable || attempt === config.maxRetries) {
          break;
        }
        
        setRetryCount(attempt + 1);
      }
    }

    setIsRetrying(false);
    showErrorToast(lastError!);
    throw lastError!;
  }, [config, calculateDelay, logError, showErrorToast, options.context, setIsRetrying, setRetryCount]);

  const handleError = useCallback((error: unknown, context?: string) => {
    const authError = parseError(error);
    logError(authError, context || options.context);
    showErrorToast(authError);
    return authError;
  }, [logError, showErrorToast, options.context]);

  const clearRetryTimeout = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    clearRetryTimeout();
    setIsRetrying(false);
    setRetryCount(0);
  }, [clearRetryTimeout]);

  return {
    executeWithRetry,
    handleError,
    isRetrying,
    retryCount,
    cleanup,
    // Error type constructors for convenience
    NetworkError,
    RateLimitError,
    SessionExpiredError,
    EmailServiceError,
    ConfigurationError,
    AuthError,
  };
}

// Global error handler for unhandled promise rejections
if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (event) => {
    const error = parseError(event.reason);
    console.error("Unhandled auth promise rejection:", error);
    
    // Only show toast for auth-related errors
    if (error.code.includes("AUTH") || error.code.includes("SESSION") || error.code.includes("EMAIL")) {
      toast.error("An authentication error occurred. Please try again.");
    }
  });
}

// Utility function to check if an error is recoverable
export function isRecoverableError(error: unknown): boolean {
  const authError = parseError(error);
  return authError.retryable && authError.severity !== "high";
}

// Utility function to get user-friendly error message
export function getUserFriendlyErrorMessage(error: unknown): string {
  const authError = parseError(error);
  
  switch (authError.code) {
    case "NETWORK_ERROR":
      return "Please check your internet connection and try again.";
    case "RATE_LIMIT_ERROR":
      return "You're doing that too often. Please wait a moment before trying again.";
    case "SESSION_EXPIRED":
      return "Your session has expired. Please sign in again.";
    case "EMAIL_SERVICE_ERROR":
      return "We're having trouble sending emails right now. Please try again in a few minutes.";
    case "CONFIGURATION_ERROR":
      return "There's a configuration issue. Please contact support.";
    default:
      return authError.message || "Something went wrong. Please try again.";
  }
}