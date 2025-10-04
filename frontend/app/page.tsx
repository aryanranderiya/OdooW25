"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { DollarSign } from "lucide-react";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <main className="flex max-w-4xl flex-col items-center gap-8 text-center">
        <div className="flex items-center gap-3">
          <div className="bg-primary text-primary-foreground flex size-12 items-center justify-center rounded-xl">
            <DollarSign className="size-8" />
          </div>
          <h1 className="text-4xl font-bold">Expense Management</h1>
        </div>

        <p className="text-muted-foreground max-w-2xl text-lg">
          Streamline your company&apos;s expense tracking and approval workflow.
          Manage expenses, automate approvals, and gain insights into your
          spending.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Button size="lg" onClick={() => router.push("/signup")}>
            Get Started
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => router.push("/login")}
          >
            Sign In
          </Button>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          <div className="rounded-lg border bg-card p-6 text-card-foreground">
            <h3 className="mb-2 font-semibold">Easy Submission</h3>
            <p className="text-muted-foreground text-sm">
              Submit expenses with receipt uploads and automatic currency
              conversion
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6 text-card-foreground">
            <h3 className="mb-2 font-semibold">Smart Approvals</h3>
            <p className="text-muted-foreground text-sm">
              Automated approval workflows based on amount thresholds and roles
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6 text-card-foreground">
            <h3 className="mb-2 font-semibold">Role Management</h3>
            <p className="text-muted-foreground text-sm">
              Hierarchical role system with Admin, Manager, and Employee levels
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
