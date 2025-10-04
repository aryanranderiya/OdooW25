"use client";

import { useState, useCallback } from 'react';
import { ApprovalAPI, ExpenseApproval, ApprovalRule, ApprovalAction } from '@/lib/approval-api';

// Hook for managing approval operations
export function useApprovals() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processApproval = useCallback(async (
    expenseId: string,
    action: ApprovalAction,
    comment?: string
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await ApprovalAPI.processApproval(expenseId, { action, comment });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const approveExpense = useCallback(async (expenseId: string, comment?: string) => {
    return processApproval(expenseId, ApprovalAction.APPROVE, comment);
  }, [processApproval]);

  const rejectExpense = useCallback(async (expenseId: string, comment: string) => {
    return processApproval(expenseId, ApprovalAction.REJECT, comment);
  }, [processApproval]);

  const escalateApproval = useCallback(async (requestId: string, newApproverId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await ApprovalAPI.escalateApproval(requestId, newApproverId);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const processEscalations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await ApprovalAPI.processEscalations();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    clearError,
    processApproval,
    approveExpense,
    rejectExpense,
    escalateApproval,
    processEscalations,
  };
}

// Hook for managing approval rules
export function useApprovalRules() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRule = useCallback(async (ruleData: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newRule = await ApprovalAPI.createApprovalRule(ruleData);
      return newRule;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateRule = useCallback(async (id: string, updateData: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedRule = await ApprovalAPI.updateApprovalRule(id, updateData);
      return updatedRule;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteRule = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await ApprovalAPI.deleteApprovalRule(id);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    clearError,
    createRule,
    updateRule,
    deleteRule,
  };
}

// Hook for fetching approval data
export function useApprovalData() {
  const [pendingApprovals, setPendingApprovals] = useState<ExpenseApproval[]>([]);
  const [approvalRules, setApprovalRules] = useState<ApprovalRule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingApprovals = useCallback(async (isAdmin = false) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const approvals = isAdmin 
        ? await ApprovalAPI.getAllPendingApprovals()
        : await ApprovalAPI.getPendingApprovals();
      
      setPendingApprovals(approvals);
      return approvals;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchApprovalRules = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const rules = await ApprovalAPI.getApprovalRules();
      setApprovalRules(rules);
      return rules;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshData = useCallback(async (isAdmin = false) => {
    await Promise.all([
      fetchPendingApprovals(isAdmin),
      fetchApprovalRules(),
    ]);
  }, [fetchPendingApprovals, fetchApprovalRules]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    pendingApprovals,
    approvalRules,
    isLoading,
    error,
    clearError,
    fetchPendingApprovals,
    fetchApprovalRules,
    refreshData,
    setPendingApprovals,
    setApprovalRules,
  };
}
