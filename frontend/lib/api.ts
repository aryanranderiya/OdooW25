// Re-export for backward compatibility
export { api } from "./api-client";
export { authApi } from "./auth-api";
export { userApi } from "./user-api";
export { ApprovalAPI } from "./approval-api";

// Re-export types
export type {
  User,
  Company,
  SignupData,
  LoginData,
  AuthResponse,
  CreateUserData,
  UpdateUserData,
  ChangeRoleData,
  AssignManagerData,
  UserListFilters,
} from "@/types/user";

// Re-export approval types
export type {
  ExpenseApproval,
  ApprovalRule,
  ApprovalStep,
  ApprovalComment,
  ProcessApprovalDto,
  CreateApprovalRuleDto,
  UpdateApprovalRuleDto,
  ApprovalAction,
  ApprovalRuleType,
} from "./approval-api";
