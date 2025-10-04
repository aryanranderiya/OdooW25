"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";

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
import { Expense } from "@/lib/types/expense";
import { useMemo } from "react";
import { formatCurrency } from "@/lib/utils";

interface MonthlyExpenseChartProps {
  expenses: Expense[];
  currency: string;
}

const chartConfig = {
  amount: {
    label: "Amount",
    color: "hsl(217, 91%, 60%)",
  },
} satisfies ChartConfig;

export function MonthlyExpenseChart({
  expenses,
  currency,
}: MonthlyExpenseChartProps) {
  const chartData = useMemo(() => {
    // Group expenses by month
    const monthMap = new Map<string, { amount: number; count: number }>();

    expenses.forEach((expense) => {
      const date = new Date(expense.expenseDate);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      const existing = monthMap.get(monthKey) || { amount: 0, count: 0 };
      monthMap.set(monthKey, {
        amount: existing.amount + expense.convertedAmount,
        count: existing.count + 1,
      });
    });

    // Convert to array and sort by date
    const sortedData = Array.from(monthMap.entries())
      .map(([month, data]) => ({
        month,
        amount: data.amount,
        count: data.count,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Take last 6 months or available data
    return sortedData.slice(-6);
  }, [expenses]);

  const trend = useMemo(() => {
    if (chartData.length < 2) return null;

    const lastMonth = chartData[chartData.length - 1].amount;
    const previousMonth = chartData[chartData.length - 2].amount;

    if (previousMonth === 0) return null;

    const percentChange = ((lastMonth - previousMonth) / previousMonth) * 100;

    return {
      direction: percentChange > 0 ? "up" : "down",
      percentage: Math.abs(percentChange).toFixed(1),
    };
  }, [chartData]);

  const totalAmount = useMemo(
    () => chartData.reduce((sum, item) => sum + item.amount, 0),
    [chartData]
  );

  if (chartData.length === 0) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Monthly Expenses</CardTitle>
          <CardDescription>No expense data available</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No expenses to display
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Monthly Expenses</CardTitle>
        <CardDescription>
          Last {chartData.length} months of spending
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 20,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => {
                const [year, month] = value.split("-");
                const date = new Date(parseInt(year), parseInt(month) - 1);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                });
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) =>
                new Intl.NumberFormat("en-US", {
                  notation: "compact",
                  compactDisplay: "short",
                }).format(value)
              }
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, name, props) => (
                    <div className="flex flex-col gap-1">
                      <div className="text-sm font-medium">
                        {formatCurrency(Number(value), currency)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {props.payload.count}{" "}
                        {props.payload.count === 1 ? "expense" : "expenses"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(
                          props.payload.month + "-01"
                        ).toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  )}
                />
              }
            />
            <Bar dataKey="amount" fill="var(--color-amount)" radius={8}>
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
                formatter={(value: number) =>
                  new Intl.NumberFormat("en-US", {
                    notation: "compact",
                    compactDisplay: "short",
                  }).format(value)
                }
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        {trend && (
          <div className="flex items-center gap-2 leading-none font-medium">
            {trend.direction === "up" ? (
              <>
                Trending up by {trend.percentage}%{" "}
                <TrendingUp className="h-4 w-4" />
              </>
            ) : (
              <>
                Trending down by {trend.percentage}%{" "}
                <TrendingDown className="h-4 w-4" />
              </>
            )}
          </div>
        )}
        <div className="text-muted-foreground leading-none">
          Total: {formatCurrency(totalAmount, currency)} over {chartData.length}{" "}
          {chartData.length === 1 ? "month" : "months"}
        </div>
      </CardFooter>
    </Card>
  );
}
