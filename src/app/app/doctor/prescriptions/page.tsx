"use client";

import { useState, useMemo } from "react";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import { AddPrescriptionsDialog } from "@/components/doctor/add-prescriptions-dialog";
import { mockAppointments } from "@/lib/mocks/data";

export default function DoctorPrescriptionsPage() {
  const [prescriptionDialogOpen, setPrescriptionDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<{ id: string; name: string } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const prescriptions = mockAppointments.flatMap((appointment) =>
    (appointment.prescriptions ?? []).map((prescription) => ({
      id: prescription.id,
      patientName: appointment.patientName,
      patientId: appointment.patientId || appointment.id,
      drugName: prescription.drugName,
      dosage: prescription.dosage,
      frequency: prescription.frequency,
      duration: prescription.duration,
    })),
  );

  // Get unique patients who have appointments
  const patients = useMemo(() => {
    const uniquePatients = new Map();
    mockAppointments.forEach((appointment) => {
      if (!uniquePatients.has(appointment.patientName)) {
        uniquePatients.set(appointment.patientName, {
          id: appointment.patientId || appointment.id,
          name: appointment.patientName,
          lastVisit: appointment.date,
          prescriptionCount: prescriptions.filter(p => p.patientName === appointment.patientName).length,
        });
      }
    });
    return Array.from(uniquePatients.values());
  }, [prescriptions]);

  const handleAddPrescription = (patientId: string, patientName: string) => {
    setSelectedPatient({ id: patientId, name: patientName });
    setPrescriptionDialogOpen(true);
  };

  const handlePrescriptionSuccess = () => {
    setSuccessMessage(`Prescription(s) added successfully for ${selectedPatient?.name}`);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Prescriptions" subtitle="Create and review active medication orders" />
      
      {successMessage && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-lg">
          {successMessage}
        </div>
      )}

      <SectionCard title="Patients">
        <DataTable
          data={patients}
          columns={[
            { key: "name", header: "Patient" },
            { key: "lastVisit", header: "Last Visit" },
            { 
              key: "prescriptionCount", 
              header: "Active Prescriptions",
              render: (row) => <span>{row.prescriptionCount}</span>
            },
            {
              key: "action",
              header: "Action",
              render: (row) => (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleAddPrescription(row.id, row.name)}
                >
                  Add Prescription
                </Button>
              ),
            },
          ]}
        />
      </SectionCard>

      <SectionCard title="Recent prescriptions">
        {prescriptions.length === 0 ? (
          <p className="text-sm text-muted-foreground">Prescription list and refill requests with audit history.</p>
        ) : (
          <DataTable
            data={prescriptions}
            columns={[
              { key: "patientName", header: "Patient" },
              { key: "drugName", header: "Medication" },
              { key: "dosage", header: "Dosage" },
              { key: "frequency", header: "Frequency" },
              { key: "duration", header: "Duration" },
            ]}
          />
        )}
      </SectionCard>
      
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
