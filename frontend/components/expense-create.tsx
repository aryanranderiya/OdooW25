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
import { toast } from "sonner";
import { ROUTES } from "@/lib/constants";

export default function ExpenseCreate() {
  const router = useRouter();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const createExpense = useCreateExpense();

  const [formData, setFormData] = useState<ExpenseFormData>({
    title: "",
    description: "",
    originalAmount: 0,
    originalCurrency: "USD",
    expenseDate: new Date(),
    categoryId: "",
    receipts: [],
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [remarks, setRemarks] = useState("");

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

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold text-zinc-900 tracking-tight">
            New Expense
          </h1>
          <p className="text-lg text-zinc-500">
            Submit a new expense for approval
          </p>
        </div>

        {/* Header Controls */}
        <div className="flex items-center justify-between">
          <ReceiptUploadModal
            selectedFiles={selectedFiles}
            onFilesChange={setSelectedFiles}
            disabled={false}
          />
          <StatusFlow currentStatus={ExpenseStatus.DRAFT} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-8">
              <div className="grid grid-cols-2 gap-6">
                {/* Description */}
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

                {/* Category */}
                <div className="space-y-3">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, categoryId: value }))
                    }
                    disabled={categoriesLoading}
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

                {/* Paid By */}
                <div className="space-y-3">
                  <Label htmlFor="paid-by">Paid By</Label>
                  <Select>
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

                {/* Currency */}
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
                  />
                </div>

                {/* Amount */}
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

                {/* Remarks */}
                <div className="col-span-2 space-y-3">
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea
                    id="remarks"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Optional remarks"
                    rows={4}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={
                createExpense.isMutating ||
                !formData.title ||
                formData.originalAmount <= 0
              }
            >
              {createExpense.isMutating ? "Submitting..." : "Submit Expense"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
