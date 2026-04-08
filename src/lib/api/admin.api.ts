import { apiClient } from "@/lib/api/client";
import { withMockFallback } from "@/lib/api/request";
import { mockHandlers } from "@/lib/mocks/handlers";
import type { User, Appointment, DoctorAvailabilitySchedule } from "@/types";

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

  updateDoctorAvailability: async (doctorId: string, schedule: DoctorAvailabilitySchedule) => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.patch(`/admin/doctors/${doctorId}/availability`, schedule);
        return data;
      },
      mock: () => mockHandlers.admin.updateDoctorAvailability(doctorId, schedule),
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

  // Appointments
  listAppointments: async (): Promise<Appointment[]> => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.get("/admin/appointments");
        return data;
      },
      mock: () => mockHandlers.admin.listAppointments(),
    });
  },

  updateAppointmentStatus: async (
    id: string,
    status: "confirmed" | "rejected",
  ): Promise<Appointment> => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.patch(`/admin/appointments/${id}/status`, { status });
        return data;
      },
      mock: () => mockHandlers.admin.updateAppointmentStatus(id, status),
    });
  },

  rescheduleAppointment: async (
    id: string,
    payload: { date: string; time: string; doctorId: string; rescheduleReason?: string },
  ): Promise<Appointment> => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.patch(`/admin/appointments/${id}/reschedule`, payload);
        return data;
      },
      mock: () => mockHandlers.admin.rescheduleAppointment(id, payload),
    });
  },

  assignDoctor: async (
    id: string,
    doctorId: string,
    timeSlot: string,
  ): Promise<Appointment> => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.patch(`/admin/appointments/${id}/assign-doctor`, {
          doctorId,
          timeSlot,
        });
        return data;
      },
      mock: () => mockHandlers.admin.assignDoctor(id, doctorId, timeSlot),
    });
  },

  // Appointment Locking
  lockAppointment: async (id: string, officerEmail: string, isAdmin?: boolean): Promise<Appointment> => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.post(`/admin/appointments/${id}/lock`, { officerEmail, isAdmin });
        return data;
      },
      mock: () => mockHandlers.admin.lockAppointment(id, officerEmail, isAdmin),
    });
  },

  unlockAppointment: async (id: string, officerEmail: string): Promise<Appointment> => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.post(`/admin/appointments/${id}/unlock`, { officerEmail });
        return data;
      },
      mock: () => mockHandlers.admin.unlockAppointment(id, officerEmail),
    });
  },

  // Audit & Statistics
  getAuditLogs: async (params?: { startDate?: string; endDate?: string; officer?: string }) => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.get("/admin/audit/logs", { params });
        return data;
      },
      mock: () => mockHandlers.admin.getAuditLogs(params),
    });
  },

  getOfficerStatistics: async (params?: { startDate?: string; endDate?: string }) => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.get("/admin/audit/statistics", { params });
        return data;
      },
      mock: () => mockHandlers.admin.getOfficerStatistics(params),
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

  resetUserPassword: async (id: string): Promise<{ success: boolean; message: string }> => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.post(`/admin/users/${id}/reset-password`);
        return data;
      },
      mock: () => mockHandlers.admin.resetUserPassword(id),
    });
  },

  updateUserEmail: async (id: string, email: string): Promise<{ success: boolean; message: string }> => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.patch(`/admin/users/${id}/email`, { email });
        return data;
      },
      mock: () => mockHandlers.admin.updateUserEmail(id, email),
    });
  },
};
