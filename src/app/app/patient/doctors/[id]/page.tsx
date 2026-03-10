import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockAppointments } from "@/lib/mocks/data";

export default async function PatientDoctorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const appointment = mockAppointments.find((item) => item.id === id);

  if (!appointment) {
    notFound();
  }

  const appointmentType = appointment.consultationType === "telehealth" ? "Telemedicine" : "Physical";

  return (
    <div className="space-y-6">
      <PageHeader title={appointment.doctorName} subtitle="Doctor profile and post-consultation collaboration" />

      <SectionCard title="Consultation summary">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Appointment ID</p>
            <p className="text-sm font-medium">{appointment.id}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Service type</p>
            <p className="text-sm font-medium">{appointmentType}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Date</p>
            <p className="text-sm font-medium">{appointment.date}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <Badge variant="secondary" className="capitalize">{appointment.status}</Badge>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Collaboration">
        <p className="text-sm text-muted-foreground">
          You can continue care communication with this doctor and review your previous appointment context.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button asChild>
            <Link href={`/app/chat/${appointment.id}`}>Open chat</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/app/appointments/${appointment.id}`}>View appointment details</Link>
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}
