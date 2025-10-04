"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { CurrencySelect } from "@/components/ui/currency-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrencyDisplay, getCurrencySymbol } from "@/lib/currency";
import {
  ExpenseFormData,
  ExpenseStatus,
  PAYMENT_METHODS,
} from "@/lib/types/expense";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ReceiptUploadModal from "./receipt-upload-modal";
import StatusFlow from "./status-flow";

interface ExpenseFormProps {
  initialData?: Partial<ExpenseFormData>;
  isEditing?: boolean;
  expenseId?: string;
  currentStatus?: ExpenseStatus;
  approvalInfo?: {
    approver: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    timestamp?: string;
  };
}

const mockCategories = [
  { id: "1", name: "Food & Dining" },
  { id: "2", name: "Travel & Transportation" },
  { id: "3", name: "Office Supplies" },
  { id: "4", name: "Software & Technology" },
  { id: "5", name: "Marketing & Events" },
  { id: "6", name: "Professional Services" },
];

export default function ExpenseForm({
  initialData,
  isEditing = false,
  expenseId,
  currentStatus = ExpenseStatus.DRAFT,
  approvalInfo,
}: ExpenseFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ExpenseFormData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    originalAmount: initialData?.originalAmount || 0,
    originalCurrency: initialData?.originalCurrency || "USD",
    expenseDate: initialData?.expenseDate || new Date(),
    categoryId: initialData?.categoryId || "",
    receipts: initialData?.receipts || [],
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [remarks, setRemarks] = useState("");

  const isReadOnly = currentStatus !== ExpenseStatus.DRAFT;
  const showSubmitButton = !isReadOnly;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("Submitting expense:", formData);
      router.push("/expenses");
    } catch (error) {
      console.error("Error submitting expense:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-4xl mx-auto px-6 pt-12 space-y-5">
        <div>
          <h1 className="text-4xl font-bold text-zinc-900 tracking-tight mb-3">
            {isEditing ? "Edit Expense" : "New Expense"}
          </h1>
          <p className="text-lg text-zinc-600 font-medium">
            {isEditing
              ? "Update your expense details"
              : "Submit a new expense for approval"}
          </p>
        </div>

        {/* Header Controls */}
        <div className="flex items-center justify-between ">
          <ReceiptUploadModal
            selectedFiles={selectedFiles}
            onFilesChange={setSelectedFiles}
            disabled={isReadOnly}
          />
          <StatusFlow currentStatus={currentStatus} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card>
            <CardContent>
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2 space-y-3">
                  <Label htmlFor="title">Description *</Label>
                  <Textarea
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Enter expense description"
                    required
                    disabled={isReadOnly}
                    className="w-full"
                    rows={5}
                  />
                </div>

                {/* Expense Date */}
                <div className="space-y-3">
                  <Label htmlFor="expense-date">Expense Date *</Label>
                  <Popover
                    open={isDatePickerOpen}
                    onOpenChange={setIsDatePickerOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        disabled={isReadOnly}
                        className="w-full justify-start"
                      >
                        <CalendarIcon className="mr-3 h-4 w-4 text-zinc-500" />
                        {formData.expenseDate
                          ? format(formData.expenseDate, "MMM dd, yyyy")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <Calendar
                        mode="single"
                        selected={formData.expenseDate}
                        onSelect={(date) => {
                          if (date) {
                            setFormData((prev) => ({
                              ...prev,
                              expenseDate: date,
                            }));
                            setIsDatePickerOpen(false);
                          }
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, categoryId: value }))
                    }
                    disabled={isReadOnly}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCategories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id}
                          className="hover:bg-zinc-50"
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="paid-by">Paid By</Label>
                  <Select disabled={isReadOnly}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="currency">Currency *</Label>
                  <CurrencySelect
                    value={formData.originalCurrency}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        originalCurrency: value,
                      }))
                    }
                    placeholder="Select currency"
                    className={
                      isReadOnly ? "opacity-50 pointer-events-none" : ""
                    }
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="amount">Amount *</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {getCurrencySymbol(formData.originalCurrency)}
                    </div>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.originalAmount || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          originalAmount: parseFloat(e.target.value) || 0,
                        }))
                      }
                      placeholder="0.00"
                      required
                      disabled={isReadOnly}
                      className="pl-8"
                    />
                  </div>
                  {formData.originalAmount > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {formatCurrencyDisplay(
                        formData.originalCurrency,
                        formData.originalAmount
                      )}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea
                    id="remarks"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Optional remarks"
                    disabled={isReadOnly}
                    rows={4}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {approvalInfo && (
            <Card className="border-zinc-200 shadow-sm bg-white">
              <CardContent className="p-8">
                <h3 className="text-lg font-semibold text-zinc-900 mb-6">
                  Approval Information
                </h3>
                <div className="grid grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-zinc-500">
                      Approver
                    </p>
                    <p className="text-base font-semibold text-zinc-900">
                      {approvalInfo.approver}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-zinc-500">Status</p>
                    <p className="text-base font-semibold text-zinc-900">
                      {approvalInfo.status}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-zinc-500">Time</p>
                    <p className="text-base font-semibold text-zinc-900">
                      {approvalInfo.timestamp || "Pending"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {showSubmitButton && (
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  !formData.title ||
                  formData.originalAmount <= 0
                }
              >
                {isSubmitting ? "Submitting..." : "Submit Expense"}
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
