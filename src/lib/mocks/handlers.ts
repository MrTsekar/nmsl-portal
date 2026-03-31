import type { Role } from "@/types";
import {
  mockUsers,
  mockServices,
  mockStatistics,
  mockAppointments,
} from "@/lib/mocks/data";

const delay = async (ms = 320) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockHandlers = {
  auth: {
    signIn: async (email: string) => {
      await delay();
      const user = mockUsers.find((item) => item.email === email) ?? mockUsers[0];
      return { token: "mock-token", user };
    },
    signUp: async () => {
      await delay();
      return { success: true };
    },
    forgotPassword: async () => {
      await delay();
      return { success: true };
    },
    resetPassword: async () => {
      await delay();
      return { success: true };
    },
  },
  users: {
    list: async () => {
      await delay();
      return mockUsers;
    },
    get: async (id: string) => {
      await delay();
      return mockUsers.find((user) => user.id === id) ?? mockUsers[0];
    },
  },
  admin: {
    kpis: async () => {
      await delay();
      return {
        totalUsers: 2480,
        appointmentsToday: 132,
        utilization: "86%",
        pendingApprovals: 19,
      };
    },
    
    // Doctor Management
    listDoctors: async (params?: { location?: string; specialty?: string }) => {
      await delay();
      // Doctors are separate from admin users - return empty for now
      return [];
    },
    
    createDoctor: async (payload: any) => {
      await delay();
      return {
        success: true,
        user: {
          id: `d-${Date.now()}`,
          name: payload.name,
          email: payload.email,
          role: "doctor" as const,
          location: payload.location,
          state: payload.state,
          address: payload.address,
          phone: payload.phone,
          qualifications: payload.qualifications,
          specialty: payload.specialty,
        },
      };
    },
    
    // Admin Management
    listAdmins: async () => {
      await delay();
      const admins = mockUsers.filter((u) => u.role === "admin");
      return { admins, total: admins.length };
    },
    
    createAdmin: async (payload: any) => {
      await delay();
      const newAdmin = {
        id: `adm-${Date.now()}`,
        name: payload.name,
        email: payload.email,
        role: "admin" as const,
        location: payload.location,
        state: payload.state,
        address: payload.address || "",
        phone: payload.phone,
      };
      return newAdmin;
    },
    
    toggleAdminStatus: async (id: string) => {
      await delay();
      const admin = mockUsers.find((u) => u.id === id);
      const newStatus = !admin; // Simplified toggle logic
      return {
        success: true,
        isActive: newStatus,
        message: newStatus ? "Admin activated successfully" : "Admin deactivated successfully",
      };
    },
    
    changeAdminPassword: async (id: string, newPassword: string) => {
      await delay();
      return {
        success: true,
        message: "Password updated successfully",
      };
    },
    
    deleteAdmin: async (id: string) => {
      await delay();
      return {
        success: true,
        message: "Admin removed successfully",
      };
    },
    
    // User Management
    listUsers: async (params?: { role?: string; location?: string }) => {
      await delay();
      let users = [...mockUsers];
      if (params?.role) {
        users = users.filter((u) => u.role === params.role);
      }
      if (params?.location) {
        users = users.filter((u) => u.location === params.location);
      }
      return users;
    },
    
    toggleUserStatus: async (id: string) => {
      await delay();
      const user = mockUsers.find((u) => u.id === id);
      const newStatus = !user; // Simplified toggle logic
      return {
        success: true,
        isActive: newStatus,
        message: newStatus ? "User activated successfully" : "User deactivated successfully",
      };
    },
    
    // Services Management
    listServices: async () => {
      await delay();
      return [...mockServices];
    },
    
    createService: async (payload: any) => {
      await delay();
      const svc = { ...payload, id: `svc-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      mockServices.push(svc);
      return svc;
    },
    
    updateService: async (id: string, payload: any) => {
      await delay();
      const index = mockServices.findIndex((s) => s.id === id);
      if (index !== -1) {
        mockServices[index] = { ...mockServices[index], ...payload, updatedAt: new Date().toISOString() };
        return mockServices[index];
      }
      throw new Error("Service not found");
    },
    
    deleteService: async (id: string) => {
      await delay();
      const index = mockServices.findIndex((s) => s.id === id);
      if (index !== -1) mockServices.splice(index, 1);
      return { success: true };
    },
    
    // Statistics Management
    listStatistics: async () => {
      await delay();
      return [...mockStatistics];
    },
    
    updateStatistics: async (stats: typeof mockStatistics) => {
      await delay();
      mockStatistics.splice(0, mockStatistics.length, ...stats.map((s) => ({ ...s })));
      return [...mockStatistics];
    },
    
    // Appointments
    listAppointments: async () => {
      await delay();
      return [...mockAppointments];
    },
  },
};
