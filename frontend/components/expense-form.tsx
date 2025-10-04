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
  Category,
} from "@/lib/types/expense";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ReceiptUploadModal from "./receipt-upload-modal";
import StatusFlow from "./status-flow";
import { useCreateExpense } from "@/hooks/use-expenses";
import { useCategories } from "@/hooks/use-categories";
import { useCurrencyConversion } from "@/hooks/use-currency";
import { toast } from "sonner";
import { ROUTES } from "@/lib/constants";
import { useAuth } from "@/contexts/auth-context";

interface ExpenseFormProps {
  initialData?: Partial<ExpenseFormData>;
  expenseId?: string;
  currentStatus?: ExpenseStatus;
  approvalInfo?: {
    approver: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    timestamp?: string;
  };
  mode?: "create" | "view";
}

export default function ExpenseForm({
  initialData,
  currentStatus = ExpenseStatus.DRAFT,
  approvalInfo,
  mode = "create",
}: ExpenseFormProps) {
  const router = useRouter();
  const { company } = useAuth();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const createExpense = useCreateExpense();

  const isViewMode = mode === "view";
  const isCreateMode = mode === "create";
  
  // Get the company's base currency (typically USD)
  const baseCurrency = company?.currency || "USD";

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

  // Get currency conversion in real-time
  const { conversion, isConverting } = useCurrencyConversion(
    formData.originalAmount,
    formData.originalCurrency,
    baseCurrency
  );

  const isReadOnly = isViewMode;
  const showSubmitButton = isCreateMode;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      await createExpense.trigger({
        title: formData.title,
        description: formData.description,
        originalAmount: formData.originalAmount,
        originalCurrency: formData.originalCurrency,
        expenseDate: formData.expenseDate.toISOString(),
        categoryId: formData.categoryId,
      });
      toast.success("Expense created successfully!");
      router.push(ROUTES.EXPENSES);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create expense";
      toast.error(errorMessage);
    }
  };

  // Apple-like status styling
  const getStatusConfig = (status: ExpenseStatus) => {
    switch (status) {
      case ExpenseStatus.DRAFT:
        return { color: "text-zinc-600", bg: "bg-zinc-100", label: "Draft" };
      case ExpenseStatus.PENDING_APPROVAL:
        return {
          color: "text-amber-600",
          bg: "bg-amber-50",
          label: "Pending Approval",
        };
      case ExpenseStatus.APPROVED:
        return {
          color: "text-green-600",
          bg: "bg-green-50",
          label: "Approved",
        };
      case ExpenseStatus.REJECTED:
        return { color: "text-red-600", bg: "bg-red-50", label: "Rejected" };
      case ExpenseStatus.CANCELLED:
        return {
          color: "text-zinc-500",
          bg: "bg-zinc-100",
          label: "Cancelled",
        };
      default:
        return { color: "text-zinc-600", bg: "bg-zinc-100", label: "Unknown" };
    }
  };

  const statusConfig = getStatusConfig(currentStatus);

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-semibold text-zinc-900 tracking-tight">
              {isViewMode ? "Expense Details" : "New Expense"}
            </h1>
            {isViewMode && (
              <div className={`px-4 py-2 rounded-full ${statusConfig.bg}`}>
                <span className={`text-sm font-medium ${statusConfig.color}`}>
                  {statusConfig.label}
                </span>
              </div>
            )}
          </div>
          <p className="text-lg text-zinc-500">
            {isViewMode
              ? "Review your expense submission"
              : "Submit a new expense for approval"}
          </p>
        </div>

        {/* View Mode: Clean Display */}
        {isViewMode ? (
          <div className="space-y-6">
            {/* Main Info Card */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-8 space-y-6">
                {/* Description */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                    Description
                  </p>
                  <p className="text-xl font-medium text-zinc-900 leading-relaxed">
                    {formData.title}
                  </p>
                </div>

                {/* Amount - Prominent Display */}
                <div className="py-6 space-y-2">
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                    Amount
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-5xl font-semibold text-zinc-900">
                      {getCurrencySymbol(formData.originalCurrency)}
                      {formData.originalAmount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                    <p className="text-lg text-zinc-500">
                      {formData.originalCurrency}
                    </p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-8 pt-6 border-t border-zinc-100">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                      Date
                    </p>
                    <p className="text-base font-medium text-zinc-900">
                      {format(formData.expenseDate, "MMMM dd, yyyy")}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                      Category
                    </p>
                    <p className="text-base font-medium text-zinc-900">
                      {categories.find((c) => c.id === formData.categoryId)
                        ?.name || "—"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Approval Info Card */}
            {approvalInfo && (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-8 space-y-6">
                  <h3 className="text-base font-semibold text-zinc-900">
                    Approval Status
                  </h3>
                  <div className="grid grid-cols-3 gap-8">
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                        Approver
                      </p>
                      <p className="text-base font-medium text-zinc-900">
                        {approvalInfo.approver}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                        Status
                      </p>
                      <div
                        className={`inline-flex px-3 py-1 rounded-full ${statusConfig.bg}`}
                      >
                        <span
                          className={`text-sm font-medium ${statusConfig.color}`}
                        >
                          {approvalInfo.status}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                        Date
                      </p>
                      <p className="text-base font-medium text-zinc-900">
                        {approvalInfo.timestamp || "Pending"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Additional Info */}
            {formData.description && (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-8 space-y-4">
                  <h3 className="text-base font-semibold text-zinc-900">
                    Additional Details
                  </h3>
                  <p className="text-base text-zinc-600 leading-relaxed">
                    {formData.description}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          /* Create Mode: Form Layout */
          <>
            {/* Header Controls */}
            <div className="flex items-center justify-between">
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
                          setFormData((prev) => ({
                            ...prev,
                            categoryId: value,
                          }))
                        }
                        disabled={isReadOnly || categoriesLoading}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={
                              categoriesLoading
                                ? "Loading categories..."
                                : "Select category"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category: Category) => (
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

                    {!isReadOnly && (
                      <div className="space-y-3">
                        <Label htmlFor="paid-by">Paid By</Label>
                        <Select disabled={isReadOnly}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                          <SelectContent>
                            {PAYMENT_METHODS.map((method) => (
                              <SelectItem
                                key={method.value}
                                value={method.value}
                              >
                                {method.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

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

                    {!isReadOnly && (
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
                    )}
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
                        <p className="text-sm font-medium text-zinc-500">
                          Status
                        </p>
                        <p className="text-base font-semibold text-zinc-900">
                          {approvalInfo.status}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-zinc-500">
                          Time
                        </p>
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
                      createExpense.isMutating ||
                      !formData.title ||
                      formData.originalAmount <= 0
                    }
                  >
                    {createExpense.isMutating
                      ? "Submitting..."
                      : "Submit Expense"}
                  </Button>
                </div>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
}
