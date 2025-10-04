"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CurrencySelect } from "@/components/ui/currency-select";
import { Calendar } from "@/components/ui/calendar";
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
import {
  Upload,
  Camera,
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2,
  CalendarIcon,
} from "lucide-react";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useOcr } from "@/hooks/use-ocr";
import { expenseApi } from "@/lib/expense-api";
import { useRouter } from "next/navigation";

interface ExpenseFormData {
  title: string;
  description: string;
  originalAmount: number;
  originalCurrency: string;
  expenseDate: Date;
  categoryId: string;
}

const mockCategories = [
  { id: "1", name: "Food & Dining" },
  { id: "2", name: "Travel & Transportation" },
  { id: "3", name: "Office Supplies" },
  { id: "4", name: "Software & Technology" },
  { id: "5", name: "Marketing & Events" },
  { id: "6", name: "Professional Services" },
];

export default function OcrExpenseForm() {
  const router = useRouter();
  const { ocrState, uploadAndProcess, createExpenseFromReceipt, resetOcr } =
    useOcr();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOcrCorrection, setShowOcrCorrection] = useState(false);

  const [formData, setFormData] = useState<ExpenseFormData>({
    title: "",
    description: "",
    originalAmount: 0,
    originalCurrency: "USD",
    expenseDate: new Date(),
    categoryId: "",
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      resetOcr();
    }
  };

  const handleOcrProcess = async () => {
    if (!selectedFile) return;
    await uploadAndProcess(selectedFile);
  };

  // Auto-fill form when OCR data is available
  useEffect(() => {
    if (ocrState.data) {
      setFormData((prev) => ({
        ...prev,
        originalAmount: ocrState.data?.amount || prev.originalAmount,
        title: ocrState.data?.vendor
          ? `Expense from ${ocrState.data.vendor}`
          : prev.title,
        expenseDate: ocrState.data?.date || prev.expenseDate,
      }));

      // Find matching category
      if (ocrState.data.category) {
        const matchingCategory = mockCategories.find((cat) =>
          cat.name
            .toLowerCase()
            .includes(ocrState.data?.category?.toLowerCase() || "")
        );
        if (matchingCategory) {
          setFormData((prev) => ({ ...prev, categoryId: matchingCategory.id }));
        }
      }
    }
  }, [ocrState.data]);

  const handleOcrCorrection = (
    field: string,
    value: number | string | Date
  ) => {
    // Update form data directly since we're not sending corrections to API anymore
    if (field === "amount" && typeof value === "number") {
      setFormData((prev) => ({ ...prev, originalAmount: value }));
    } else if (field === "vendor" && typeof value === "string") {
      setFormData((prev) => ({ ...prev, title: `Expense from ${value}` }));
    } else if (field === "date" && value instanceof Date) {
      setFormData((prev) => ({ ...prev, expenseDate: value }));
    } else if (field === "category" && typeof value === "string") {
      // Find matching category ID when category is corrected
      const matchingCategory = mockCategories.find((cat) =>
        cat.name.toLowerCase().includes(value.toLowerCase() || "")
      );
      if (matchingCategory) {
        setFormData((prev) => ({ ...prev, categoryId: matchingCategory.id }));
      }
    }
  };

  const handleCreateFromReceipt = async () => {
    setIsSubmitting(true);
    try {
      const expense = await createExpenseFromReceipt();
      if (expense && typeof expense === "object" && "id" in expense) {
        router.push(`/dashboard/expenses/${expense.id}`);
      }
    } catch (error) {
      console.error("Failed to create expense from receipt:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const expense = await expenseApi.createExpense(formData);
      if (expense && typeof expense === "object" && "id" in expense) {
        router.push(`/dashboard/expenses/${expense.id}`);
      }
    } catch (error) {
      console.error("Error creating expense:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Create Expense with OCR
        </h1>
        <p className="text-gray-600">
          Upload a receipt and let AI extract the details for you
        </p>
      </div>

      {/* Receipt Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Receipt Upload & OCR Processing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileSelect}
              className="hidden"
              id="receipt-upload"
            />
            <label htmlFor="receipt-upload" className="cursor-pointer">
              <Upload className="h-10 w-10 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">
                Click to upload receipt or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, PDF up to 10MB
              </p>
            </label>
          </div>

          {selectedFile && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">{selectedFile.name}</span>
              </div>
              <Button
                onClick={handleOcrProcess}
                disabled={ocrState.isProcessing}
                size="sm"
              >
                {ocrState.isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Process with OCR"
                )}
              </Button>
            </div>
          )}

          {/* OCR Results */}
          {ocrState.data && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="font-medium">OCR Processing Complete</span>
                <span className="text-sm text-gray-500">
                  Confidence: {Math.round(ocrState.confidence * 100)}%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                <div>
                  <Label className="text-sm font-medium">
                    Extracted Amount
                  </Label>
                  <p className="text-lg font-semibold">
                    ${ocrState.data.amount?.toFixed(2) || "Not found"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Vendor</Label>
                  <p className="text-lg font-semibold">
                    {ocrState.data.vendor || "Not found"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Date</Label>
                  <p className="text-lg font-semibold">
                    {ocrState.data.date
                      ? format(new Date(ocrState.data.date), "MMM dd, yyyy")
                      : "Not found"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Category</Label>
                  <p className="text-lg font-semibold">
                    {ocrState.data.category || "Not found"}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowOcrCorrection(!showOcrCorrection)}
                >
                  {showOcrCorrection ? "Hide" : "Correct"} OCR Data
                </Button>
                <Button
                  onClick={handleCreateFromReceipt}
                  disabled={isSubmitting}
                  size="sm"
                >
                  Auto-Create Expense
                </Button>
              </div>

              {showOcrCorrection && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Correct OCR Data</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Amount</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={ocrState.data.amount || ""}
                        onChange={(e) =>
                          handleOcrCorrection(
                            "amount",
                            parseFloat(e.target.value)
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label>Vendor</Label>
                      <Input
                        value={ocrState.data.vendor || ""}
                        onChange={(e) =>
                          handleOcrCorrection("vendor", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={
                          ocrState.data.date
                            ? format(new Date(ocrState.data.date), "yyyy-MM-dd")
                            : ""
                        }
                        onChange={(e) =>
                          handleOcrCorrection("date", new Date(e.target.value))
                        }
                      />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Input
                        value={ocrState.data.category || ""}
                        onChange={(e) =>
                          handleOcrCorrection("category", e.target.value)
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* OCR Errors and Warnings */}
          {ocrState.errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {ocrState.errors.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </AlertDescription>
            </Alert>
          )}

          {ocrState.warnings.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {ocrState.warnings.map((warning, index) => (
                  <div key={index}>{warning}</div>
                ))}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Expense Form */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="title">Description *</Label>
                <Textarea
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Enter expense description"
                  required
                />
              </div>

              <div>
                <Label htmlFor="amount">Amount *</Label>
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
                  required
                />
              </div>

              <div>
                <Label htmlFor="currency">Currency *</Label>
                <CurrencySelect
                  value={formData.originalCurrency}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      originalCurrency: value,
                    }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="date">Expense Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(formData.expenseDate, "MMM dd, yyyy")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <Calendar
                      mode="single"
                      selected={formData.expenseDate}
                      onSelect={(date) =>
                        date &&
                        setFormData((prev) => ({
                          ...prev,
                          expenseDate: date,
                        }))
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      categoryId: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline">
                Save as Draft
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  !formData.title ||
                  formData.originalAmount <= 0
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Expense"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
