"use client";

import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";

export default function AdminAppointmentsPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Appointments"
        subtitle="Manage patient appointments"
      />

      <SectionCard title="Appointment Management">
        <div className="p-8 text-center text-slate-600 dark:text-slate-400">
          <p>Content coming soon...</p>
        </div>
      </SectionCard>
    </div>
  );
}
