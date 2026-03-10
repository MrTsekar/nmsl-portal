import { PageHeader } from "@/components/shared/page-header";
import { PatientDashboardContent } from "@/components/dashboards/patient-dashboard-content";

export default function PatientDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Patient Dashboard" subtitle="Your next visits, results, and care reminders" />
      <PatientDashboardContent />
    </div>
  );
}
