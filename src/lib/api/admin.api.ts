import { apiClient } from "@/lib/api/client";
import { withMockFallback } from "@/lib/api/request";
import { mockHandlers } from "@/lib/mocks/handlers";
import type { User } from "@/types";

export const adminApi = {
  getKpis: async () => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.get("/admin/kpis");
        return data;
      },
      mock: () => mockHandlers.admin.kpis(),
    });
  },

  // Doctor Management
  listDoctors: async (params?: { location?: string; specialty?: string }) => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.get("/admin/doctors", { params });
        return data;
      },
      mock: () => mockHandlers.admin.listDoctors(params),
    });
  },

  createDoctor: async (payload: {
    name: string;
    email: string;
    password: string;
    location: string;
    state: string;
    address: string;
    phone: string;
    qualifications: string;
    specialty: string;
  }) => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.post("/admin/doctors", payload);
        return data;
      },
      mock: () => mockHandlers.admin.createDoctor(payload),
    });
  },

  // Admin Management (Super Admin only)
  listAdmins: async (): Promise<{ admins: User[]; total: number }> => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.get("/admin/admins");
        return data;
      },
      mock: () => mockHandlers.admin.listAdmins(),
    });
  },

  createAdmin: async (payload: {
    name: string;
    email: string;
    password: string;
    phone: string;
    location: string;
    state: string;
    address?: string;
  }): Promise<User> => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.post("/admin/admins", payload);
        return data;
      },
      mock: () => mockHandlers.admin.createAdmin(payload),
    });
  },

  toggleAdminStatus: async (id: string): Promise<{ success: boolean; isActive: boolean; message: string }> => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.patch(`/admin/admins/${id}/toggle-status`);
        return data;
      },
      mock: () => mockHandlers.admin.toggleAdminStatus(id),
    });
  },

  changeAdminPassword: async (id: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.patch(`/admin/admins/${id}/password`, { newPassword });
        return data;
      },
      mock: () => mockHandlers.admin.changeAdminPassword(id, newPassword),
    });
  },

  deleteAdmin: async (id: string): Promise<{ success: boolean; message: string }> => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.delete(`/admin/admins/${id}`);
        return data;
      },
      mock: () => mockHandlers.admin.deleteAdmin(id),
    });
  },

  // User Management
  listUsers: async (params?: { role?: string; location?: string }): Promise<User[]> => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.get("/admin/users", { params });
        return data;
      },
      mock: () => mockHandlers.admin.listUsers(params),
    });
  },

  toggleUserStatus: async (id: string): Promise<{ success: boolean; isActive: boolean; message: string }> => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.patch(`/admin/users/${id}/toggle-status`);
        return data;
      },
      mock: () => mockHandlers.admin.toggleUserStatus(id),
    });
  },
};
