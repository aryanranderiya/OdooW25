// Re-export for backward compatibility
export { api } from "./api-client";
export { authApi } from "./auth-api";
export { userApi } from "./user-api";

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
