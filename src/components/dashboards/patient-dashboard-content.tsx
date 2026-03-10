"use client";

import { BellRing, CalendarDays, FileHeart } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { useAppointments, useResults } from "@/hooks/use-app-data";
import { LoadState } from "@/components/shared/load-state";
import { ErrorState } from "@/components/shared/error-state";

export function PatientDashboardContent() {
  const appointments = useAppointments();
  const results = useResults();

  if (appointments.isLoading || results.isLoading) return <LoadState />;
  if (appointments.isError || results.isError) return <ErrorState />;

  const upcoming = appointments.data?.filter((item) => item.status === "confirmed") ?? [];
  const recentResults = results.data?.slice(0, 3) ?? [];

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        <StatCard title="Upcoming appointments" value={upcoming.length} icon={<CalendarDays className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Recent results" value={recentResults.length} icon={<FileHeart className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Reminders" value={3} hint="2 medication, 1 fasting prep" icon={<BellRing className="h-4 w-4 text-muted-foreground" />} />
      </div>
      <SectionCard title="Upcoming appointments">
        <div className="space-y-2">
          {upcoming.slice(0, 4).map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-md border border-border p-2.5 sm:p-3 gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium truncate">{item.doctorName}</p>
                <p className="text-[11px] sm:text-xs text-muted-foreground">{item.date} · {item.time}</p>
              </div>
              <StatusBadge status={item.status} />
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
