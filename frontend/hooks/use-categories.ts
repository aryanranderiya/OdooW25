import useSWR from "swr";
import { expenseApi } from "@/lib/expense-api";
import type { Category } from "@/lib/types/expense";

export function useCategories() {
  const { data, error, isLoading } = useSWR<Category[]>(
    "/expenses/categories",
    () => expenseApi.getCategories(),
    {
      revalidateOnMount: true,
    }
  );

  return {
    categories: data || [],
    isLoading,
    error,
  };
}
