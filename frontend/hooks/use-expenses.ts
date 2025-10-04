import useSWR from "swr";
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

export interface ExpensesResponse {
  expenses: Expense[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Fetcher functions that handle the paginated response structure
const fetchers = {
  expenses: async (params?: GetExpensesParams) => {
    const response = await expenseApi.getExpenses(params);
    // Backend returns { expenses: [...], pagination: {...} }
    return response;
  },
};

// Hook for fetching expenses with pagination
export function useExpenses(params?: GetExpensesParams) {
  return useSWR<ExpensesResponse>(
    params ? ["/expenses", params] : "/expenses",
    () => fetchers.expenses(params),
    {
      revalidateOnFocus: false,
    }
  );
}

// Simple function for creating expenses
export async function createExpense(data: CreateExpenseData) {
  return expenseApi.createExpense(data);
}

// Hook for fetching single expense
export function useExpense(id: string) {
  return useSWR<Expense>(id ? `/expenses/${id}` : null, () =>
    expenseApi.getExpense(id)
  );
}
