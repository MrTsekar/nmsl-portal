import { apiClient } from "@/lib/api/client";
import { withMockFallback } from "@/lib/api/request";
import { mockHandlers } from "@/lib/mocks/handlers";
import type { DoctorAvailability } from "@/types";

export const doctorsApi = {
  /**
   * Get doctor availability by doctor ID
   */
  getAvailability: async (doctorId: string): Promise<DoctorAvailability> => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.get(`/doctors/${doctorId}/availability`);
        return data;
      },
      mock: () => mockHandlers.doctors.getAvailability(doctorId),
    });
  },

  /**
   * Get doctor availability by doctor name (for when we only have the doctor's name)
   */
  getAvailabilityByName: async (doctorName: string): Promise<DoctorAvailability> => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.get(`/doctors/availability?name=${encodeURIComponent(doctorName)}`);
        return data;
      },
      mock: () => mockHandlers.doctors.getAvailabilityByName(doctorName),
    });
  },

  /**
   * Check if a specific time slot is available for a doctor
   */
  checkAvailability: async (doctorId: string, date: string, time: string): Promise<{ available: boolean }> => {
    return withMockFallback({
      live: async () => {
        const { data } = await apiClient.post(`/doctors/${doctorId}/availability/check`, { date, time });
        return data;
      },
      mock: () => mockHandlers.doctors.checkAvailability(doctorId, date, time),
    });
  },
};
