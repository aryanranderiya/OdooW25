export class CreateExpenseDto {
  title: string;
  description?: string;
  originalAmount: number;
  originalCurrency: string;
  expenseDate: string;
  categoryId?: string;
}

export class UpdateExpenseDto {
  title?: string;
  description?: string;
  originalAmount?: number;
  originalCurrency?: string;
  expenseDate?: string;
  categoryId?: string;
}

export class SubmitExpenseDto {
  // Optional - can be used to include any additional submission notes
  notes?: string;
}

export class GetExpensesQueryDto {
  status?: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}
