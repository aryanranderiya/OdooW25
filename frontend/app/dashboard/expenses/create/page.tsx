import { AuthGuard } from "@/components/auth-guard";
import ExpenseCreate from "@/components/expense-create";

export default function NewExpensePage() {
  return (
    <AuthGuard>
      <ExpenseCreate />
    </AuthGuard>
  );
}
