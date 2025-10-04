"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { userApi } from "@/lib/user-api";
import type { User } from "@/types/user";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const createUserSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be less than 100 characters"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(100, "Password must be less than 100 characters"),
    role: z.enum(["EMPLOYEE", "MANAGER", "ADMIN"]),
    managerId: z.string().optional(),
    isManagerApprover: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.role === "EMPLOYEE") {
        return !!data.managerId && data.managerId !== "none";
      }
      return true;
    },
    {
      message: "Employees must have a manager assigned",
      path: ["managerId"],
    }
  );

type CreateUserFormValues = z.infer<typeof createUserSchema>;

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  allUsers: User[];
}

export function CreateUserDialog({
  open,
  onOpenChange,
  onSuccess,
  allUsers,
}: CreateUserDialogProps) {
  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "EMPLOYEE",
      isManagerApprover: false,
    },
  });

  const selectedRole = form.watch("role");

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  useEffect(() => {
    if (selectedRole === "ADMIN") {
      form.setValue("managerId", undefined);
    }
    if (selectedRole === "EMPLOYEE") {
      const currentValue = form.getValues("managerId");
      if (!currentValue || currentValue === "none") {
        form.setValue("managerId", undefined);
      }
    }
    if (selectedRole !== "MANAGER") {
      form.setValue("isManagerApprover", false);
    }
  }, [selectedRole, form]);

  const onSubmit = async (data: CreateUserFormValues) => {
    try {
      await userApi.create({
        ...data,
        managerId: data.managerId === "none" ? undefined : data.managerId,
      });
      toast.success("User created successfully");
      form.reset();
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create user");
    }
  };

  const managers = allUsers.filter(
    (u) => u.role === "MANAGER" || u.role === "ADMIN"
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Add a new employee or manager to your organization
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={form.formState.isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      disabled={form.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      disabled={form.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={form.formState.isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="EMPLOYEE">Employee</SelectItem>
                      <SelectItem value="MANAGER">Manager</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedRole !== "ADMIN" && (
              <FormField
                control={form.control}
                name="managerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Manager{" "}
                      {selectedRole === "EMPLOYEE" && (
                        <span className="text-destructive">*</span>
                      )}
                      {selectedRole === "MANAGER" && " (Optional)"}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={
                        field.value ||
                        (selectedRole === "MANAGER" ? "none" : "")
                      }
                      disabled={form.formState.isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a manager" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {selectedRole === "MANAGER" && (
                          <SelectItem value="none">No manager</SelectItem>
                        )}
                        {managers.length === 0 ? (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">
                            No managers available
                          </div>
                        ) : (
                          managers.map((manager) => (
                            <SelectItem key={manager.id} value={manager.id}>
                              {manager.name} ({manager.role})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {selectedRole === "MANAGER" && (
              <FormField
                control={form.control}
                name="isManagerApprover"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={form.formState.isSubmitting}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0 font-normal">
                      Can approve expenses
                    </FormLabel>
                  </FormItem>
                )}
              />
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  onOpenChange(false);
                }}
                disabled={form.formState.isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="flex-1"
              >
                {form.formState.isSubmitting ? "Creating..." : "Create User"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
