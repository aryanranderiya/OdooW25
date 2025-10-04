"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { AuthGuard } from "@/components/auth-guard";
import { userApi } from "@/lib/user-api";
import type { User } from "@/types/user";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CreateUserDialog } from "@/components/users/create-user-dialog";
import { EditUserDialog } from "@/components/users/edit-user-dialog";
import { DeleteUserDialog } from "@/components/users/delete-user-dialog";
import { UserManagementHeader } from "@/components/users/user-management-header";
import { UsersCard } from "@/components/users/users-card";
import { UserFilters } from "@/components/users/user-filters";
import { UserTable } from "@/components/users/user-table";
import { ROUTES } from "@/lib/constants";

function UserManagementContent() {
  const { user: currentUser, company, logout } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  useEffect(() => {
    if (currentUser?.role !== "ADMIN") {
      router.push(ROUTES.DASHBOARD);
      toast.error("Access denied. Admin only.");
    }
  }, [currentUser, router]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await userApi.list();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error: any) {
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === "ADMIN") {
      fetchUsers();
    }
  }, [currentUser]);

  useEffect(() => {
    let result = users;

    if (roleFilter !== "all") {
      result = result.filter((u) => u.role === roleFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query)
      );
    }

    setFilteredUsers(result);
  }, [users, searchQuery, roleFilter]);

  const handleUserCreated = () => {
    fetchUsers();
    setIsCreateDialogOpen(false);
  };

  const handleUserUpdated = () => {
    fetchUsers();
    setEditingUser(null);
  };

  const handleUserDeleted = () => {
    fetchUsers();
    setDeletingUser(null);
  };

  const handleDeleteAttempt = (user: User) => {
    if (user.id === currentUser?.id) {
      toast.error("You cannot delete your own account");
      return;
    }
    setDeletingUser(user);
  };

  if (currentUser?.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <main className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage employees, managers, and their relationships
          </p>
        </div>

        <UsersCard
          userCount={filteredUsers.length}
          companyName={company?.name}
          onAddUser={() => setIsCreateDialogOpen(true)}
        >
          <UserFilters
            searchQuery={searchQuery}
            roleFilter={roleFilter}
            onSearchChange={setSearchQuery}
            onRoleFilterChange={setRoleFilter}
          />
          <UserTable
            users={filteredUsers}
            currentUserId={currentUser?.id}
            isLoading={isLoading}
            onEdit={setEditingUser}
            onDelete={handleDeleteAttempt}
          />
        </UsersCard>
      </main>

      <CreateUserDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleUserCreated}
        allUsers={users}
      />

      {editingUser && (
        <EditUserDialog
          open={!!editingUser}
          onOpenChange={(open: boolean) => !open && setEditingUser(null)}
          user={editingUser}
          onSuccess={handleUserUpdated}
          allUsers={users}
        />
      )}

      {deletingUser && (
        <DeleteUserDialog
          open={!!deletingUser}
          onOpenChange={(open: boolean) => !open && setDeletingUser(null)}
          user={deletingUser}
          onSuccess={handleUserDeleted}
        />
      )}
    </div>
  );
}

export default function UserManagementPage() {
  return (
    <AuthGuard>
      <UserManagementContent />
    </AuthGuard>
  );
}
