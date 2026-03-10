"use client";

import { useState } from "react";
import Link from "next/link";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AddPrescriptionsDialog } from "@/components/doctor/add-prescriptions-dialog";
import { mockAppointments } from "@/lib/mocks/data";

const patients = mockAppointments.map((item) => ({
  id: item.id,
  patientId: item.patientId || item.id,
  name: item.patientName,
  condition: item.reason,
  lastVisit: item.date,
  status: item.status,
}));

export default function DoctorPatientsPage() {
  const [prescriptionDialogOpen, setPrescriptionDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<{ id: string; name: string } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAddPrescription = (patientId: string, patientName: string) => {
    setSelectedPatient({ id: patientId, name: patientName });
    setPrescriptionDialogOpen(true);
  };

  const handlePrescriptionSuccess = () => {
    setSuccessMessage(`Prescription(s) added successfully for ${selectedPatient?.name}`);
    setTimeout(() => setSuccessMessage(null), 5000);
  };
  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title="Patients" subtitle="Longitudinal panel and active follow-up list" />
      
      {successMessage && (
        <div className="p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-lg text-sm">
          {successMessage}
        </div>
      )}
      
      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {patients.map((patient) => (
          <Card key={patient.id} className="shadow-md border-slate-200/50 dark:border-slate-800/50">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-base">{patient.name}</h3>
                <StatusBadge status={patient.status} />
              </div>
              
              <div className="space-y-2 mb-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Primary Condition</p>
                  <p className="font-medium">{patient.condition}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Last Visit</p>
                  <p className="font-medium">{patient.lastVisit}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-3 border-t border-border">
                <Button asChild variant="default" size="sm" className="w-full">
                  <Link href={`/app/appointments/${patient.id}`}>Open chart</Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full"
                  onClick={() => handleAddPrescription(patient.patientId, patient.name)}
                >
                  Add Prescription
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <DataTable
          data={patients}
          columns={[
            { key: "name", header: "Name" },
            { key: "condition", header: "Primary Condition" },
            { key: "lastVisit", header: "Last Visit" },
            { key: "status", header: "Appointment status", render: (row) => <StatusBadge status={row.status} /> },
            {
              key: "action",
              header: "Action",
              render: (row) => (
                <div className="flex items-center gap-2">
                  <Link href={`/app/appointments/${row.id}`} className="text-primary hover:underline">
                    Open chart
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleAddPrescription(row.patientId, row.name)}
                  >
                    Add Prescription
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </div>
      
      {selectedPatient && (
        <AddPrescriptionsDialog
          open={prescriptionDialogOpen}
          onOpenChange={setPrescriptionDialogOpen}
          patientName={selectedPatient.name}
          patientId={selectedPatient.id}
          onSuccess={handlePrescriptionSuccess}
        />
      )}
    </div>
  );
}
