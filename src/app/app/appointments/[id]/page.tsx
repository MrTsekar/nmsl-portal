"use client";

import { use } from "react";
import { AppointmentTimeline } from "@/components/shared/appointment-timeline";
import { ErrorState } from "@/components/shared/error-state";
import { LoadState } from "@/components/shared/load-state";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { useAppointment } from "@/hooks/use-app-data";

export default function AppointmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const query = useAppointment(id);

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title={`Appointment ${id}`} subtitle="Detailed workflow and context" />
      {query.isLoading ? <LoadState /> : null}
      {query.isError ? <ErrorState /> : null}
      {query.data ? (
        <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
          <SectionCard title="Summary">
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">Patient name</p>
                <p className="font-medium">{query.data.patientName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Patient ID</p>
                <p className="font-medium">{query.data.patientId ?? "Not available"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Doctor</p>
                <p className="font-medium">{query.data.doctorName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Consultation type</p>
                <p className="font-medium capitalize">{query.data.consultationType ?? "in-person"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="font-medium">{query.data.date}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Time</p>
                <p className="font-medium">{query.data.time}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="font-medium">{query.data.durationMinutes ?? 0} minutes</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="font-medium">{query.data.location}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-muted-foreground">Reason</p>
                <p className="font-medium">{query.data.reason}</p>
              </div>
              {query.data.patientNotes && (
                <div className="sm:col-span-2">
                  <p className="text-xs text-muted-foreground">Patient notes</p>
                  <p className="font-medium">{query.data.patientNotes}</p>
                </div>
              )}
              <div className="sm:col-span-2">
                <p className="text-xs text-muted-foreground">Clinical notes</p>
                <p className="font-medium">{query.data.notes ?? "No notes available."}</p>
              </div>
            </div>
          </SectionCard>
          <SectionCard title="Timeline">
            <AppointmentTimeline appointment={query.data} />
          </SectionCard>

          <SectionCard title="Prescription">
            {query.data.prescriptions?.length ? (
              <div className="space-y-2.5 sm:space-y-3">
                {query.data.prescriptions.map((prescription) => (
                  <div key={prescription.id} className="rounded-md border border-border p-3 sm:p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold">{prescription.drugName}</p>
                    </div>
                    <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
                      <p><span className="text-muted-foreground">Dosage:</span> {prescription.dosage}</p>
                      <p><span className="text-muted-foreground">Frequency:</span> {prescription.frequency}</p>
                      <p><span className="text-muted-foreground">Duration:</span> {prescription.duration}</p>
                    </div>
                    {prescription.instructions ? (
                      <p className="mt-2 text-sm text-muted-foreground">{prescription.instructions}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No medication was prescribed for this appointment.
              </p>
            )}
          </SectionCard>
        </div>
      ) : null}
    </div>
  );
}
