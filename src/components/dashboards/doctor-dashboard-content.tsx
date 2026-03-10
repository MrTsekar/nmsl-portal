"use client";

import { ClipboardList, ListChecks } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { useAppointments } from "@/hooks/use-app-data";
import { LoadState } from "@/components/shared/load-state";
import { ErrorState } from "@/components/shared/error-state";

export function DoctorDashboardContent() {
  const appointments = useAppointments();

  if (appointments.isLoading) return <LoadState />;
  if (appointments.isError) return <ErrorState />;

  const queue = appointments.data?.filter((item) => ["pending", "confirmed"].includes(item.status)) ?? [];

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
        <StatCard title="Today's queue" value={queue.length} icon={<ListChecks className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Pending notes" value={7} icon={<ClipboardList className="h-4 w-4 text-muted-foreground" />} />
      </div>
    </div>
  );
}
