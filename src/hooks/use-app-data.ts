import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin.api";
import { appointmentsApi } from "@/lib/api/appointments.api";
import { chatApi } from "@/lib/api/chat.api";
import { resultsApi } from "@/lib/api/results.api";
import { usersApi } from "@/lib/api/users.api";
import type {
  Appointment,
  ChatConversation,
  MedicalResult,
  Message,
  User,
} from "@/types";

export const useAppointments = (status?: string) =>
  useQuery<Appointment[]>({
    queryKey: ["appointments", status],
    queryFn: () => appointmentsApi.list(status === "all" ? undefined : status),
  });

export const useAppointment = (id: string) =>
  useQuery<Appointment>({
    queryKey: ["appointment", id],
    queryFn: () => appointmentsApi.getById(id),
  });

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

export const useConversations = () =>
  useQuery<ChatConversation[]>({
    queryKey: ["conversations"],
    queryFn: chatApi.conversations,
  });

export const useMessages = (conversationId: string) =>
  useQuery<Message[]>({
    queryKey: ["messages", conversationId],
    queryFn: () => chatApi.messages(conversationId),
    enabled: Boolean(conversationId),
  });

export const useResults = () =>
  useQuery<MedicalResult[]>({
    queryKey: ["results"],
    queryFn: resultsApi.list,
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
