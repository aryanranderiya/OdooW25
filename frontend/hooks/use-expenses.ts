import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { expenseApi } from "@/lib/expense-api";
import type { Expense } from "@/lib/types/expense";

export interface GetExpensesParams {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
}

export interface CreateExpenseData {
  title: string;
  description?: string;
  originalAmount: number;
  originalCurrency: string;
  expenseDate: Date;
  categoryId?: string;
}

// Fetcher functions that handle the paginated response structure
const fetchers = {
  expenses: async (params?: GetExpensesParams) => {
    const response = await expenseApi.getExpenses(params);
    // Backend returns { expenses: [...], pagination: {...} }
    // Extract just the expenses array for the UI
    return response.expenses || [];
  },
};

// Simple mutation function
const createExpenseMutator = async (_: string, { arg }: { arg: CreateExpenseData }) => {
  return expenseApi.createExpense(arg);
};

// Hook for fetching expenses
export function useExpenses(params?: GetExpensesParams) {
  return useSWR<Expense[]>(params ? ["/expenses", params] : "/expenses", () => fetchers.expenses(params), {
    revalidateOnFocus: false,
  });
}

// Hook for creating expenses
export function useCreateExpense() {
  return useSWRMutation("/expenses", createExpenseMutator);
}

// Hook for fetching single expense
export function useExpense(id: string) {
  return useSWR<Expense>(id ? `/expenses/${id}` : null, () => expenseApi.getExpense(id));
}
