# Approval Workflow API Documentation

This document shows how to use the approval workflow system that was implemented for expense management.

## Features Implemented

### 3. Approval Workflow (Manager/Admin Features)
✅ View pending approvals
✅ Approve / Reject with comments  
✅ Multi-step approval chain setup
✅ Escalation (manual escalation + automatic escalation framework)
✅ Approval notifications (backend framework ready)

### 4. Conditional Approval Rules
✅ Percentage-based approval (e.g., 60% of approvers needed)
✅ Specific approver override (e.g., CFO auto-approves) 
✅ Hybrid rules (60% OR CFO approval)
✅ Sequential approval chains
✅ Rule builder API for Admin

## API Endpoints

### Authentication
All endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Expense Management

#### 1. Create Expense (Draft)
```http
POST /expenses
Content-Type: application/json

{
  "title": "Business lunch with client",
  "description": "Discussed Q4 project requirements", 
  "originalAmount": 125.50,
  "originalCurrency": "USD",
  "expenseDate": "2024-10-03",
  "categoryId": "category-id-here"
}
```

#### 2. Submit Expense for Approval
```http
POST /expenses/{expense-id}/submit
Content-Type: application/json

{
  "notes": "Please review and approve"
}
```

#### 3. Get User's Expenses
```http
GET /expenses?status=PENDING_APPROVAL&search=lunch
```

### Approval Workflow

#### 4. Get Pending Approvals (for current user)
```http
GET /approvals/pending
```

#### 5. Get All Pending Approvals (Admin only)
```http
GET /approvals/all-pending?companyId=company-id
```

#### 6. Approve/Reject Expense
```http
POST /approvals/expenses/{expense-id}/process
Content-Type: application/json

{
  "action": "APPROVE", // or "REJECT"
  "comment": "Approved - looks good!"
}
```

#### 7. Manual Escalation (Admin only)
```http
POST /approvals/requests/{request-id}/escalate
Content-Type: application/json

{
  "newApproverId": "user-id-here"
}
```

### Approval Rules Management

#### 8. Create Approval Rule (Admin only)
```http
POST /approval-rules
Content-Type: application/json

{
  "name": "High Value Approval Chain",
  "description": "For expenses over $500",
  "ruleType": "SEQUENTIAL",
  "minAmount": 500,
  "requireManagerFirst": true,
  "approvalSteps": [
    {
      "sequence": 1,
      "approverId": "manager-user-id",
      "isRequired": true
    },
    {
      "sequence": 2, 
      "approverId": "admin-user-id",
      "isRequired": true
    }
  ]
}
```

#### 9. Percentage-Based Rule
```http
POST /approval-rules
Content-Type: application/json

{
  "name": "Team Consensus Rule",
  "description": "Requires 60% team approval",
  "ruleType": "PERCENTAGE",
  "percentageThreshold": 60,
  "minAmount": 200,
  "maxAmount": 999,
  "approvalSteps": [
    {
      "sequence": 1,
      "approverId": "manager1-id",
      "isRequired": false
    },
    {
      "sequence": 2,
      "approverId": "manager2-id", 
      "isRequired": false
    },
    {
      "sequence": 3,
      "approverId": "admin-id",
      "isRequired": false
    }
  ]
}
```

#### 10. Hybrid Rule (Percentage OR Specific Approver)
```http
POST /approval-rules
Content-Type: application/json

{
  "name": "Hybrid Approval Rule",
  "description": "60% consensus OR CFO override",
  "ruleType": "HYBRID",
  "percentageThreshold": 60,
  "specificApproverId": "cfo-user-id",
  "minAmount": 1000,
  "approvalSteps": [
    {
      "sequence": 1,
      "approverId": "manager1-id",
      "isRequired": false
    },
    {
      "sequence": 2,
      "approverId": "manager2-id",
      "isRequired": false  
    },
    {
      "sequence": 3,
      "approverId": "director-id",
      "isRequired": false
    }
  ]
}
```

#### 11. Get All Approval Rules
```http
GET /approval-rules
```

#### 12. Update Approval Rule (Admin only)
```http
PUT /approval-rules/{rule-id}
Content-Type: application/json

{
  "name": "Updated Rule Name",
  "isActive": true,
  "percentageThreshold": 75
}
```

## Approval Rule Types

### 1. SEQUENTIAL
- Approvers must approve in order (step 1, then step 2, etc.)
- Next step is created only after current step is approved
- If `requireManagerFirst: true`, manager approval happens before rule steps

### 2. PERCENTAGE  
- All approval requests created simultaneously
- Expense is approved when percentage threshold is met
- Example: 60% of 5 approvers = 3 approvals needed

### 3. SPECIFIC_APPROVER
- Only the specified approver can approve
- Useful for CFO/CEO override scenarios
- Single approval completes the workflow

### 4. HYBRID
- Combines percentage and specific approver
- Expense approved if EITHER condition is met:
  - Percentage threshold reached OR
  - Specific approver approves

## Escalation

### Automatic Escalation
- Runs periodically to check overdue approvals
- Escalates to approver's manager after timeout
- Falls back to company admin if no manager

### Manual Escalation
- Admins can manually escalate any pending approval
- Creates new approval request with higher step number
- Original request is marked with escalation comment

## Response Examples

### Pending Approval Response
```json
{
  "id": "approval-request-id",
  "expenseId": "expense-id", 
  "stepNumber": 1,
  "status": "PENDING",
  "expense": {
    "id": "expense-id",
    "title": "Business lunch",
    "originalAmount": 125.50,
    "originalCurrency": "USD",
    "convertedAmount": 125.50,
    "companyCurrency": "USD",
    "submitter": {
      "id": "user-id",
      "name": "John Doe",
      "email": "john@company.com"
    },
    "category": {
      "name": "Meals & Entertainment"
    }
  }
}
```

### Expense with Approval Status
```json
{
  "id": "expense-id",
  "title": "Conference Flight",
  "status": "PENDING_APPROVAL", 
  "originalAmount": 850.00,
  "approvalRequests": [
    {
      "id": "request-1",
      "stepNumber": 1,
      "status": "APPROVED",
      "approver": {
        "name": "Manager User"
      },
      "comment": "Approved for business travel",
      "actionDate": "2024-10-03T10:30:00Z"
    },
    {
      "id": "request-2", 
      "stepNumber": 2,
      "status": "PENDING",
      "approver": {
        "name": "Admin User"  
      }
    }
  ]
}
```

## Testing the Workflow

1. **Setup**: Run the seed script to create test users and approval rules
2. **Login**: Use employee account to create and submit expenses
3. **Approve**: Use manager/admin accounts to approve expenses  
4. **Test Rules**: Create expenses with different amounts to trigger different rules
5. **Escalation**: Test manual escalation with admin account

## Database Schema

The approval system uses these key models from the Prisma schema:
- `ApprovalRule` - Defines approval logic
- `ApprovalStep` - Individual approvers in a rule  
- `ApprovalRequest` - Specific approval instances
- `Expense` - Links to approval rule and requests
