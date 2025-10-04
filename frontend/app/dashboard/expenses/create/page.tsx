import { AuthGuard } from "@/components/auth-guard";
import ExpenseForm from "@/components/expense-form";

export default function NewExpensePage() {
  return (
    <AuthGuard>
      <ExpenseForm />
    </AuthGuard>
  );
}
