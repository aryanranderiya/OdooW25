"use client";

import { AuthGuard } from "@/components/auth-guard";
import ExpenseForm from "@/components/expense-form";

export default function CreateExpensePage() {
  return (
    <AuthGuard>
      <ExpenseForm mode="create" />
    </AuthGuard>
  );
}
