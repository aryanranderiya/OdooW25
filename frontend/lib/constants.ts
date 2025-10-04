export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  DASHBOARD: "/dashboard",
  USERS: "/users",
  EXPENSES: "/dashboard/expenses",
  NEW_EXPENSE: "/dashboard/expenses/new",
} as const;

export const AUTH_ROUTES = [ROUTES.LOGIN, ROUTES.SIGNUP] as const;

export const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.LOGIN,
  ROUTES.SIGNUP,
] as const;
