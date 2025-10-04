"use client";

import { useState, useMemo } from "react";
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
import type { Expense } from "@/lib/types/expense";

interface ExpenseChartProps {
  expenses: Expense[];
  currency?: string;
}

const chartConfig = {
  total: {
    label: "Total Expenses",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function ExpenseChart({
  expenses,
  currency = "USD",
}: ExpenseChartProps) {
  const [timeRange, setTimeRange] = useState("30d");

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

    // Group expenses by date
    const expensesByDate = filteredExpenses.reduce((acc, expense) => {
      const expenseDate =
        typeof expense.expenseDate === "string"
          ? new Date(expense.expenseDate)
          : expense.expenseDate;
      const dateKey = expenseDate.toISOString().split("T")[0];

      if (!acc[dateKey]) {
        acc[dateKey] = 0;
      }
      acc[dateKey] += expense.convertedAmount;
      return acc;
    }, {} as Record<string, number>);

    // Create array of all dates in range
    const data = [];
    for (let i = daysToShow; i >= 0; i--) {
      const date = new Date(referenceDate);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split("T")[0];

      data.push({
        date: dateKey,
        total: expensesByDate[dateKey] || 0,
      });
    }

    return data;
  }, [expenses, timeRange]);

  const totalAmount = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.total, 0);
  }, [chartData]);

  const averageDaily = useMemo(() => {
    const nonZeroDays = chartData.filter((item) => item.total > 0).length;
    return nonZeroDays > 0 ? totalAmount / nonZeroDays : 0;
  }, [chartData, totalAmount]);

  return (
    <Card>
      <CardHeader className="flex flex-col space-y-4 pb-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-xl font-semibold">
            Expense Trends
          </CardTitle>
          <CardDescription>
            Track your spending patterns over time
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
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
              <linearGradient id="fillTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={1} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
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
            <Area
              dataKey="total"
              type="monotone"
              fill="url(#fillTotal)"
              stroke="var(--color-total)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
