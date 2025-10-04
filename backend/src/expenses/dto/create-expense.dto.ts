export interface CreateExpenseDto {
  title: string;
  description?: string;
  originalAmount: number;
  originalCurrency: string;
  expenseDate: string;
  categoryId?: string;
}
