"use client";

import { AuthGuard } from "@/components/auth-guard";
import OcrExpenseForm from "@/components/ocr-expense-form";

export default function CreateExpensePage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <OcrExpenseForm />
      </div>
    </AuthGuard>
  );
}
