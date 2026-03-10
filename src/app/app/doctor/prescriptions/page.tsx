"use client";

import { useState, useMemo } from "react";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title="Prescriptions" subtitle="Create and review active medication orders" />
      
      {successMessage && (
        <div className="p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-lg text-sm sm:text-base">
          {successMessage}
        </div>
      )}

      <SectionCard title="Patients">
        {/* Mobile Card Layout - Patients */}
        <div className="space-y-3 md:hidden">
          {patients.map((patient) => (
            <Card key={patient.id}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-base">{patient.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">Last visit: {patient.lastVisit}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Active Prescriptions</p>
                    <p className="text-lg font-semibold mt-1">{patient.prescriptionCount}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleAddPrescription(patient.id, patient.name)}
                  >
                    Add Prescription
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Desktop Table - Patients */}
        <div className="hidden md:block">
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
        </div>
      </SectionCard>

      <SectionCard title="Recent prescriptions">
        {prescriptions.length === 0 ? (
          <p className="text-sm text-muted-foreground">Prescription list and refill requests with audit history.</p>
        ) : (
          <>
            {/* Mobile Card Layout - Prescriptions */}
            <div className="space-y-3 lg:hidden">
              {prescriptions.map((prescription) => (
                <Card key={prescription.id}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-base">{prescription.drugName}</h3>
                        <p className="text-sm text-muted-foreground mt-1">Patient: {prescription.patientName}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Dosage</p>
                          <p className="text-sm font-medium mt-1">{prescription.dosage}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Frequency</p>
                          <p className="text-sm font-medium mt-1">{prescription.frequency}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Duration</p>
                        <p className="text-sm font-medium mt-1">{prescription.duration}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Desktop Table - Prescriptions */}
            <div className="hidden lg:block">
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
          </div>
          </>
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
