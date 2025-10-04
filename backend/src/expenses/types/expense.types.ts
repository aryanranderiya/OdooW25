export interface CreateExpenseRequest {
  title: string;
  description?: string;
  originalAmount: number;
  originalCurrency: string;
  expenseDate: string;
  categoryId?: string;
}

export interface GetExpensesQuery {
  status?: string;
  search?: string;
}

export interface Category {
  id: string;
  name: string;
}
