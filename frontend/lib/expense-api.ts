import { api } from "./api-client";
import type { Expense, Category } from "@/lib/types/expense";

export interface CreateExpenseData {
  title: string;
  description?: string;
  originalAmount: number;
  originalCurrency: string;
  expenseDate: string;
  categoryId?: string;
}

export interface GetExpensesParams {
  status?: string;
  search?: string;
}

export const expenseApi = {
  create: async (data: CreateExpenseData): Promise<Expense> => {
    const response = await api.post<Expense>("/expenses", data);
    return response.data;
  },

  list: async (params?: GetExpensesParams): Promise<Expense[]> => {
    const response = await api.get<Expense[]>("/expenses", { params });
    return response.data;
  },

  getCategories: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>("/expenses/categories");
    return response.data;
  },
};
