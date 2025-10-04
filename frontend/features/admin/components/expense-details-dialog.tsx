import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { IconEye } from "@tabler/icons-react";
import { ExpenseApproval } from "./types";
import { formatCurrency } from "./utils";

interface ExpenseDetailsDialogProps {
  expense: ExpenseApproval;
}

export function ExpenseDetailsDialog({ expense }: ExpenseDetailsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <IconEye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Expense Details</DialogTitle>
          <DialogDescription>
            Review expense submission details
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Employee</Label>
              <p className="font-medium">{expense.employeeName}</p>
            </div>
            <div>
              <Label>Amount</Label>
              <p className="font-medium">
                {formatCurrency(expense.amount, expense.currency)}
              </p>
            </div>
            <div>
              <Label>Category</Label>
              <p>{expense.category}</p>
            </div>
            <div>
              <Label>Date</Label>
              <p>{expense.date}</p>
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <p className="text-sm text-muted-foreground mt-1">
              {expense.description}
            </p>
          </div>
          {expense.receiptUrl && (
            <div>
              <Label>Receipt</Label>
              <div className="mt-2 border rounded-lg p-4 bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  Receipt attached
                </p>
                <Button variant="link" className="p-0 h-auto font-normal">
                  View Receipt
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
