import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import {
  expenseApi,
  type CreateExpenseData,
  type GetExpensesParams,
} from "@/lib/expense-api";
import type { Expense } from "@/lib/types/expense";

// Simple fetcher functions
const fetchers = {
  expenses: (params?: GetExpensesParams) => expenseApi.list(params),
};

// Simple mutation function
const createExpenseMutator = async (
  _: string,
  { arg }: { arg: CreateExpenseData }
) => {
  return expenseApi.create(arg);
};

// Hook for fetching expenses
export function useExpenses(params?: GetExpensesParams) {
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
