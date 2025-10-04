"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  ApprovalRuleType,
  ApprovalRule,
  CreateApprovalRuleDto,
} from "@/lib/approval-api";
import { userApi } from "@/lib/user-api";

interface ApprovalRuleFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<CreateApprovalRuleDto>) => void;
  initialData?: ApprovalRule | null;
}

export function ApprovalRuleForm({
  open,
  onClose,
  initialData,
  onSubmit,
}: ApprovalRuleFormProps) {
  const [ruleType, setRuleType] = useState<ApprovalRuleType>(
    initialData?.ruleType || ApprovalRuleType.SEQUENTIAL
  );
  const [users, setUsers] = useState<
    Array<{ id: string; name: string; role: string }>
  >([]);
  const [approvalSteps, setApprovalSteps] = useState<
    Array<{ sequence: number; approverId: string; isRequired: boolean }>
  >(initialData?.approvalSteps || []);

  interface FormData {
    name: string;
    description?: string;
    ruleType: ApprovalRuleType;
    isActive: boolean;
    minAmount?: number;
    maxAmount?: number;
    percentageThreshold?: number;
    specificApproverId?: string;
    requireManagerFirst: boolean;
  }

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      description: "",
      ruleType: ApprovalRuleType.SEQUENTIAL,
      isActive: true,
      minAmount: undefined,
      maxAmount: undefined,
      percentageThreshold: undefined,
      specificApproverId: "",
      requireManagerFirst: false,
    },
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || "",
        description: initialData.description || "",
        ruleType: initialData.ruleType || ApprovalRuleType.SEQUENTIAL,
        isActive: initialData.isActive ?? true,
        minAmount: initialData.minAmount || undefined,
        maxAmount: initialData.maxAmount || undefined,
        percentageThreshold: initialData.percentageThreshold || undefined,
        specificApproverId: initialData.specificApproverId || "",
        requireManagerFirst: initialData.requireManagerFirst || false,
      });
      setRuleType(initialData.ruleType || ApprovalRuleType.SEQUENTIAL);
      setApprovalSteps(initialData.approvalSteps || []);
    } else {
      reset({
        name: "",
        description: "",
        ruleType: ApprovalRuleType.SEQUENTIAL,
        isActive: true,
        minAmount: undefined,
        maxAmount: undefined,
        percentageThreshold: undefined,
        specificApproverId: "",
        requireManagerFirst: false,
      });
      setRuleType(ApprovalRuleType.SEQUENTIAL);
      setApprovalSteps([]);
    }
  }, [initialData, reset]);

  const loadUsers = async () => {
    try {
      const response = await userApi.list();
      setUsers(response);
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const addApprovalStep = () => {
    setApprovalSteps([
      ...approvalSteps,
      { sequence: approvalSteps.length + 1, approverId: "", isRequired: true },
    ]);
  };

  const removeApprovalStep = (index: number) => {
    const updated = approvalSteps.filter((_, i) => i !== index);
    setApprovalSteps(updated.map((step, i) => ({ ...step, sequence: i + 1 })));
  };

  const updateApprovalStep = (
    index: number,
    field: string,
    value: string | boolean
  ) => {
    const updated = [...approvalSteps];
    updated[index] = { ...updated[index], [field]: value };
    setApprovalSteps(updated);
  };

  const onFormSubmit = (data: FormData) => {
    // Convert empty strings to undefined for numeric fields
    const sanitizedData: Partial<CreateApprovalRuleDto> = {
      name: data.name,
      description: data.description,
      isActive: data.isActive,
      requireManagerFirst: data.requireManagerFirst,
      ruleType,
      minAmount:
        data.minAmount === undefined
          ? undefined
          : parseFloat(String(data.minAmount)),
      maxAmount:
        data.maxAmount === undefined
          ? undefined
          : parseFloat(String(data.maxAmount)),
      percentageThreshold:
        data.percentageThreshold === undefined
          ? undefined
          : parseInt(String(data.percentageThreshold)),
      specificApproverId:
        data.specificApproverId === "" ? undefined : data.specificApproverId,
      approvalSteps:
        ruleType === ApprovalRuleType.SEQUENTIAL ||
        ruleType === ApprovalRuleType.PERCENTAGE ||
        ruleType === ApprovalRuleType.HYBRID
          ? approvalSteps.filter((step) => step.approverId) // Remove steps without approver
          : undefined,
    };

    onSubmit(sanitizedData);
    reset();
    setApprovalSteps([]);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Approval Rule" : "Create Approval Rule"}
          </DialogTitle>
          <DialogDescription>
            Define approval workflow rules for expense approvals
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Rule Name *</Label>
              <Input
                id="name"
                {...register("name", { required: "Rule name is required" })}
                placeholder="e.g., Standard Approval Flow"
              />
              {errors.name && (
                <p className="text-sm text-red-500">
                  {String(errors.name.message || "This field is required")}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Describe when this rule applies"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minAmount">Min Amount</Label>
                <Input
                  id="minAmount"
                  type="number"
                  step="0.01"
                  {...register("minAmount")}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="maxAmount">Max Amount</Label>
                <Input
                  id="maxAmount"
                  type="number"
                  step="0.01"
                  {...register("maxAmount")}
                  placeholder="Unlimited"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="ruleType">Rule Type *</Label>
              <Select
                value={ruleType}
                onValueChange={(value) =>
                  setRuleType(value as ApprovalRuleType)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ApprovalRuleType.SEQUENTIAL}>
                    Sequential - Approvers in order
                  </SelectItem>
                  <SelectItem value={ApprovalRuleType.PERCENTAGE}>
                    Percentage - X% must approve
                  </SelectItem>
                  <SelectItem value={ApprovalRuleType.SPECIFIC_APPROVER}>
                    Specific Approver - One person approves
                  </SelectItem>
                  <SelectItem value={ApprovalRuleType.HYBRID}>
                    Hybrid - Percentage OR Specific
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(ruleType === ApprovalRuleType.PERCENTAGE ||
              ruleType === ApprovalRuleType.HYBRID) && (
              <div>
                <Label htmlFor="percentageThreshold">
                  Approval Percentage Threshold *
                </Label>
                <Input
                  id="percentageThreshold"
                  type="number"
                  min="1"
                  max="100"
                  {...register("percentageThreshold", {
                    min: 1,
                    max: 100,
                  })}
                  placeholder="60"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  e.g., 60 means 60% of approvers must approve
                </p>
              </div>
            )}

            {(ruleType === ApprovalRuleType.SPECIFIC_APPROVER ||
              ruleType === ApprovalRuleType.HYBRID) && (
              <div>
                <Label htmlFor="specificApproverId">Specific Approver</Label>
                <Select
                  value={watch("specificApproverId")}
                  onValueChange={(value) =>
                    setValue("specificApproverId", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select approver" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                id="requireManagerFirst"
                checked={watch("requireManagerFirst")}
                onCheckedChange={(checked) =>
                  setValue("requireManagerFirst", checked)
                }
              />
              <Label htmlFor="requireManagerFirst">
                Require manager approval first (if manager is approver)
              </Label>
            </div>

            {(ruleType === ApprovalRuleType.SEQUENTIAL ||
              ruleType === ApprovalRuleType.PERCENTAGE ||
              ruleType === ApprovalRuleType.HYBRID) && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Approval Steps</Label>
                  <Button type="button" onClick={addApprovalStep} size="sm">
                    Add Step
                  </Button>
                </div>

                {approvalSteps.map((step, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <Label>Step {step.sequence}</Label>
                      <Select
                        value={step.approverId}
                        onValueChange={(value) =>
                          updateApprovalStep(index, "approverId", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select approver" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name} ({user.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {ruleType === ApprovalRuleType.SEQUENTIAL && (
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={step.isRequired}
                          onCheckedChange={(checked) =>
                            updateApprovalStep(index, "isRequired", checked)
                          }
                        />
                        <Label className="text-sm">Required</Label>
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeApprovalStep(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={watch("isActive")}
                onCheckedChange={(checked) => setValue("isActive", checked)}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {initialData ? "Update Rule" : "Create Rule"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
