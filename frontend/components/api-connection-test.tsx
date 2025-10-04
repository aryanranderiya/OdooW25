"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { IconCheck, IconX, IconLoader2 } from "@tabler/icons-react";
import { ApprovalAPI } from "@/lib/approval-api";

export function APIConnectionTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  const testConnection = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      // Test getting pending approvals
      const approvals = await ApprovalAPI.getPendingApprovals();
      setResult({
        success: true,
        message: "API connection successful!",
        details: { approvalsCount: approvals.length },
      });
    } catch (error: any) {
      setResult({
        success: false,
        message: "API connection failed",
        details: {
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
          url: error.config?.url,
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testApprovalRules = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      // Test getting approval rules
      const rules = await ApprovalAPI.getApprovalRules();
      setResult({
        success: true,
        message: "Approval rules API successful!",
        details: { rulesCount: rules.length },
      });
    } catch (error: any) {
      setResult({
        success: false,
        message: "Approval rules API failed",
        details: {
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
          url: error.config?.url,
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>API Connection Test</CardTitle>
        <CardDescription>
          Test the connection to the backend approval API
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={testConnection}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <IconLoader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              "Test Approvals API"
            )}
          </Button>
          <Button
            onClick={testApprovalRules}
            disabled={isLoading}
            variant="outline"
            className="flex-1"
          >
            {isLoading ? (
              <IconLoader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              "Test Rules API"
            )}
          </Button>
        </div>

        {result && (
          <Alert variant={result.success ? "default" : "destructive"}>
            {result.success ? (
              <IconCheck className="h-4 w-4" />
            ) : (
              <IconX className="h-4 w-4" />
            )}
            <AlertDescription>
              <div className="font-medium">{result.message}</div>
              {result.details && (
                <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                  {JSON.stringify(result.details, null, 2)}
                </pre>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
