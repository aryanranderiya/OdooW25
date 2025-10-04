"use client";

import { useExpenseSummary } from "@/hooks/use-expenses";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, Clock, CheckCircle } from "lucide-react";

export default function ExpenseSummary() {
  const { data: summary, error, isLoading } = useExpenseSummary();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expense Summary</CardTitle>
          <CardDescription>Your expense statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-6 w-[100px]" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expense Summary</CardTitle>
          <CardDescription>Your expense statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-muted-foreground">Failed to load summary</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return null;
  }

  const stats = [
    {
      label: "Total Submitted",
      value: formatCurrency(summary.totalSubmitted || 0, summary.currency || "USD"),
      icon: TrendingUp,
      description: "All time total",
    },
    {
      label: "Pending Approval",
      value: formatCurrency(summary.pendingAmount || 0, summary.currency || "USD"),
      icon: Clock,
      description: `${summary.pendingCount || 0} expenses`,
    },
    {
      label: "Approved",
      value: formatCurrency(summary.approvedAmount || 0, summary.currency || "USD"),
      icon: CheckCircle,
      description: `${summary.approvedCount || 0} expenses`,
    },
    {
      label: "This Month",
      value: formatCurrency(summary.thisMonthAmount || 0, summary.currency || "USD"),
      icon: TrendingDown,
      description: `${summary.thisMonthCount || 0} expenses`,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense Summary</CardTitle>
        <CardDescription>Your expense statistics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
                <div className="text-lg font-semibold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.description}</div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
