import type { Role } from "@/types";
import {
  mockUsers,
  mockDoctors,
  mockServices,
  mockStatistics,
  mockAppointments,
  mockPartners,
  mockBoardMembers,
  mockContactInfo,
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
      let doctors = [...mockDoctors];
      
      if (params?.location) {
        doctors = doctors.filter((d) => d.location === params.location);
      }
      
      if (params?.specialty) {
        doctors = doctors.filter((d) => d.specialty === params.specialty);
      }
      
      return doctors;
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

    updateDoctorAvailability: async (doctorId: string, schedule: any) => {
      await delay();
      const index = mockDoctors.findIndex((d) => d.id === doctorId);
      if (index !== -1) {
        mockDoctors[index].availabilitySchedule = schedule;
      }
      return { success: true, doctor: mockDoctors[index] };
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

    resetUserPassword: async (id: string) => {
      await delay();
      const user = mockUsers.find((u) => u.id === id);
      return {
        success: true,
        message: `Password reset link sent to ${user?.email || "user"}`,
      };
    },

    updateUserEmail: async (id: string, email: string) => {
      await delay();
      const user = mockUsers.find((u) => u.id === id);
      if (user) {
        user.email = email;
      }
      return {
        success: true,
        message: "Email updated successfully",
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

    updateAppointmentStatus: async (id: string, status: "confirmed" | "rejected") => {
      await delay();
      const index = mockAppointments.findIndex((apt) => apt.id === id);
      if (index === -1) {
        throw new Error("Appointment not found");
      }

      mockAppointments[index] = {
        ...mockAppointments[index],
        status,
      };

      return { ...mockAppointments[index] };
    },

    rescheduleAppointment: async (
      id: string,
      payload: { date: string; time: string; doctorId: string; rescheduleReason?: string },
    ) => {
      await delay();
      const index = mockAppointments.findIndex((apt) => apt.id === id);
      if (index === -1) {
        throw new Error("Appointment not found");
      }

      // Find doctor name from doctorId
      const doctor = mockDoctors.find((d) => d.id === payload.doctorId);

      mockAppointments[index] = {
        ...mockAppointments[index],
        date: payload.date,
        time: payload.time,
        doctorName: doctor?.name ?? mockAppointments[index].doctorName,
        rescheduleReason: payload.rescheduleReason,
        status: "rescheduled",
      };

      return { ...mockAppointments[index] };
    },

    assignDoctor: async (id: string, doctorId: string, timeSlot: string) => {
      await delay();
      const index = mockAppointments.findIndex((apt) => apt.id === id);
      if (index === -1) {
        throw new Error("Appointment not found");
      }

      mockAppointments[index] = {
        ...mockAppointments[index],
        time: timeSlot,
        status: "confirmed",
      };

      return { ...mockAppointments[index] };
    },

    // Appointment Locking
    lockAppointment: async (id: string, officerEmail: string, isAdmin?: boolean) => {
      await delay();
      const index = mockAppointments.findIndex((apt) => apt.id === id);
      if (index === -1) {
        throw new Error("Appointment not found");
      }

      const appointment = mockAppointments[index];
      
      // Check if lock is stale (>30 minutes) and auto-clear it
      if (appointment.lockedBy && appointment.lockedAt) {
        const lockTime = new Date(appointment.lockedAt).getTime();
        const now = Date.now();
        const thirtyMinutes = 30 * 60 * 1000;
        if ((now - lockTime) > thirtyMinutes) {
          console.log("Auto-clearing stale lock");
          appointment.lockedBy = undefined;
          appointment.lockedAt = undefined;
        }
      }

      // Check if already locked by someone else
      // Admins can override any lock
      if (appointment.lockedBy && appointment.lockedBy !== officerEmail && !isAdmin) {
        throw new Error(`Appointment is already being processed by ${appointment.lockedBy}`);
      }

      // If admin is taking over, log it
      if (isAdmin && appointment.lockedBy && appointment.lockedBy !== officerEmail) {
        console.log(`Admin override: ${officerEmail} taking over from ${appointment.lockedBy}`);
      }

      mockAppointments[index] = {
        ...mockAppointments[index],
        lockedBy: officerEmail,
        lockedAt: new Date().toISOString(),
      };

      return { ...mockAppointments[index] };
    },

    unlockAppointment: async (id: string, officerEmail: string) => {
      await delay();
      const index = mockAppointments.findIndex((apt) => apt.id === id);
      if (index === -1) {
        throw new Error("Appointment not found");
      }

      // Only the officer who locked it can unlock (or force unlock in admin)
      if (mockAppointments[index].lockedBy !== officerEmail) {
        console.warn("Officer attempting to unlock appointment they didn't lock");
      }

      mockAppointments[index] = {
        ...mockAppointments[index],
        lockedBy: undefined,
        lockedAt: undefined,
      };

      return { ...mockAppointments[index] };
    },

    // Audit & Statistics
    getAuditLogs: async (params?: { startDate?: string; endDate?: string; officer?: string }) => {
      await delay();
      // Generate mock audit logs from appointments
      const logs = mockAppointments
        .filter((apt) => apt.status !== "pending" && apt.status !== "scheduled")
        .map((apt, idx) => {
          // Map status to action
          let action: any = apt.status;
          if (apt.status === "confirmed") action = "accepted";
          
          return {
            id: `audit-${apt.id}`,
            appointmentId: apt.id,
            patientName: apt.patientName,
            action,
            performedBy: apt.lockedBy || `officer${(idx % 3) + 1}@nmsl.com`,
            performedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            details: apt.rescheduleReason || (apt.status === "rejected" ? "Request does not meet criteria" : undefined),
          };
        });

      // Filter by officer if specified
      const filteredLogs = params?.officer 
        ? logs.filter(log => log.performedBy === params.officer)
        : logs;

      return { logs: filteredLogs, total: filteredLogs.length };
    },

    getOfficerStatistics: async (params?: { startDate?: string; endDate?: string }) => {
      await delay();
      
      // Generate mock statistics for 3 officers
      const officers = [
        { email: "officer1@nmsl.com", name: "Sarah Johnson" },
        { email: "officer2@nmsl.com", name: "Michael Chen" },
        { email: "officer3@nmsl.com", name: "Amina Okafor" },
      ];

      const statistics = officers.map((officer, idx) => {
        const base = 20 + idx * 5;
        return {
          officerEmail: officer.email,
          officerName: officer.name,
          totalProcessed: base + Math.floor(Math.random() * 10),
          accepted: Math.floor(base * 0.6),
          rejected: Math.floor(base * 0.17),
          rescheduled: Math.floor(base * 0.15),
          completed: Math.floor(base * 0.08),
          lastActive: new Date(Date.now() - Math.random() * 2 * 60 * 60 * 1000).toISOString(),
        };
      });

      return { statistics, total: statistics.length };
    },
  },
  
  partners: {
    list: async () => {
      await delay();
      return mockPartners.filter((p) => p.isActive).sort((a, b) => a.order - b.order);
    },
    
    listAll: async () => {
      await delay();
      return [...mockPartners].sort((a, b) => a.order - b.order);
    },
    
    create: async (payload: Omit<typeof mockPartners[0], "id" | "createdAt" | "updatedAt">) => {
      await delay();
      const newPartner = {
        id: `ptn-${Date.now()}`,
        ...payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockPartners.push(newPartner);
      return newPartner;
    },
    
    update: async (id: string, payload: Partial<Omit<typeof mockPartners[0], "id" | "createdAt" | "updatedAt">>) => {
      await delay();
      const index = mockPartners.findIndex((p) => p.id === id);
      if (index !== -1) {
        mockPartners[index] = {
          ...mockPartners[index],
          ...payload,
          updatedAt: new Date().toISOString(),
        };
        return mockPartners[index];
      }
      throw new Error("Partner not found");
    },
    
    delete: async (id: string) => {
      await delay();
      const index = mockPartners.findIndex((p) => p.id === id);
      if (index !== -1) {
        mockPartners.splice(index, 1);
      }
      return { success: true };
    },
    
    toggleActive: async (id: string) => {
      await delay();
      const index = mockPartners.findIndex((p) => p.id === id);
      if (index !== -1) {
        mockPartners[index].isActive = !mockPartners[index].isActive;
        mockPartners[index].updatedAt = new Date().toISOString();
        return mockPartners[index];
      }
      throw new Error("Partner not found");
    },
  },
  
  boardMembers: {
    list: async () => {
      await delay();
      return mockBoardMembers.filter((b) => b.isActive).sort((a, b) => a.order - b.order);
    },
    
    listAll: async () => {
      await delay();
      return [...mockBoardMembers].sort((a, b) => a.order - b.order);
    },
    
    create: async (payload: Omit<typeof mockBoardMembers[0], "id" | "createdAt" | "updatedAt">) => {
      await delay();
      const newMember = {
        id: `bm-${Date.now()}`,
        ...payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockBoardMembers.push(newMember);
      return newMember;
    },
    
    update: async (id: string, payload: Partial<Omit<typeof mockBoardMembers[0], "id" | "createdAt" | "updatedAt">>) => {
      await delay();
      const index = mockBoardMembers.findIndex((b) => b.id === id);
      if (index !== -1) {
        mockBoardMembers[index] = {
          ...mockBoardMembers[index],
          ...payload,
          updatedAt: new Date().toISOString(),
        };
        return mockBoardMembers[index];
      }
      throw new Error("Board member not found");
    },
    
    delete: async (id: string) => {
      await delay();
      const index = mockBoardMembers.findIndex((b) => b.id === id);
      if (index !== -1) {
        mockBoardMembers.splice(index, 1);
      }
      return { success: true };
    },
    
    toggleActive: async (id: string) => {
      await delay();
      const index = mockBoardMembers.findIndex((b) => b.id === id);
      if (index !== -1) {
        mockBoardMembers[index].isActive = !mockBoardMembers[index].isActive;
        mockBoardMembers[index].updatedAt = new Date().toISOString();
        return mockBoardMembers[index];
      }
      throw new Error("Board member not found");
    },
  },
  
  contact: {
    get: async () => {
      await delay();
      return { ...mockContactInfo };
    },
    
    update: async (payload: Partial<typeof mockContactInfo>) => {
      await delay();
      Object.assign(mockContactInfo, {
        ...payload,
        updatedAt: new Date().toISOString(),
      });
      return { ...mockContactInfo };
    },
  },
};
