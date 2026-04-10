import { apiClient } from "@/lib/api/client";
import type { User, Appointment, DoctorAvailabilitySchedule } from "@/types";

export const adminApi = {
  getKpis: async () => {
    const { data } = await apiClient.get("/admin/kpis");
    return data;
  },

  listDoctors: async (params?: { location?: string; specialty?: string }) => {
    const { data } = await apiClient.get("/admin/doctors", { params });
    return Array.isArray(data) ? data : [];
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
    const { data } = await apiClient.post("/admin/doctors", payload);
    return data;
  },

  updateDoctorAvailability: async (doctorId: string, schedule: DoctorAvailabilitySchedule) => {
    const { data } = await apiClient.patch(`/admin/doctors/${doctorId}/availability`, schedule);
    return data;
  },

  listAdmins: async (): Promise<{ admins: User[]; total: number }> => {
    const { data } = await apiClient.get("/admin/admins");
    return data ?? { admins: [], total: 0 };
  },

  createAdmin: async (payload: {
    name: string;
    email: string;
    password: string;
    phone: string;
    location: string;
    state: string;
    address?: string;
    role?: "admin" | "appointment_officer";
  }): Promise<User> => {
    const { data } = await apiClient.post("/admin/admins", payload);
    return data;
  },

  toggleAdminStatus: async (id: string): Promise<{ success: boolean; isActive: boolean; message: string }> => {
    const { data } = await apiClient.patch(`/admin/admins/${id}/toggle-status`);
    return data;
  },

  changeAdminPassword: async (id: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    const { data } = await apiClient.patch(`/admin/admins/${id}/password`, { newPassword });
    return data;
  },

  deleteAdmin: async (id: string): Promise<{ success: boolean; message: string }> => {
    const { data } = await apiClient.delete(`/admin/admins/${id}`);
    return data;
  },

  listAppointments: async (): Promise<Appointment[]> => {
    const { data } = await apiClient.get("/admin/appointments");
    return Array.isArray(data) ? data : [];
  },

  updateAppointmentStatus: async (id: string, status: "confirmed" | "rejected"): Promise<Appointment> => {
    const { data } = await apiClient.patch(`/admin/appointments/${id}/status`, { status });
    return data;
  },

  rescheduleAppointment: async (id: string, payload: { date: string; time: string; doctorId: string; rescheduleReason?: string }): Promise<Appointment> => {
    const { data } = await apiClient.patch(`/admin/appointments/${id}/reschedule`, payload);
    return data;
  },

  assignDoctor: async (id: string, doctorId: string, timeSlot: string): Promise<Appointment> => {
    const { data } = await apiClient.patch(`/admin/appointments/${id}/assign-doctor`, { doctorId, timeSlot });
    return data;
  },

  lockAppointment: async (id: string, officerEmail: string, isAdmin?: boolean): Promise<Appointment> => {
    const { data } = await apiClient.post(`/admin/appointments/${id}/lock`, { officerEmail, isAdmin });
    return data;
  },

  unlockAppointment: async (id: string, officerEmail: string): Promise<Appointment> => {
    const { data } = await apiClient.post(`/admin/appointments/${id}/unlock`, { officerEmail });
    return data;
  },

  getAuditLogs: async (params?: { startDate?: string; endDate?: string; officer?: string }) => {
    try {
      const { data } = await apiClient.get("/admin/audit/logs", { params });
      return data ?? { logs: [], total: 0 };
    } catch {
      return { logs: [], total: 0 };
    }
  },

  getOfficerStatistics: async (params?: { startDate?: string; endDate?: string }) => {
    try {
      const { data } = await apiClient.get("/admin/audit/statistics", { params });
      return data ?? { statistics: [] };
    } catch {
      return { statistics: [] };
    }
  },

  listUsers: async (params?: { role?: string; location?: string }): Promise<User[]> => {
    const { data } = await apiClient.get("/admin/users", { params });
    return Array.isArray(data) ? data : [];
  },

  toggleUserStatus: async (id: string): Promise<{ success: boolean; isActive: boolean; message: string }> => {
    const { data } = await apiClient.patch(`/admin/users/${id}/toggle-status`);
    return data;
  },

  resetUserPassword: async (id: string): Promise<{ success: boolean; message: string }> => {
    const { data } = await apiClient.post(`/admin/users/${id}/reset-password`);
    return data;
  },

  updateUserEmail: async (id: string, email: string): Promise<{ success: boolean; message: string }> => {
    const { data } = await apiClient.patch(`/admin/users/${id}/email`, { email });
    return data;
  },
};
