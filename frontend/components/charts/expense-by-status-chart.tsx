"use client";

import { TrendingUp } from "lucide-react";
import { PolarGrid, RadialBar, RadialBarChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Expense, ExpenseStatus } from "@/lib/types/expense";
import { useMemo } from "react";
import { formatCurrency } from "@/lib/utils";

interface ExpenseByStatusChartProps {
  expenses: Expense[];
  currency: string;
}

const statusColors = {
  [ExpenseStatus.DRAFT]: "hsl(240, 5%, 65%)", // Gray
  [ExpenseStatus.PENDING_APPROVAL]: "hsl(45, 93%, 47%)", // Yellow/Amber
  [ExpenseStatus.APPROVED]: "hsl(142, 71%, 45%)", // Green
  [ExpenseStatus.REJECTED]: "hsl(0, 84%, 60%)", // Red
  [ExpenseStatus.CANCELLED]: "hsl(240, 5%, 45%)", // Dark Gray
};

const statusLabels = {
  [ExpenseStatus.DRAFT]: "Draft",
  [ExpenseStatus.PENDING_APPROVAL]: "Pending",
  [ExpenseStatus.APPROVED]: "Approved",
  [ExpenseStatus.REJECTED]: "Rejected",
  [ExpenseStatus.CANCELLED]: "Cancelled",
};

export function ExpenseByStatusChart({
  expenses,
  currency,
}: ExpenseByStatusChartProps) {
  const chartData = useMemo(() => {
    const statusMap = new Map<
      ExpenseStatus,
      { amount: number; count: number }
    >();

    expenses.forEach((expense) => {
      const status = expense.status;
      const existing = statusMap.get(status) || { amount: 0, count: 0 };
      statusMap.set(status, {
        amount: existing.amount + expense.convertedAmount,
        count: existing.count + 1,
      });
    });

    return Array.from(statusMap.entries())
      .map(([status, data]) => ({
        status: statusLabels[status],
        statusKey: status,
        amount: data.amount,
        count: data.count,
        fill: statusColors[status],
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenses]);

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {
      amount: {
        label: "Amount",
      },
    };

    Object.entries(statusLabels).forEach(([key, label]) => {
      config[label] = {
        label: label,
        color: statusColors[key as ExpenseStatus],
      };
    });

    return config;
  }, []);

  const totalAmount = useMemo(
    () => chartData.reduce((sum, item) => sum + item.amount, 0),
    [chartData]
  );

  const pendingCount = useMemo(
    () =>
      chartData.find(
        (item) => item.statusKey === ExpenseStatus.PENDING_APPROVAL
      )?.count || 0,
    [chartData]
  );

  if (chartData.length === 0) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Expenses by Status</CardTitle>
          <CardDescription>No expense data available</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <div className="flex items-center justify-center h-[250px] text-muted-foreground">
            No expenses to display
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Expenses by Status</CardTitle>
        <CardDescription>Current status of all expenses</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <RadialBarChart data={chartData} innerRadius={30} outerRadius={110}>
            <ChartTooltip
              cursor={false}
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const data = payload[0].payload;
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: data.fill }}
                        />
                        <span className="font-medium">{data.status}</span>
                      </div>
                      <div className="text-sm">
                        {formatCurrency(data.amount, currency)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {data.count} {data.count === 1 ? "expense" : "expenses"}
                      </div>
                    </div>
                  </div>
                );
              }}
            />
            <PolarGrid gridType="circle" />
            <RadialBar dataKey="amount" />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 leading-none font-medium">
            <TrendingUp className="h-4 w-4" />
            {pendingCount} {pendingCount === 1 ? "expense" : "expenses"}{" "}
            awaiting approval
          </div>
        )}
        <div className="text-muted-foreground leading-none">
          Total value: {formatCurrency(totalAmount, currency)}
        </div>
      </CardFooter>
    </Card>
  );
}
