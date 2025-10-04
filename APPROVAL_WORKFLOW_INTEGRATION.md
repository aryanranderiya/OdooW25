# Approval Workflow Integration Guide

This document explains how to test and use the approval workflow system that connects the frontend and backend components.

## 🚀 Quick Start

### 1. Start the Backend
```bash
cd backend
npm install
npm run start:dev
```
The backend will run on `http://localhost:8000`

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
The frontend will run on `http://localhost:3000`

### 3. Test the Connection
1. Navigate to `/dashboard/admin` 
2. Click the "Test Approvals API" or "Test Rules API" buttons in the top-right corner
3. Verify that the API connection is working

## 📋 Features Implemented

### ✅ Backend API Endpoints

**Approval Processing:**
- `GET /approvals/pending` - Get pending approvals for current user
- `GET /approvals/all-pending` - Get all pending approvals (admin only)
- `POST /approvals/expenses/:expenseId/process` - Approve/reject expense
- `POST /approvals/requests/:requestId/escalate` - Manual escalation (admin)
- `POST /approvals/process-escalations` - Process all escalations (admin)

**Approval Rules Management:**
- `POST /approval-rules` - Create approval rule (admin)
- `GET /approval-rules` - Get all approval rules
- `GET /approval-rules/:id` - Get specific approval rule
- `PUT /approval-rules/:id` - Update approval rule (admin)
- `DELETE /approval-rules/:id` - Delete approval rule (admin)

### ✅ Frontend Integration

**API Service Layer:**
- `/lib/approval-api.ts` - Complete API service with TypeScript types
- `/hooks/use-approvals.ts` - React hooks for approval operations
- Error handling and loading states

**Admin Dashboard:**
- `/app/dashboard/admin/page.tsx` - Main admin interface
- Pending approvals management
- Approval chain configuration
- Real-time API integration

**Components:**
- Approval action dialogs
- Expense details display
- Priority badges
- Error handling UI

## 🔧 Configuration

### Environment Variables

**Backend (.env):**
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/odoow25"
JWT_SECRET="your-jwt-secret"
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
PORT=8000
```

**Frontend (.env.local):**
```bash
NEXT_PUBLIC_API_URL="http://localhost:8000"
```

### Database Setup
```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

## 🧪 Testing the Workflow

### 1. Authentication
- Make sure you're logged in as an admin user
- The JWT token is stored in HTTP-only cookies

### 2. Approval Processing
```typescript
// Approve an expense
await ApprovalAPI.approveExpense("expense-id", "Approved for business use");

// Reject an expense  
await ApprovalAPI.rejectExpense("expense-id", "Missing receipt");
```

### 3. Approval Rules
```typescript
// Create a new approval rule
await ApprovalAPI.createApprovalRule({
  name: "High Value Approval",
  ruleType: ApprovalRuleType.SEQUENTIAL,
  minAmount: 500,
  approvalSteps: [
    { sequence: 1, approverId: "manager-id", isRequired: true },
    { sequence: 2, approverId: "finance-id", isRequired: true }
  ]
});
```

## 🔄 Data Flow

1. **Frontend Request** → API Client (`/lib/api-client.ts`)
2. **Authentication** → JWT Guard validates cookie
3. **Backend Processing** → Service layer handles business logic
4. **Database Operations** → Prisma ORM manages data
5. **Response** → Formatted data returned to frontend
6. **UI Update** → React hooks update component state

## 🛠️ API Types

### Approval Actions
```typescript
enum ApprovalAction {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT'
}
```

### Rule Types
```typescript
enum ApprovalRuleType {
  SEQUENTIAL = 'SEQUENTIAL',
  PERCENTAGE = 'PERCENTAGE',
  SPECIFIC_APPROVER = 'SPECIFIC_APPROVER',
  HYBRID = 'HYBRID'
}
```

### Expense Approval
```typescript
interface ExpenseApproval {
  id: string;
  expenseId: string;
  employeeName: string;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected';
  // ... other fields
}
```

## 🚨 Error Handling

### Frontend
- API errors are caught and displayed in UI
- Loading states prevent multiple requests
- Automatic retry functionality
- Toast notifications for success/error (TODO: implement)

### Backend
- JWT authentication validation
- Database constraint validation
- Proper HTTP status codes
- Detailed error messages

## 📱 React Hooks Usage

```typescript
import { useApprovals, useApprovalData } from '@/hooks/use-approvals';

function AdminPanel() {
  const { approveExpense, rejectExpense, isLoading, error } = useApprovals();
  const { pendingApprovals, refreshData } = useApprovalData();

  const handleApprove = async (expenseId: string) => {
    const success = await approveExpense(expenseId, "Approved");
    if (success) {
      await refreshData(true); // Refresh admin data
    }
  };
}
```

## 🔍 Debugging

### API Connection Issues
1. Check browser console for error messages
2. Verify backend is running on port 8000
3. Ensure CORS is properly configured
4. Check authentication cookies in browser DevTools

### Database Issues
1. Verify PostgreSQL is running
2. Check Prisma schema matches database
3. Run migrations if needed: `npx prisma migrate dev`

### Authentication Issues
1. Check JWT secret matches between frontend/backend
2. Verify cookie settings (httpOnly, secure, sameSite)
3. Ensure user has proper role permissions

## 📋 TODO/Next Steps

- [ ] Implement toast notifications for better UX
- [ ] Add approval chain creation/editing UI
- [ ] Implement escalation settings management
- [ ] Add notification preferences
- [ ] Implement batch approval operations
- [ ] Add approval history tracking
- [ ] Implement email notifications
- [ ] Add approval analytics dashboard

## 🤝 Contributing

When adding new approval features:

1. **Backend**: Add endpoints in controllers, implement in services
2. **Frontend**: Update API service, add hooks, create UI components  
3. **Types**: Keep TypeScript types in sync between frontend/backend
4. **Testing**: Use the API connection test component to verify endpoints
5. **Documentation**: Update this README with new features

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Review backend logs for API errors
3. Verify database connection and schema
4. Test API endpoints with the built-in test component
