import { ExpenseApproval, ApprovalChain } from './types';

// Mock data service - replace with actual API calls
export const mockExpenseApprovals: ExpenseApproval[] = [
  {
    id: 1,
    employeeName: "John Doe",
    employeeAvatar: "https://github.com/johndoe.png",
    expenseTitle: "Business Lunch with Client",
    amount: "$125.50",
    currency: "USD",
    category: "Meals & Entertainment",
    date: "2024-10-03",
    status: "pending",
    priority: "normal",
    submittedAt: "2 hours ago",
    description: "Team lunch meeting with potential client to discuss project requirements",
    receiptUrl: "/receipt1.jpg"
  },
  {
    id: 2,
    employeeName: "Jane Smith", 
    employeeAvatar: "https://github.com/janesmith.png",
    expenseTitle: "Flight to Conference",
    amount: "$850.00",
    currency: "USD", 
    category: "Travel",
    date: "2024-10-01",
    status: "pending",
    priority: "high",
    submittedAt: "1 day ago",
    description: "Round trip flight to attend tech conference in San Francisco",
    receiptUrl: "/receipt2.jpg"
  },
  {
    id: 3,
    employeeName: "Mike Johnson",
    employeeAvatar: "https://github.com/mikejohnson.png", 
    expenseTitle: "Office Supplies",
    amount: "$45.75",
    currency: "USD",
    category: "Office Supplies",
    date: "2024-10-02", 
    status: "pending",
    priority: "low",
    submittedAt: "5 hours ago",
    description: "Purchased notebooks, pens, and sticky notes for the office",
    receiptUrl: "/receipt3.jpg"
  }
];

export const mockApprovalChains: ApprovalChain[] = [
  {
    id: 1,
    name: "Standard Approval Chain",
    steps: [
      { order: 1, role: "Direct Manager", escalationDays: 2 },
      { order: 2, role: "Department Head", escalationDays: 3 },
      { order: 3, role: "Finance Manager", escalationDays: 2 }
    ],
    conditions: "Amount < $500",
    active: true
  },
  {
    id: 2, 
    name: "High Value Approval Chain",
    steps: [
      { order: 1, role: "Direct Manager", escalationDays: 1 },
      { order: 2, role: "Department Head", escalationDays: 2 },
      { order: 3, role: "Finance Manager", escalationDays: 1 },
      { order: 4, role: "CFO", escalationDays: 2 }
    ],
    conditions: "Amount >= $500",
    active: true
  }
];

// API functions to be implemented
export class ApprovalAPI {
  static async getPendingApprovals(): Promise<ExpenseApproval[]> {
    // TODO: Replace with actual API call
    return Promise.resolve(mockExpenseApprovals);
  }

  static async getApprovalChains(): Promise<ApprovalChain[]> {
    // TODO: Replace with actual API call
    return Promise.resolve(mockApprovalChains);
  }

  static async approveExpense(expenseId: number, comment?: string): Promise<void> {
    // TODO: Implement API call
    console.log(`Approving expense ${expenseId}`, { comment });
  }

  static async rejectExpense(expenseId: number, comment: string): Promise<void> {
    // TODO: Implement API call
    console.log(`Rejecting expense ${expenseId}`, { comment });
  }

  static async createApprovalChain(chain: Omit<ApprovalChain, 'id'>): Promise<ApprovalChain> {
    // TODO: Implement API call
    const newChain = { ...chain, id: Date.now() };
    console.log('Creating approval chain', newChain);
    return Promise.resolve(newChain);
  }

  static async updateApprovalChain(chain: ApprovalChain): Promise<ApprovalChain> {
    // TODO: Implement API call
    console.log('Updating approval chain', chain);
    return Promise.resolve(chain);
  }

  static async deleteApprovalChain(chainId: number): Promise<void> {
    // TODO: Implement API call
    console.log(`Deleting approval chain ${chainId}`);
  }
}
