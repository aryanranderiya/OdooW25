import { ExpenseStatus } from "@/lib/types/expense";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface StatusFlowProps {
  currentStatus: ExpenseStatus;
}

export default function StatusFlow({ currentStatus }: StatusFlowProps) {
  const steps = [
    { status: ExpenseStatus.DRAFT, label: "Draft" },
    { status: ExpenseStatus.PENDING_APPROVAL, label: "Waiting Approval" },
    { status: ExpenseStatus.APPROVED, label: "Approved" },
  ];

  const getCurrentStepIndex = () => {
    switch (currentStatus) {
      case ExpenseStatus.DRAFT:
        return 0;
      case ExpenseStatus.PENDING_APPROVAL:
        return 1;
      case ExpenseStatus.APPROVED:
      case ExpenseStatus.REJECTED:
        return 2;
      default:
        return 0;
    }
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <nav className="flex items-center space-x-1 text-sm text-zinc-600 dark:text-zinc-400">
      {steps.map((step, index) => (
        <div key={step.status} className="flex items-center">
          <span
            className={cn(
              "font-medium transition-colors",
              index <= currentStepIndex
                ? currentStatus === ExpenseStatus.REJECTED && index === 2
                  ? "text-red-600 dark:text-red-400"
                  : "text-zinc-900 dark:text-zinc-100"
                : "text-zinc-400 dark:text-zinc-600"
            )}
          >
            {currentStatus === ExpenseStatus.REJECTED && index === 2
              ? "Rejected"
              : step.label}
          </span>
          {index < steps.length - 1 && (
            <ChevronRight
              className={cn(
                "mx-2 h-4 w-4 transition-colors",
                index < currentStepIndex
                  ? "text-zinc-400 dark:text-zinc-600"
                  : "text-zinc-300 dark:text-zinc-700"
              )}
            />
          )}
        </div>
      ))}
    </nav>
  );
}
