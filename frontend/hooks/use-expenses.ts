import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { expenseApi } from "@/lib/expense-api";
import type { Expense } from "@/lib/types/expense";

// Simple fetcher functions
const fetchers = {
  expenses: (params?: any) => expenseApi.getExpenses(params),
};

// Simple mutation function
const createExpenseMutator = async (_: string, { arg }: { arg: any }) => {
  return expenseApi.createExpense(arg);
};

// Hook for fetching expenses
export function useExpenses(params?: any) {
  return useSWR<Expense[]>(
    params ? ["/expenses", params] : "/expenses",
    () => fetchers.expenses(params),
    {
      revalidateOnFocus: false,
    }
  );
}

// Hook for creating expenses
export function useCreateExpense() {
  return useSWRMutation("/expenses", createExpenseMutator);
}

// Hook for fetching single expense
export function useExpense(id: string) {
  return useSWR<Expense>(id ? `/expenses/${id}` : null, () =>
    expenseApi.getExpense(id)
  );
}
