export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  DASHBOARD: "/dashboard",
  PROFILE: "/dashboard/profile",
  USERS: "/dashboard/users",
  SETTINGS: "/dashboard/admin/settings",
  EXPENSES: "/dashboard/expenses",
  CREATE_EXPENSE: "/dashboard/expenses/create",
  EXPENSE_DETAIL: (id: string) => `/dashboard/expenses/${id}`,
  ADMIN: "/dashboard/admin",
  VERIFY_EMAIL: "/verify-email",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
} as const;

export const AUTH_ROUTES = [ROUTES.LOGIN, ROUTES.SIGNUP] as const;

export const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.LOGIN,
  ROUTES.SIGNUP,
] as const;
