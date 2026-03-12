"use client";

import { useState, useMemo } from "react";
import { Search, Plus, MapPin } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { CreateDoctorDialog } from "@/components/admin/create-doctor-dialog";
import { useAuthStore } from "@/store/auth-store";

const doctors = [
  { id: "d-1", name: "Dr. Ken Wu", specialty: "Internal Medicine", qualifications: "MBBS, FMCGP", location: "Lagos", status: "Active" },
  { id: "d-2", name: "Dr. Zahra Ali", specialty: "Cardiology", qualifications: "MBBS, FWACP", location: "Lagos", status: "Active" },
  { id: "d-3", name: "Dr. Ngozi Okafor", specialty: "Gynecology", qualifications: "MBBS, FWACS", location: "Abuja", status: "Active" },
  { id: "d-4", name: "Dr. Ahmed Bello", specialty: "Physiotherapy", qualifications: "MBBS, MSc PT", location: "Port Harcourt", status: "Active" },
  { id: "d-5", name: "Dr. Chioma Eze", specialty: "Pediatrics", qualifications: "MBBS, MWACP", location: "Lagos", status: "Active" },
];

export default function AdminDoctorsPage() {
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === "super_admin";
  const adminLocation = user?.location ?? "";

  const [availability, setAvailability] = useState<Record<string, boolean>>({});
  const [deactivatedIds, setDeactivatedIds] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const rows = useMemo(() => {
    const filtered = isSuperAdmin
      ? doctors
      : doctors.filter((d) => d.location === adminLocation);

    const allDoctors = filtered.map((doctor) => ({
      ...doctor,
      available: availability[doctor.id] ?? true,
      active: !deactivatedIds.includes(doctor.id),
    }));

    if (!searchQuery.trim()) return allDoctors;

    const query = searchQuery.toLowerCase();
    return allDoctors.filter(
      (doctor) =>
        doctor.name.toLowerCase().includes(query) ||
        doctor.specialty.toLowerCase().includes(query) ||
        doctor.qualifications.toLowerCase().includes(query) ||
        doctor.location.toLowerCase().includes(query) ||
        doctor.status.toLowerCase().includes(query)
    );
  }, [availability, deactivatedIds, searchQuery, isSuperAdmin, adminLocation]);

  const handleDoctorCreated = () => {
    setSuccessMessage("Doctor account created successfully!");
    setTimeout(() => setSuccessMessage(null), 5000);
  };

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
      {isSuperAdmin ? (
        <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800/50 dark:bg-blue-900/20 px-4 py-3">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong>Super Admin:</strong> Viewing doctors across all NMSL facilities. You can create doctors for any location.
          </p>
        </div>
      ) : (
        <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 dark:border-green-800/50 dark:bg-green-900/20 px-4 py-3">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
          <p className="text-sm text-green-800 dark:text-green-300">
            Showing doctors for <strong>{adminLocation}</strong>. You can only add doctors to your facility.
          </p>
        </div>
      )}
      
      {successMessage && (
        <div className="p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-lg text-sm sm:text-base">
          {successMessage}
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
                    onClick={() => setAvailability((prev) => ({ ...prev, [doctor.id]: !(prev[doctor.id] ?? true) }))}
                    disabled={!doctor.active}
                  >
                    {doctor.available ? "Mark unavailable" : "Restore availability"}
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
                  onClick={() => setAvailability((prev) => ({ ...prev, [row.id]: !(prev[row.id] ?? true) }))}
                  disabled={!row.active}
                >
                  {row.available ? "Mark unavailable" : "Restore availability"}
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
    </div>
  );
}
