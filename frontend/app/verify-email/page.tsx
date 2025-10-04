"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi } from "@/lib/auth-api";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, setCompany } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("No verification token provided");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await authApi.verifyEmail(token);
        setStatus("success");
        setMessage(response.message || "Email verified successfully!");
        setUser(response.user);
        setCompany(response.company);

        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } catch (err) {
        const error = err as { response?: { data?: { message?: string } } };
        setStatus("error");
        setMessage(
          error.response?.data?.message ||
            "Failed to verify email. Please try again."
        );
      }
    };

    verifyEmail();
  }, [searchParams, router, setUser, setCompany]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Email Verification</CardTitle>
          <CardDescription>
            {status === "loading" && "Verifying your email..."}
            {status === "success" && "Verification Complete"}
            {status === "error" && "Verification Failed"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          {status === "loading" && (
            <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
          )}
          {status === "success" && (
            <CheckCircle2 className="h-16 w-16 text-green-600" />
          )}
          {status === "error" && <XCircle className="h-16 w-16 text-red-600" />}

          <p className="text-center text-sm text-gray-600">{message}</p>

          {status === "error" && (
            <Button onClick={() => router.push("/login")} className="w-full">
              Go to Login
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
