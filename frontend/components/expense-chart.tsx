"use client";

import { useState, useMemo, useCallback } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { Expense } from "@/lib/types/expense";
import { ExpenseStatus } from "@/lib/types/expense";

interface ExpenseChartProps {
  expenses: Expense[];
  currency?: string;
}

const chartConfig = {
  approved: {
    label: "Approved",
    color: "hsl(142, 76%, 36%)",
  },
  waiting: {
    label: "Waiting",
    color: "hsl(48, 96%, 53%)",
  },
  rejected: {
    label: "Rejected",
    color: "hsl(0, 84%, 60%)",
  },
} satisfies ChartConfig;

export function ExpenseChart({
  expenses,
  currency = "USD",
}: ExpenseChartProps) {
  const [timeRange, setTimeRange] = useState("30d");
  const [visibleStatuses, setVisibleStatuses] = useState({
    approved: true,
    waiting: true,
    rejected: true,
  });

  // Memoize the time range change handler to prevent recreating on every render
  const handleTimeRangeChange = useCallback((value: string) => {
    setTimeRange(value);
  }, []);

  // Toggle visibility of a status
  const toggleStatus = useCallback((status: keyof typeof visibleStatuses) => {
    setVisibleStatuses((prev) => ({
      ...prev,
      [status]: !prev[status],
    }));
  }, []);

  const chartData = useMemo(() => {
    const referenceDate = new Date();
    let daysToShow = 90;

    if (timeRange === "30d") {
      daysToShow = 30;
    } else if (timeRange === "7d") {
      daysToShow = 7;
    }

    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToShow);

    // Filter expenses within the time range
    const filteredExpenses = expenses.filter((expense) => {
      const expenseDate =
        typeof expense.expenseDate === "string"
          ? new Date(expense.expenseDate)
          : expense.expenseDate;
      return expenseDate >= startDate && expenseDate <= referenceDate;
    });

    // Group expenses by date and status
    const expensesByDate = filteredExpenses.reduce((acc, expense) => {
      const expenseDate =
        typeof expense.expenseDate === "string"
          ? new Date(expense.expenseDate)
          : expense.expenseDate;
      const dateKey = expenseDate.toISOString().split("T")[0];

      if (!acc[dateKey]) {
        acc[dateKey] = {
          approved: 0,
          waiting: 0,
          rejected: 0,
        };
      }

      // Categorize by status
      if (expense.status === ExpenseStatus.APPROVED) {
        acc[dateKey].approved += expense.convertedAmount;
      } else if (expense.status === ExpenseStatus.PENDING_APPROVAL) {
        acc[dateKey].waiting += expense.convertedAmount;
      } else if (expense.status === ExpenseStatus.REJECTED) {
        acc[dateKey].rejected += expense.convertedAmount;
      }

      return acc;
    }, {} as Record<string, { approved: number; waiting: number; rejected: number }>);

    // Create array of all dates in range
    const data = [];
    for (let i = daysToShow; i >= 0; i--) {
      const date = new Date(referenceDate);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split("T")[0];

      data.push({
        date: dateKey,
        approved: expensesByDate[dateKey]?.approved || 0,
        waiting: expensesByDate[dateKey]?.waiting || 0,
        rejected: expensesByDate[dateKey]?.rejected || 0,
      });
    }

    return data;
  }, [expenses, timeRange]);

  const totalAmount = useMemo(() => {
    return chartData.reduce(
      (sum, item) =>
        sum +
        (visibleStatuses.approved ? item.approved : 0) +
        (visibleStatuses.waiting ? item.waiting : 0) +
        (visibleStatuses.rejected ? item.rejected : 0),
      0
    );
  }, [chartData, visibleStatuses]);

  const averageDaily = useMemo(() => {
    const nonZeroDays = chartData.filter(
      (item) =>
        (visibleStatuses.approved ? item.approved : 0) +
          (visibleStatuses.waiting ? item.waiting : 0) +
          (visibleStatuses.rejected ? item.rejected : 0) >
        0
    ).length;
    return nonZeroDays > 0 ? totalAmount / nonZeroDays : 0;
  }, [chartData, totalAmount, visibleStatuses]);

  const statusTotals = useMemo(() => {
    return chartData.reduce(
      (acc, item) => ({
        approved: acc.approved + item.approved,
        waiting: acc.waiting + item.waiting,
        rejected: acc.rejected + item.rejected,
      }),
      { approved: 0, waiting: 0, rejected: 0 }
    );
  }, [chartData]);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-2">
          <div className="space-y-1">
            <CardTitle className="text-xl font-semibold">
              Expense Trends
            </CardTitle>
            <CardDescription>
              Track your spending patterns by status
            </CardDescription>
          </div>
          {/* Header with Toggle Buttons and Select */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Status Toggle Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => toggleStatus("approved")}
                className={
                  "group relative flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200 " +
                  (visibleStatuses.approved
                    ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                    : "bg-zinc-100 text-zinc-400 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-500 dark:hover:bg-zinc-700")
                }
              >
                <span
                  className={
                    "h-2 w-2 rounded-full transition-all duration-200 " +
                    (visibleStatuses.approved
                      ? "bg-green-500 dark:bg-green-400"
                      : "bg-zinc-300 dark:bg-zinc-600")
                  }
                />
                <span>Approved</span>
                <span className="text-xs opacity-75">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency,
                    notation: "compact",
                  }).format(statusTotals.approved)}
                </span>
              </button>
              <button
                onClick={() => toggleStatus("waiting")}
                className={
                  "group relative flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200 " +
                  (visibleStatuses.waiting
                    ? "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50"
                    : "bg-zinc-100 text-zinc-400 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-500 dark:hover:bg-zinc-700")
                }
              >
                <span
                  className={
                    "h-2 w-2 rounded-full transition-all duration-200 " +
                    (visibleStatuses.waiting
                      ? "bg-amber-500 dark:bg-amber-400"
                      : "bg-zinc-300 dark:bg-zinc-600")
                  }
                />
                <span>Waiting</span>
                <span className="text-xs opacity-75">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency,
                    notation: "compact",
                  }).format(statusTotals.waiting)}
                </span>
              </button>
              <button
                onClick={() => toggleStatus("rejected")}
                className={
                  "group relative flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200 " +
                  (visibleStatuses.rejected
                    ? "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                    : "bg-zinc-100 text-zinc-400 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-500 dark:hover:bg-zinc-700")
                }
              >
                <span
                  className={
                    "h-2 w-2 rounded-full transition-all duration-200 " +
                    (visibleStatuses.rejected
                      ? "bg-red-500 dark:bg-red-400"
                      : "bg-zinc-300 dark:bg-zinc-600")
                  }
                />
                <span>Rejected</span>
                <span className="text-xs opacity-75">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency,
                    notation: "compact",
                  }).format(statusTotals.rejected)}
                </span>
              </button>
            </div>
            <Select value={timeRange} onValueChange={handleTimeRangeChange}>
              <SelectTrigger
                className="w-[160px] rounded-lg"
                aria-label="Select time range"
              >
                <SelectValue placeholder="Last 3 months" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {/* <SelectItem value="90d" className="rounded-lg">
              Last 3 months
            </SelectItem> */}
                <SelectItem value="30d" className="rounded-lg">
                  Last 30 days
                </SelectItem>
                <SelectItem value="7d" className="rounded-lg">
                  Last 7 days
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        {/* Summary Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Total Spent
            </p>
            <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency,
              }).format(totalAmount)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Daily Average
            </p>
            <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency,
              }).format(averageDaily)}
            </p>
          </div>
        </div>

        {/* Chart */}
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillApproved" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(142, 76%, 36%)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(142, 76%, 36%)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillWaiting" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(48, 96%, 53%)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(48, 96%, 53%)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillRejected" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(0, 84%, 60%)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(0, 84%, 60%)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f0f0f0"
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
              style={{ fontSize: "12px", fill: "#71717a" }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) =>
                new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: currency,
                  notation: "compact",
                }).format(value)
              }
              style={{ fontSize: "12px", fill: "#71717a" }}
            />
            <ChartTooltip
              cursor={{ strokeDasharray: "3 3", stroke: "#d4d4d8" }}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                  formatter={(value) =>
                    new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: currency,
                    }).format(value as number)
                  }
                />
              }
            />
            {visibleStatuses.approved && (
              <Area
                dataKey="approved"
                type="monotone"
                fill="url(#fillApproved)"
                stroke="var(--color-approved)"
                strokeWidth={2}
                stackId="1"
              />
            )}
            {visibleStatuses.waiting && (
              <Area
                dataKey="waiting"
                type="monotone"
                fill="url(#fillWaiting)"
                stroke="var(--color-waiting)"
                strokeWidth={2}
                stackId="1"
              />
            )}
            {visibleStatuses.rejected && (
              <Area
                dataKey="rejected"
                type="monotone"
                fill="url(#fillRejected)"
                stroke="var(--color-rejected)"
                strokeWidth={2}
                stackId="1"
              />
            )}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
