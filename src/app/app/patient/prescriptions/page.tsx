"use client";

import { useMemo } from "react";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadState } from "@/components/shared/load-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAppointments } from "@/hooks/use-app-data";

export default function PatientPrescriptionsPage() {
  const query = useAppointments();

  const prescriptions = useMemo(() => {
    if (!query.data) return [];
    
    return query.data
      .filter((appointment) => appointment.prescriptions && appointment.prescriptions.length > 0)
      .flatMap((appointment) =>
        appointment.prescriptions!.map((prescription) => ({
          id: prescription.id,
          appointmentId: appointment.id,
          drugName: prescription.drugName,
          dosage: prescription.dosage,
          frequency: prescription.frequency,
          duration: prescription.duration,
          instructions: prescription.instructions,
          doctorName: appointment.doctorName,
          date: appointment.date,
          status: appointment.status,
        }))
      );
  }, [query.data]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader 
        title="My Prescriptions" 
        subtitle="View all medications prescribed by your doctors"
      />

      {query.isLoading ? <LoadState /> : null}
      {query.isError ? <ErrorState /> : null}
      {query.isSuccess && prescriptions.length === 0 ? (
        <EmptyState 
          title="No prescriptions yet" 
          description="Your medication prescriptions will appear here after consultations." 
        />
      ) : null}
      
      {prescriptions.length > 0 ? (
        <>
          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {prescriptions.map((prescription) => {
              const isActive = prescription.status === "completed" || prescription.status === "confirmed";
              return (
                <Card key={prescription.id} className="shadow-md border-slate-200/50 dark:border-slate-800/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-base">{prescription.drugName}</h3>
                      <Badge variant={isActive ? "success" : "secondary"}>
                        {isActive ? "Active" : "Pending"}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Dosage</p>
                          <p className="font-medium">{prescription.dosage}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Frequency</p>
                          <p className="font-medium">{prescription.frequency}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Duration</p>
                          <p className="font-medium">{prescription.duration}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Date</p>
                          <p className="font-medium">{prescription.date}</p>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-border">
                        <p className="text-xs text-muted-foreground">Prescribed by</p>
                        <p className="font-medium">{prescription.doctorName}</p>
                      </div>
                      {prescription.instructions && (
                        <div className="pt-2 border-t border-border">
                          <p className="text-xs text-muted-foreground">Instructions</p>
                          <p className="text-sm">{prescription.instructions}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <DataTable
              data={prescriptions}
              columns={[
                { key: "drugName", header: "Medication" },
                { key: "dosage", header: "Dosage" },
                { key: "frequency", header: "Frequency" },
                { key: "duration", header: "Duration" },
                { key: "doctorName", header: "Prescribed By" },
                { key: "date", header: "Date" },
                {
                  key: "status",
                  header: "Status",
                  render: (row) => {
                    const isActive = row.status === "completed" || row.status === "confirmed";
                    return (
                      <Badge variant={isActive ? "success" : "secondary"}>
                        {isActive ? "Active" : "Pending"}
                      </Badge>
                    );
                  },
                },
                {
                  key: "instructions",
                  header: "Instructions",
                  render: (row) => (
                    <span className="text-sm text-muted-foreground">
                      {row.instructions || "Take as directed"}
                    </span>
                  ),
                },
              ]}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
