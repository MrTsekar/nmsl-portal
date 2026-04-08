import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin.api";
import { usersApi } from "@/lib/api/users.api";
import type { User, Appointment, Doctor } from "@/types";

export const useUsers = () =>
  useQuery<User[]>({
    queryKey: ["users"],
    queryFn: usersApi.list,
  });

export const useUser = (id: string) =>
  useQuery<User>({
    queryKey: ["user", id],
    queryFn: () => usersApi.getById(id),
  });

export const useAdminKpis = () =>
  useQuery<{
    totalUsers: number;
    appointmentsToday: number;
    utilization: string;
    pendingApprovals: number;
  }>({
    queryKey: ["admin-kpis"],
    queryFn: adminApi.getKpis,
  });

export const useAppointments = () =>
  useQuery<Appointment[]>({
    queryKey: ["appointments"],
    queryFn: adminApi.listAppointments,
    refetchInterval: 15000, // Auto-refresh every 15 seconds
    refetchIntervalInBackground: true, // Keep refreshing even when tab is not focused
    refetchOnWindowFocus: true, // Refresh when user returns to tab
    staleTime: 10000, // Consider data stale after 10 seconds
  });

export const useDoctors = (params?: { location?: string; specialty?: string }) =>
  useQuery<Doctor[]>({
    queryKey: ["doctors", params],
    queryFn: () => adminApi.listDoctors(params),
  });
