"use client";

import { useAuthStore } from "@/store/auth-store";
import { PageHeader } from "@/components/shared/page-header";
import { PatientDashboardContent } from "@/components/dashboards/patient-dashboard-content";
import { DoctorDashboardContent } from "@/components/dashboards/doctor-dashboard-content";
import { AdminDashboardContent } from "@/components/dashboards/admin-dashboard-content";

export default function OverviewPage() {
  const role = useAuthStore((state) => state.user?.role ?? "patient");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        subtitle="Role-aware clinical and operational summary"
      />
      {role === "patient" ? <PatientDashboardContent /> : null}
      {role === "doctor" ? <DoctorDashboardContent /> : null}
      {role === "admin" ? <AdminDashboardContent /> : null}
    </div>
  );
}
