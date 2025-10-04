import { api } from "./api-client";
import type {
  User,
  CreateUserData,
  UpdateUserData,
  ChangeRoleData,
  AssignManagerData,
  UserListFilters,
} from "@/types/user";

export const userApi = {
  create: async (data: CreateUserData): Promise<User> => {
    const response = await api.post<User>("/users", data);
    return response.data;
  },

  list: async (filters?: UserListFilters): Promise<User[]> => {
    const response = await api.get<User[]>("/users", { params: filters });
    return response.data;
  },

  getById: async (id: string): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  update: async (id: string, data: UpdateUserData): Promise<User> => {
    const response = await api.patch<User>(`/users/${id}`, data);
    return response.data;
  },

  changeRole: async (id: string, data: ChangeRoleData): Promise<User> => {
    const response = await api.patch<User>(`/users/${id}/role`, data);
    return response.data;
  },

  assignManager: async (id: string, data: AssignManagerData): Promise<User> => {
    const response = await api.patch<User>(`/users/${id}/manager`, data);
    return response.data;
  },

  getEmployees: async (id: string): Promise<User[]> => {
    const response = await api.get<User[]>(`/users/${id}/employees`);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};
