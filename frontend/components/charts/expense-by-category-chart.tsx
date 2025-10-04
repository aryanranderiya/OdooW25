"use client";

import { TrendingUp } from "lucide-react";
import { Pie, PieChart } from "recharts";

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

interface ExpenseByCategoryChartProps {
  expenses: Expense[];
  currency: string;
}

export function ExpenseByCategoryChart({
  expenses,
  currency,
}: ExpenseByCategoryChartProps) {
  const chartData = useMemo(() => {
    const categoryMap = new Map<string, { amount: number; count: number }>();

    expenses.forEach((expense) => {
      const categoryName = expense.category?.name || "Uncategorized";
      const existing = categoryMap.get(categoryName) || { amount: 0, count: 0 };
      categoryMap.set(categoryName, {
        amount: existing.amount + expense.convertedAmount,
        count: existing.count + 1,
      });
    });

    const colors = [
      "hsl(217, 91%, 60%)", // Blue
      "hsl(217, 91%, 70%)", // Light Blue
      "hsl(217, 91%, 50%)", // Dark Blue
      "hsl(217, 91%, 80%)", // Lighter Blue
      "hsl(217, 91%, 40%)", // Darker Blue
    ];

    return Array.from(categoryMap.entries())
      .map(([category, data], index) => ({
        category,
        amount: data.amount,
        count: data.count,
        fill: colors[index % colors.length],
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenses]);

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {
      amount: {
        label: "Amount",
      },
    };

    chartData.forEach((item, index) => {
      config[item.category] = {
        label: item.category,
        color: item.fill,
      };
    });

    return config;
  }, [chartData]);

  const totalAmount = useMemo(
    () => chartData.reduce((sum, item) => sum + item.amount, 0),
    [chartData]
  );

  const topCategory = useMemo(
    () => (chartData.length > 0 ? chartData[0] : null),
    [chartData]
  );

  if (chartData.length === 0) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Expenses by Category</CardTitle>
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
        <CardTitle>Expenses by Category</CardTitle>
        <CardDescription>
          Distribution of spending across categories
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, name, props) => (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: props.payload.fill }}
                        />
                        <span className="font-medium">{name}</span>
                      </div>
                      <div className="text-sm">
                        {formatCurrency(Number(value), currency)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {props.payload.count}{" "}
                        {props.payload.count === 1 ? "expense" : "expenses"}
                      </div>
                    </div>
                  )}
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="amount"
              nameKey="category"
              innerRadius={60}
              strokeWidth={5}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        {topCategory && (
          <div className="flex items-center gap-2 leading-none font-medium">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: topCategory.fill }}
            />
            {topCategory.category} is your top category
          </div>
        )}
        <div className="text-muted-foreground leading-none">
          Total: {formatCurrency(totalAmount, currency)} across{" "}
          {chartData.length}{" "}
          {chartData.length === 1 ? "category" : "categories"}
        </div>
      </CardFooter>
    </Card>
  );
}
