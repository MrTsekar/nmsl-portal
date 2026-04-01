"use client";

import { CalendarCheck } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { SectionCard } from "@/components/shared/section-card";
import { useAdminKpis, useAppointments } from "@/hooks/use-app-data";
import { LoadState } from "@/components/shared/load-state";
import { ErrorState } from "@/components/shared/error-state";

export function AdminDashboardContent() {
  const kpis = useAdminKpis();
  const appointments = useAppointments();

  if (kpis.isLoading || appointments.isLoading) return <LoadState />;
  if (kpis.isError || appointments.isError) return <ErrorState />;

  const statusGroups = (appointments.data ?? []).reduce<Record<string, number>>((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:gap-4 grid-cols-2">
        <StatCard title="Appointments today" value={kpis.data?.appointmentsToday ?? 0} icon={<CalendarCheck className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Pending approvals" value={kpis.data?.pendingApprovals ?? 0} />
      </div>
      <SectionCard title="Appointments by status">
        <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {Object.entries(statusGroups).map(([status, value]) => (
            <div key={status} className="rounded-md border border-border p-2 sm:p-3">
              <p className="text-[10px] sm:text-xs uppercase text-muted-foreground truncate">{status}</p>
              <p className="text-lg sm:text-xl font-semibold">{value}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
