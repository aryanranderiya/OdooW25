"use client";

import * as React from "react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

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
import { Expense } from "@/lib/types/expense";
import { useMemo } from "react";
import { formatCurrency } from "@/lib/utils";

interface ExpenseTrendsChartProps {
  expenses: Expense[];
  currency: string;
}

const chartConfig = {
  total: {
    label: "Total",
    color: "hsl(217, 91%, 60%)",
  },
  count: {
    label: "Count",
    color: "hsl(217, 91%, 70%)",
  },
} satisfies ChartConfig;

export function ExpenseTrendsChart({
  expenses,
  currency,
}: ExpenseTrendsChartProps) {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("total");

  const chartData = useMemo(() => {
    // Group expenses by date
    const dateMap = new Map<string, { amount: number; count: number }>();

    expenses.forEach((expense) => {
      const date = new Date(expense.expenseDate).toISOString().split("T")[0];
      const existing = dateMap.get(date) || { amount: 0, count: 0 };
      dateMap.set(date, {
        amount: existing.amount + expense.convertedAmount,
        count: existing.count + 1,
      });
    });

    // Convert to array and sort by date
    const sortedData = Array.from(dateMap.entries())
      .map(([date, data]) => ({
        date,
        total: data.amount,
        count: data.count,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Take last 30 days or available data
    return sortedData.slice(-30);
  }, [expenses]);

  const totals = React.useMemo(
    () => ({
      total: chartData.reduce((acc, curr) => acc + curr.total, 0),
      count: chartData.reduce((acc, curr) => acc + curr.count, 0),
    }),
    [chartData]
  );

  if (chartData.length === 0) {
    return (
      <Card className="py-4 sm:py-0">
        <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
            <CardTitle>Expense Trends</CardTitle>
            <CardDescription>No expense data available</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:p-6">
          <div className="flex items-center justify-center h-[250px] text-muted-foreground">
            No expenses to display
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="py-4 sm:py-0">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
          <CardTitle>Expense Trends</CardTitle>
          <CardDescription>
            Daily expense tracking over time (last 30 days)
          </CardDescription>
        </div>
        <div className="flex">
          {["total", "count"].map((key) => {
            const chart = key as keyof typeof chartConfig;
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="data-[active=true]:bg-muted/50 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-muted-foreground text-xs">
                  {chartConfig[chart].label}
                </span>
                <span className="text-lg leading-none font-bold sm:text-3xl">
                  {chart === "total"
                    ? formatCurrency(
                        totals[chart as keyof typeof totals],
                        currency
                      )
                    : totals[chart as keyof typeof totals].toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
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
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[180px]"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                  formatter={(value, name) => (
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{
                          backgroundColor: `var(--color-${name})`,
                        }}
                      />
                      <span className="font-medium">
                        {name === "total"
                          ? formatCurrency(Number(value), currency)
                          : `${value} expenses`}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Line
              dataKey={activeChart}
              type="monotone"
              stroke={`var(--color-${activeChart})`}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
