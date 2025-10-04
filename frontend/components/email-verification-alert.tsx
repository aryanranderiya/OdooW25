"use client";

import { useState } from "react";
import { authApi } from "@/lib/auth-api";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Mail, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface EmailVerificationAlertProps {
  email: string;
}

export function EmailVerificationAlert({ email }: EmailVerificationAlertProps) {
  const [isResending, setIsResending] = useState(false);

  const handleResend = async () => {
    setIsResending(true);
    try {
      await authApi.resendVerification(email);
      toast.success("Verification email sent! Please check your inbox.");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to resend verification email"
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Alert className="bg-yellow-50 border-yellow-200">
      <Mail className="h-4 w-4 text-yellow-600" />
      <AlertTitle className="text-yellow-900">
        Email Verification Required
      </AlertTitle>
      <AlertDescription className="text-yellow-800">
        <p className="mb-2">
          Please verify your email address to access all features. Check your
          inbox for the verification link.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleResend}
          disabled={isResending}
          className="mt-2"
        >
          {isResending ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Mail className="mr-2 h-4 w-4" />
              Resend Verification Email
            </>
          )}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
