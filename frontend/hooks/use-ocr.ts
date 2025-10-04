import { useState, useCallback } from "react";
import { expenseApi, OcrExtractedData } from "@/lib/expense-api";

export interface OcrState {
  isProcessing: boolean;
  data: OcrExtractedData | null;
  errors: string[];
  warnings: string[];
  confidence: number;
  rawText: string;
}

export interface UseOcrReturn {
  ocrState: OcrState;
  uploadAndProcess: (file: File) => Promise<void>;
  createExpenseFromReceipt: () => Promise<any>;
  resetOcr: () => void;
}

export function useOcr(): UseOcrReturn {
  const [ocrState, setOcrState] = useState<OcrState>({
    isProcessing: false,
    data: null,
    errors: [],
    warnings: [],
    confidence: 0,
    rawText: "",
  });

  const [currentReceiptId, setCurrentReceiptId] = useState<string | null>(null);

  const resetOcr = useCallback(() => {
    setOcrState({
      isProcessing: false,
      data: null,
      errors: [],
      warnings: [],
      confidence: 0,
      rawText: "",
    });
    setCurrentReceiptId(null);
  }, []);

  const uploadAndProcess = useCallback(async (file: File) => {
    setOcrState((prev) => ({
      ...prev,
      isProcessing: true,
      errors: [],
      warnings: [],
    }));

    try {
      // Upload the file
      const uploadResult = await expenseApi.uploadReceipts([file]);
      const receiptId = uploadResult.receipts[0].receiptId;
      setCurrentReceiptId(receiptId);

      // Poll for OCR completion
      await pollOcrCompletion(receiptId);
    } catch (error) {
      setOcrState((prev) => ({
        ...prev,
        isProcessing: false,
        errors: [(error as Error).message || "Failed to process receipt"],
      }));
    }
  }, []);

  const pollOcrCompletion = async (receiptId: string) => {
    const maxAttempts = 60; // 1 minute timeout
    let attempts = 0;

    const poll = async (): Promise<void> => {
      try {
        const status = await expenseApi.getOcrStatus(receiptId);

        if (status.ocrProcessed) {
          // OCR is complete
          setOcrState((prev) => ({
            ...prev,
            isProcessing: false,
            data: status.extractedData,
            confidence: status.ocrData?.confidence || 0.8,
            rawText: status.ocrData?.extractedText || "",
          }));

          // Validate the OCR results
          validateOcrResults(status.extractedData);
          return;
        }

        // Continue polling
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 1000); // Poll every second
        } else {
          throw new Error("OCR processing timeout");
        }
      } catch (error) {
        setOcrState((prev) => ({
          ...prev,
          isProcessing: false,
          errors: ["OCR processing failed or timed out"],
        }));
      }
    };

    await poll();
  };

  const validateOcrResults = (data: OcrExtractedData) => {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Validate amount
    if (!data.amount || data.amount <= 0) {
      errors.push("Amount not found or invalid");
    } else if (data.amount > 10000) {
      warnings.push("Unusually high amount detected, please verify");
    }

    // Validate date
    if (!data.date) {
      warnings.push("Date not found in receipt");
    } else {
      const receiptDate = new Date(data.date);
      const now = new Date();
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

      if (receiptDate > now) {
        warnings.push("Receipt date is in the future");
      } else if (receiptDate < oneYearAgo) {
        warnings.push("Receipt is more than one year old");
      }
    }

    // Validate vendor
    if (!data.vendor || data.vendor.trim().length < 2) {
      warnings.push("Vendor name unclear or missing");
    }

    setOcrState((prev) => ({
      ...prev,
      errors,
      warnings,
    }));
  };

  const createExpenseFromReceipt = useCallback(async (receiptId: string) => {
    try {
      const expense = await expenseApi.createExpenseFromReceipt(receiptId);
      return expense;
    } catch (error) {
      setOcrState((prev) => ({
        ...prev,
        errors: [...prev.errors, "Failed to create expense from receipt"],
      }));
      throw error;
    }
  }, []);

  return {
    ocrState,
    uploadAndProcess,
    createExpenseFromReceipt: () => (currentReceiptId ? createExpenseFromReceipt(currentReceiptId) : Promise.reject(new Error("No receipt ID"))),
    resetOcr,
  };
}
