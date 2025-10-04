export interface User {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "MANAGER" | "EMPLOYEE";
  companyId: string;
  managerId?: string;
  isManagerApprover: boolean;
  manager?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  employees?: {
    id: string;
    name: string;
    email: string;
    role: string;
  }[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Company {
  id: string;
  name: string;
  country: string;
  currency: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  companyName: string;
  country: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  company: Company;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "MANAGER" | "EMPLOYEE";
  managerId?: string;
  isManagerApprover?: boolean;
}

export interface UpdateUserData {
  name?: string;
  role?: "ADMIN" | "MANAGER" | "EMPLOYEE";
  managerId?: string;
  isManagerApprover?: boolean;
}

export interface ChangeRoleData {
  role: "ADMIN" | "MANAGER" | "EMPLOYEE";
}

export interface AssignManagerData {
  managerId: string | null;
}

export interface UserListFilters {
  role?: "ADMIN" | "MANAGER" | "EMPLOYEE";
  managerId?: string;
  search?: string;
}
