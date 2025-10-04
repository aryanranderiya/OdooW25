export enum ExpenseStatus {
  DRAFT = "DRAFT",
  PENDING_APPROVAL = "PENDING_APPROVAL",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
}

export interface Expense {
  id: string;
  title: string;
  description?: string;
  originalAmount: number;
  originalCurrency: string;
  convertedAmount: number;
  companyCurrency: string;
  exchangeRate: number;
  expenseDate: Date;
  status: ExpenseStatus;
  submitterId: string;
  submitter: {
    name: string;
    email: string;
  };
  categoryId?: string;
  category?: {
    name: string;
  };
  receipts: Receipt[];
  submittedAt?: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  approvalRequests?: ApprovalRequest[];
}

export interface Receipt {
  id: string;
  filename: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  ocrProcessed: boolean;
  ocrData?: Record<string, unknown>;
  extractedAmount?: number;
  extractedDate?: Date;
  extractedVendor?: string;
  extractedCategory?: string;
  uploadedAt: Date;
}

export interface ApprovalRequest {
  id: string;
  approver: {
    name: string;
  };
  status: "PENDING" | "APPROVED" | "REJECTED";
  comment?: string;
  actionDate?: Date;
}

export interface Category {
  id: string;
  name: string;
}

export interface ExpenseFormData {
  title: string;
  description?: string;
  originalAmount: number;
  originalCurrency: string;
  expenseDate: Date;
  categoryId?: string;
  receipts: File[];
}

export interface ExpenseSummary {
  toSubmit: {
    count: number;
    totalAmount: number;
    currency: string;
  };
  waitingApproval: {
    count: number;
    totalAmount: number;
    currency: string;
  };
  approved: {
    count: number;
    totalAmount: number;
    currency: string;
  };
}

export const PAYMENT_METHODS = [
  { value: "personal_card", label: "Personal Card" },
  { value: "company_card", label: "Company Card" },
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank Transfer" },
];
