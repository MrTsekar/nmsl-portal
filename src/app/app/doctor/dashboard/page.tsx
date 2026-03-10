import { PageHeader } from "@/components/shared/page-header";
import { DoctorDashboardContent } from "@/components/dashboards/doctor-dashboard-content";

export default function DoctorDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Doctor Dashboard" subtitle="Today's queue, documentation, and operational shortcuts" />
      <DoctorDashboardContent />
    </div>
  );
}
