// API client for expense management with OCR
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ExpenseFormData {
  title: string;
  description?: string;
  originalAmount: number;
  originalCurrency: string;
  expenseDate: Date;
  categoryId?: string;
}

export interface OcrExtractedData {
  amount: number | null;
  date: Date | null;
  vendor: string | null;
  category: string | null;
}

export interface ReceiptUploadResponse {
  receipts: Array<{
    receiptId: string;
    filename: string;
    fileSize: number;
    status: string;
    ocrStatus: string;
  }>;
}

export interface OcrStatusResponse {
  receiptId: string;
  ocrProcessed: boolean;
  extractedData: OcrExtractedData;
  ocrData: {
    extractedText: string;
    confidence: number;
  };
}

class ExpenseApiClient {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      credentials: "include", // Include cookies for auth
      headers: {
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  // Upload receipts for OCR processing
  async uploadReceipts(files: File[], expenseId?: string): Promise<ReceiptUploadResponse> {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append("receipts", file);
    });

    if (expenseId) {
      formData.append("expenseId", expenseId);
    }

    return this.makeRequest("/expenses/upload-receipts", {
      method: "POST",
      body: formData,
    });
  }

  // Check OCR processing status
  async getOcrStatus(receiptId: string): Promise<OcrStatusResponse> {
    return this.makeRequest(`/expenses/receipts/${receiptId}/ocr-status`);
  }

  // Submit OCR corrections
  async correctOcrData(receiptId: string, correctedData: Partial<OcrExtractedData>) {
    return this.makeRequest(`/expenses/receipts/${receiptId}/correct-ocr`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(correctedData),
    });
  }

  // Create expense from OCR data
  async createExpenseFromReceipt(receiptId: string) {
    return this.makeRequest(`/expenses/create-from-receipt/${receiptId}`, {
      method: "POST",
    });
  }

  // Create expense manually
  async createExpense(expenseData: ExpenseFormData) {
    return this.makeRequest("/expenses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...expenseData,
        expenseDate: expenseData.expenseDate.toISOString(),
      }),
    });
  }

  // Get all expenses
  async getExpenses(
    params: {
      page?: number;
      limit?: number;
      status?: string;
      category?: string;
    } = {}
  ) {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/expenses?${queryString}` : "/expenses";

    return this.makeRequest(endpoint);
  }

  // Get expense by ID
  async getExpense(id: string) {
    return this.makeRequest(`/expenses/${id}`);
  }

  // Update expense
  async updateExpense(id: string, updates: Partial<ExpenseFormData>) {
    return this.makeRequest(`/expenses/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...updates,
        expenseDate: updates.expenseDate?.toISOString(),
      }),
    });
  }

  // Submit expense for approval
  async submitExpense(id: string) {
    return this.makeRequest(`/expenses/${id}/submit`, {
      method: "PATCH",
    });
  }

  // Delete expense
  async deleteExpense(id: string) {
    return this.makeRequest(`/expenses/${id}`, {
      method: "DELETE",
    });
  }

  // Get expense summary
  async getExpenseSummary() {
    return this.makeRequest("/expenses/summary");
  }

  // Get categories
  async getCategories() {
    return this.makeRequest("/expenses/categories");
  }
}

export const expenseApi = new ExpenseApiClient();
