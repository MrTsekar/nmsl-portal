import type { Role } from "@/types";
import {
  mockAppointments,
  mockConversations,
  mockMessages,
  mockResults,
  mockUsers,
  mockDoctorAvailability,
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
  appointments: {
    list: async (status?: string) => {
      await delay();
      return status ? mockAppointments.filter((item) => item.status === status) : mockAppointments;
    },
    get: async (id: string) => {
      await delay();
      return mockAppointments.find((item) => item.id === id) ?? mockAppointments[0];
    },
    reschedule: async (id: string, payload: { date: string; time: string; reason?: string }) => {
      await delay();
      return {
        success: true,
        appointment: {
          ...mockAppointments.find((item) => item.id === id),
          date: payload.date,
          time: payload.time,
          status: "rescheduled" as const,
          notes: payload.reason ? `Rescheduled: ${payload.reason}` : "Appointment rescheduled",
        },
      };
    },
  },
  chat: {
    conversations: async () => {
      await delay();
      return mockConversations;
    },
    messages: async (conversationId: string) => {
      await delay();
      return mockMessages.filter((item) => item.conversationId === conversationId);
    },
  },
  results: {
    list: async () => {
      await delay();
      return mockResults;
    },
    get: async (id: string) => {
      await delay();
      return mockResults.find((item) => item.id === id) ?? mockResults[0];
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
        },
      };
    },
  },
  doctors: {
    getAvailability: async (doctorId: string) => {
      await delay();
      return mockDoctorAvailability.find((item) => item.doctorId === doctorId) ?? mockDoctorAvailability[0];
    },
    getAvailabilityByName: async (doctorName: string) => {
      await delay();
      return mockDoctorAvailability.find((item) => item.doctorName === doctorName) ?? mockDoctorAvailability[0];
    },
    checkAvailability: async (doctorId: string, date: string, time: string) => {
      await delay();
      const doctorSchedule = mockDoctorAvailability.find((item) => item.doctorId === doctorId);
      if (!doctorSchedule) {
        return { available: false };
      }

      // Check if the date is an available day
      const dayOfWeek = new Date(date).toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
      if (!doctorSchedule.availableDays.includes(dayOfWeek as any)) {
        return { available: false };
      }

      // Check if the time slot exists
      const hasTimeSlot = doctorSchedule.timeSlots.some(
        (slot) => slot.start === time
      );
      if (!hasTimeSlot) {
        return { available: false };
      }

      // Check if the slot is already booked
      const isBooked = doctorSchedule.bookedSlots.some(
        (slot) => slot.date === date && slot.time === time
      );

      return { available: !isBooked };
    },
  },
};
