"use client";

import { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, MapPin } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { CreateDoctorDialog } from "@/components/admin/create-doctor-dialog";
import { DoctorAvailabilityDialog, DoctorAvailability } from "@/components/admin/doctor-availability-dialog";
import { useAuthStore } from "@/store/auth-store";
import { useDoctors } from "@/hooks/use-app-data";
import { adminApi } from "@/lib/api/admin.api";
import { LoadState } from "@/components/shared/load-state";
import { ErrorState } from "@/components/shared/error-state";

export default function AdminDoctorsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const doctors = useDoctors();

  const [deactivatedIds, setDeactivatedIds] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAvailabilityDialogOpen, setIsAvailabilityDialogOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<{ id: string; name: string; availabilitySchedule?: any } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  const availabilityMutation = useMutation({
    mutationFn: ({ doctorId, schedule }: { doctorId: string; schedule: DoctorAvailability }) =>
      adminApi.updateDoctorAvailability(doctorId, schedule),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      setIsAvailabilityDialogOpen(false);
      setAvailabilityError(null);
      setSuccessMessage(`Availability updated for ${selectedDoctor?.name}`);
      setTimeout(() => setSuccessMessage(null), 5000);
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { status?: number; data?: { message?: string } } };
      if (axiosErr.response?.status === 404) {
        setAvailabilityError("Availability update is not yet supported by the server. Please try again later.");
      } else if (axiosErr.response?.data?.message) {
        setAvailabilityError(axiosErr.response.data.message);
      } else {
        setAvailabilityError("Failed to update availability. Please try again.");
      }
      setTimeout(() => setAvailabilityError(null), 6000);
    },
  });

  const rows = useMemo(() => {
    const allDoctors = (doctors.data ?? []).map((doctor) => {
      const hasSchedule = doctor.availabilitySchedule ? doctor.availabilitySchedule.days.length > 0 : false;
      console.log(`[AVAILABILITY] ${doctor.name}:`, {
        hasSchedule: !!doctor.availabilitySchedule,
        days: doctor.availabilitySchedule?.days,
        daysCount: doctor.availabilitySchedule?.days?.length,
        available: hasSchedule,
      });
      return {
        ...doctor,
        available: hasSchedule,
        active: doctor.isActive ?? true,
      };
    });

    if (!searchQuery.trim()) return allDoctors;

    const query = searchQuery.toLowerCase();
    return allDoctors.filter(
      (doctor) =>
        doctor.name.toLowerCase().includes(query) ||
        doctor.specialty.toLowerCase().includes(query) ||
        (doctor.qualifications ?? "").toLowerCase().includes(query) ||
        doctor.location.toLowerCase().includes(query)
    );
  }, [doctors.data, searchQuery]);

  const handleDoctorCreated = () => {
    queryClient.invalidateQueries({ queryKey: ["doctors"] });
    setSuccessMessage("Doctor account created successfully!");
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const handleOpenAvailabilityDialog = (doctorId: string, doctorName: string) => {
    const doctor = doctors.data?.find(d => d.id === doctorId);
    setSelectedDoctor({ 
      id: doctorId, 
      name: doctorName,
      availabilitySchedule: doctor?.availabilitySchedule 
    });
    setIsAvailabilityDialogOpen(true);
  };

  const handleSaveAvailability = (availabilityData: DoctorAvailability) => {
    availabilityMutation.mutate({
      doctorId: availabilityData.doctorId,
      schedule: availabilityData,
    });
  };

  if (doctors.isLoading) return <LoadState />;
  if (doctors.isError) return <ErrorState message="Could not load doctors." />;

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader 
        title="Doctors" 
        subtitle="Manage doctor accounts and booking availability (doctors can update their own schedules)"
        action={
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Doctor
          </Button>
        }
      />

      {/* Location scope banner */}
      <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800/50 dark:bg-blue-900/20 px-4 py-3">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
        <p className="text-sm text-blue-800 dark:text-blue-300">
          Viewing doctors across all NMSL facilities. You can create doctors for any location.
        </p>
      </div>
      
      {successMessage && (
        <div className="p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-lg text-sm sm:text-base">
          {successMessage}
        </div>
      )}

      {availabilityError && (
        <div className="p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg text-sm sm:text-base">
          {availabilityError}
        </div>
      )}
      
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-10"
          placeholder="Search by name, specialty, qualifications, or status..."
        />
      </div>

      {/* Mobile Card Layout */}
      <div className="space-y-3 md:hidden">
        {rows.map((doctor) => (
          <Card key={doctor.id}>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-base">{doctor.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{doctor.specialty}</p>
                  <p className="text-xs text-muted-foreground mt-1">{doctor.qualifications}</p>
                  <p className="text-xs font-medium text-primary mt-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />{doctor.location}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Account Status</p>
                    <Badge variant={doctor.active ? "success" : "secondary"} className="mt-1">
                      {doctor.active ? "Active" : "Deactivated"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Booking</p>
                    <Badge variant={doctor.available ? "success" : "warning"} className="mt-1">
                      {doctor.available ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleOpenAvailabilityDialog(doctor.id, doctor.name)}
                    disabled={!doctor.active}
                  >
                    Availability
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() =>
                      setDeactivatedIds((prev) =>
                        prev.includes(doctor.id) ? prev.filter((id) => id !== doctor.id) : [...prev, doctor.id]
                      )
                    }
                  >
                    {doctor.active ? "Deactivate" : "Reactivate"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <DataTable
        data={rows}
        columns={[
          { key: "name", header: "Name" },
          { key: "specialty", header: "Specialty" },
          { key: "qualifications", header: "Qualifications" },
          { key: "location", header: "Facility" },
          {
            key: "accountStatus",
            header: "Account Status",
            render: (row) => <Badge variant={row.active ? "success" : "secondary"}>{row.active ? "Active" : "Deactivated"}</Badge>,
          },
          {
            key: "availability",
            header: "Booking Availability",
            render: (row) => <Badge variant={row.available ? "success" : "warning"}>{row.available ? "Available" : "Unavailable"}</Badge>,
          },
          {
            key: "action",
            header: "Action",
            render: (row) => (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenAvailabilityDialog(row.id, row.name)}
                  disabled={!row.active}
                >
                  Availability
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setDeactivatedIds((prev) =>
                      prev.includes(row.id) ? prev.filter((id) => id !== row.id) : [...prev, row.id]
                    )
                  }
                >
                  {row.active ? "Deactivate" : "Reactivate"}
                </Button>
              </div>
            ),
          },
        ]}
        />
      </div>
      
      <CreateDoctorDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        onSuccess={handleDoctorCreated}
      />

      {selectedDoctor && (
        <DoctorAvailabilityDialog
          open={isAvailabilityDialogOpen}
          onOpenChange={setIsAvailabilityDialogOpen}
          doctorId={selectedDoctor.id}
          doctorName={selectedDoctor.name}
          initialAvailability={selectedDoctor.availabilitySchedule}
          onSave={handleSaveAvailability}
          isSaving={availabilityMutation.isPending}
        />
      )}
    </div>
  );
}
