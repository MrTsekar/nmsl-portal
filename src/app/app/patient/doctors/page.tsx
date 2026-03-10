import Link from "next/link";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { mockAppointments } from "@/lib/mocks/data";

export default function PatientDoctorsPage() {
  const consultedDoctors = Array.from(
    new Map(
      mockAppointments
        .filter((item) => item.status === "completed" || item.status === "confirmed")
        .map((item) => [
          item.doctorName,
          {
            id: item.id,
            name: item.doctorName,
            appointmentType: item.consultationType === "telehealth" ? "Telemedicine" : "Physical",
            lastVisit: item.date,
            status: item.status,
          },
        ]),
    ).values(),
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title="My Doctors" subtitle="Doctors you can collaborate with after consultation" />
      
      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {consultedDoctors.map((doctor) => (
          <Card key={doctor.id} className="shadow-md border-slate-200/50 dark:border-slate-800/50">
            <CardContent className="p-4">
              <h3 className="font-semibold text-base mb-3">{doctor.name}</h3>
              <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Service type</p>
                  <p className="font-medium">{doctor.appointmentType}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Last visit</p>
                  <p className="font-medium">{doctor.lastVisit}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <div className="mt-1">
                    <StatusBadge status={doctor.status} />
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-2 border-t border-border">
                <Button asChild variant="default" size="sm" className="flex-1">
                  <Link href={`/app/patient/doctors/${doctor.id}`}>View profile</Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="flex-1">
                  <Link href={`/app/chat/${doctor.id}`}>Chat</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <DataTable
          data={consultedDoctors}
          columns={[
            { key: "name", header: "Doctor" },
            { key: "appointmentType", header: "Last service type" },
            { key: "lastVisit", header: "Last visit" },
            { key: "status", header: "Latest appointment status" },
            {
              key: "action",
              header: "Action",
              render: (row) => (
                <div className="flex items-center gap-2">
                  <Link href={`/app/patient/doctors/${row.id}`} className="text-primary hover:underline">
                    View profile
                  </Link>
                  <Link href={`/app/chat/${row.id}`} className="text-primary hover:underline">
                    Chat
                  </Link>
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
