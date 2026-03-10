"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarPlus } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { ErrorState } from "@/components/shared/error-state";
import { FilterBar } from "@/components/shared/filter-bar";
import { LoadState } from "@/components/shared/load-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { RescheduleAppointmentDialog } from "@/components/shared/reschedule-appointment-dialog";
import { DoctorAppointmentActionsDialog } from "@/components/shared/doctor-appointment-actions-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAppointments } from "@/hooks/use-app-data";
import { mockUsers, mockDoctorAvailability } from "@/lib/mocks/data";
import { doctorsApi } from "@/lib/api/doctors.api";
import { useAuthStore } from "@/store/auth-store";
import type { Appointment, AppointmentStatus, MedicalSpecialty } from "@/types";

export default function AppointmentsPage() {
  const user = useAuthStore((state) => state.user);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [open, setOpen] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState<MedicalSpecialty | "none">("none");
  const [preferredDoctor, setPreferredDoctor] = useState("none");
  const [appointmentType, setAppointmentType] = useState<"in-person" | "telehealth">("in-person");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [reason, setReason] = useState("");
  const [patientNotes, setPatientNotes] = useState("");

  const [localStatusMap, setLocalStatusMap] = useState<Record<string, AppointmentStatus>>({});
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [doctorActionsDialogOpen, setDoctorActionsDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const query = useAppointments(status);
  const doctors = useMemo(() => mockUsers.filter((item) => item.role === "doctor"), []);

  // Filter doctors by selected specialty
  const filteredDoctors = useMemo(() => {
    if (selectedSpecialty === "none") return doctors;
    return doctors.filter((doctor) => doctor.specialty === selectedSpecialty);
  }, [doctors, selectedSpecialty]);

  // Medical specialties for the selection dropdown
  const specialties: MedicalSpecialty[] = [
    "General Practice",
    "Gynecology",
    "Physiotherapy",
    "Pediatrics",
    "Cardiology",
    "Dermatology",
    "Orthopedics",
    "Psychiatry",
    "Radiology",
    "Surgery",
  ];

  const rowsWithLocalStatus = useMemo(
    () =>
      (query.data ?? []).map((item) => ({
        ...item,
        status: localStatusMap[item.id] ?? item.status,
      })),
    [localStatusMap, query.data],
  );

  const rows = useMemo(
    () =>
      rowsWithLocalStatus.filter(
        (item) =>
          item.patientName.toLowerCase().includes(search.toLowerCase()) ||
          item.doctorName.toLowerCase().includes(search.toLowerCase()) ||
          item.id.toLowerCase().includes(search.toLowerCase()),
      ),
    [rowsWithLocalStatus, search],
  );

  const onCreateRequest = async () => {
    if (!preferredDate || !preferredTime) return;

    let assignedDoctor = preferredDoctor;

    // Auto-assign doctor if "No preference" selected
    if (preferredDoctor === "none" && selectedSpecialty !== "none") {
      // Find doctors with the selected specialty
      const specialtyDoctors = doctors.filter((doc) => doc.specialty === selectedSpecialty);
      
      if (specialtyDoctors.length > 0) {
        // Check availability for each doctor and assign the first available one
        for (const doctor of specialtyDoctors) {
          try {
            const availability = mockDoctorAvailability.find((a) => a.doctorId === doctor.id);
            if (availability) {
              // Check if selected date/time is available
              const dayOfWeek = new Date(preferredDate).toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
              const hasDay = availability.availableDays.includes(dayOfWeek as any);
              const hasTimeSlot = availability.timeSlots.some((slot) => slot.start === preferredTime);
              const isBooked = availability.bookedSlots.some(
                (slot) => slot.date === preferredDate && slot.time === preferredTime
              );

              if (hasDay && hasTimeSlot && !isBooked) {
                assignedDoctor = doctor.name;
                break;
              }
            }
          } catch (error) {
            console.error("Error checking availability", error);
          }
        }

        // If no available doctor found, assign the first doctor with that specialty
        if (assignedDoctor === "none") {
          assignedDoctor = specialtyDoctors[0].name;
        }
      }
    }

    // Show success message with assigned doctor
    if (assignedDoctor !== "none") {
      setSuccessMessage(`Appointment request submitted! Assigned to ${assignedDoctor}`);
    } else {
      setSuccessMessage("Appointment request submitted! A doctor will be assigned shortly.");
    }

    setTimeout(() => setSuccessMessage(null), 5000);
    
    setOpen(false);
    setSelectedSpecialty("none");
    setPreferredDoctor("none");
    setAppointmentType("in-person");
    setPreferredDate("");
    setPreferredTime("");
    setReason("");
    setPatientNotes("");
  };

  const setWorkflowStatus = (appointmentId: string, nextStatus: AppointmentStatus) => {
    setLocalStatusMap((prev) => ({ ...prev, [appointmentId]: nextStatus }));
  };

  const handleReschedule = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setRescheduleDialogOpen(true);
  };

  const handleRescheduleSuccess = () => {
    setSuccessMessage("Appointment rescheduled successfully!");
    setTimeout(() => setSuccessMessage(null), 5000);
    if (selectedAppointment) {
      setWorkflowStatus(selectedAppointment.id, "rescheduled");
    }
  };

  const handleDoctorActions = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setDoctorActionsDialogOpen(true);
  };

  const handleDoctorActionsSuccess = () => {
    setSuccessMessage("Appointment updated successfully!");
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title="Appointments" subtitle="List, filter, and inspect appointment workflows" />
      
      {successMessage && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-lg">
          {successMessage}
        </div>
      )}
      
      {user?.role === "patient" ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <CalendarPlus className="mr-2 h-4 w-4" /> Request appointment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Book appointment</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <Label>Patient name</Label>
                  <Input value={user.name} disabled readOnly />
                </div>
                <div className="space-y-1">
                  <Label>Patient ID</Label>
                  <Input value={user.idNumber ?? user.id} disabled readOnly />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Service needed (required)</Label>
                <Select 
                  value={selectedSpecialty} 
                  onValueChange={(value) => {
                    setSelectedSpecialty(value as MedicalSpecialty | "none");
                    setPreferredDoctor("none"); // Reset doctor selection when specialty changes
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not specified</SelectItem>
                    {specialties.map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Preferred doctor (optional)</Label>
                <Select value={preferredDoctor} onValueChange={setPreferredDoctor}>
                  <SelectTrigger>
                    <SelectValue placeholder={selectedSpecialty === "none" ? "Select service first" : "No preference - Auto-assign"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No preference - Auto-assign</SelectItem>
                    {filteredDoctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.name}>
                        {doctor.name} {doctor.specialty ? `(${doctor.specialty})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedSpecialty !== "none" && filteredDoctors.length === 0 && (
                  <p className="text-sm text-amber-600">No doctors available for this service</p>
                )}
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <Label>Preferred date</Label>
                  <Input type="date" value={preferredDate} onChange={(event) => setPreferredDate(event.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Preferred time</Label>
                  <Input type="time" value={preferredTime} onChange={(event) => setPreferredTime(event.target.value)} />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Appointment type (required)</Label>
                <Select value={appointmentType} onValueChange={(value) => setAppointmentType(value as "in-person" | "telehealth") }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-person">Physical appointment</SelectItem>
                    <SelectItem value="telehealth">Telemedicine appointment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Reason for visit (optional)</Label>
                <Textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Briefly describe your reason for visit" />
              </div>
              <div className="space-y-1">
                <Label>Additional notes for doctor (optional)</Label>
                <Textarea 
                  value={patientNotes} 
                  onChange={(event) => setPatientNotes(event.target.value)} 
                  placeholder="Any specific symptoms, concerns, or information you'd like the doctor to know"
                  rows={3}
                />
              </div>
              <Button 
                className="w-full" 
                onClick={onCreateRequest} 
                disabled={!preferredDate || !preferredTime || selectedSpecialty === "none"}
              >
                Submit request
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      ) : null}
      <FilterBar search={search} onSearchChange={setSearch} status={status} onStatusChange={setStatus} />

      {query.isLoading ? <LoadState /> : null}
      {query.isError ? <ErrorState /> : null}
      {query.isSuccess ? (
        <>
          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {rows.map((row) => (
              <Card key={row.id} className="shadow-md border-slate-200/50 dark:border-slate-800/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base truncate">{row.patientName}</h3>
                      <p className="text-xs text-muted-foreground">ID: {row.id}</p>
                    </div>
                    <StatusBadge status={row.status} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Doctor</p>
                      <p className="font-medium truncate">{row.doctorName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Date</p>
                      <p className="font-medium">{row.date}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Type</p>
                      <p className="font-medium capitalize">{row.consultationType === "telehealth" ? "Telemedicine" : "Physical"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Time</p>
                      <p className="font-medium">{row.time}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-3 border-t border-border">
                    <Button asChild variant="default" size="sm" className="w-full">
                      <Link href={`/app/appointments/${row.id}`}>View details</Link>
                    </Button>
                    
                    {user?.role === "admin" ? (
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm" onClick={() => setWorkflowStatus(row.id, "confirmed")}>
                          Approve
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleReschedule(row)}>
                          Reschedule
                        </Button>
                      </div>
                    ) : user?.role === "doctor" ? (
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleDoctorActions(row)}>
                          Manage
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleReschedule(row)}>
                          Reschedule
                        </Button>
                      </div>
                    ) : user?.role === "patient" && (row.status === "pending" || row.status === "confirmed") ? (
                      <Button variant="outline" size="sm" className="w-full" onClick={() => handleReschedule(row)}>
                        Reschedule
                      </Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <DataTable
              data={rows}
              columns={[
                { key: "id", header: "ID" },
                { key: "patientName", header: "Patient" },
                { key: "doctorName", header: "Doctor" },
                { key: "date", header: "Date" },
                {
                  key: "consultationType",
                  header: "Type",
                  render: (row) => <span className="capitalize">{row.consultationType === "telehealth" ? "Telemedicine" : "Physical"}</span>,
                },
                { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
                {
                  key: "action",
                  header: "Action",
                  render: (row) => (
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/app/appointments/${row.id}`} className="text-primary hover:underline">
                        View details
                      </Link>
                      {user?.role === "admin" ? (
                        <>
                          <Button variant="outline" size="sm" onClick={() => setWorkflowStatus(row.id, "confirmed")}>Approve</Button>
                          <Button variant="outline" size="sm" onClick={() => handleReschedule(row)}>Reschedule</Button>
                        </>
                      ) : user?.role === "doctor" ? (
                        <>
                          <Button variant="outline" size="sm" onClick={() => handleDoctorActions(row)}>Manage</Button>
                          <Button variant="outline" size="sm" onClick={() => handleReschedule(row)}>Reschedule</Button>
                        </>
                      ) : user?.role === "patient" && (row.status === "pending" || row.status === "confirmed") ? (
                        <Button variant="outline" size="sm" onClick={() => handleReschedule(row)}>Reschedule</Button>
                      ) : null}
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </>
      ) : null}
      
      <RescheduleAppointmentDialog
        open={rescheduleDialogOpen}
        onOpenChange={setRescheduleDialogOpen}
        appointment={selectedAppointment}
        userRole={user?.role}
        onSuccess={handleRescheduleSuccess}
      />
      
      <DoctorAppointmentActionsDialog
        open={doctorActionsDialogOpen}
        onOpenChange={setDoctorActionsDialogOpen}
        appointment={selectedAppointment}
        onSuccess={handleDoctorActionsSuccess}
      />
    </div>
  );
}
