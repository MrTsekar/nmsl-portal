"use client";

import { useMemo, useState } from "react";
import { CalendarOff, CalendarCheck } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { mockAppointments } from "@/lib/mocks/data";

interface BlockedSlot {
  id: string;
  from: string;
  to: string;
  reason?: string;
}

export default function DoctorSchedulePage() {
  const [unavailableFrom, setUnavailableFrom] = useState("");
  const [unavailableTo, setUnavailableTo] = useState("");
  const [notes, setNotes] = useState("");
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);

  const weeklyRows = useMemo(
    () =>
      mockAppointments
        .filter((item) => item.status !== "cancelled")
        .map((item) => ({
          ...item,
          appointmentType: item.consultationType === "telehealth" ? "Telemedicine" : "Physical",
        })),
    [],
  );

  const onBlockAvailability = () => {
    if (!unavailableFrom || !unavailableTo) return;
    const newSlot: BlockedSlot = {
      id: Date.now().toString(),
      from: unavailableFrom,
      to: unavailableTo,
      reason: notes,
    };
    setBlockedSlots([...blockedSlots, newSlot]);
    setUnavailableFrom("");
    setUnavailableTo("");
    setNotes("");
  };

  const onUnblockSlot = (slotId: string) => {
    setBlockedSlots(blockedSlots.filter((slot) => slot.id !== slotId));
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title="Schedule" subtitle="Manage daily clinic and telehealth schedule" />

      <SectionCard title="Availability control">
        <div className="grid gap-3 sm:gap-4 md:grid-cols-4">
          <div className="space-y-1">
            <Label className="text-sm">Unavailable from</Label>
            <Input type="datetime-local" className="h-10" value={unavailableFrom} onChange={(event) => setUnavailableFrom(event.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-sm">Unavailable to</Label>
            <Input type="datetime-local" className="h-10" value={unavailableTo} onChange={(event) => setUnavailableTo(event.target.value)} />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label className="text-sm">Reason</Label>
            <Input className="h-10" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Conference, ward round, leave, etc." />
          </div>
        </div>
        <div className="mt-3">
          <Button onClick={onBlockAvailability} disabled={!unavailableFrom || !unavailableTo}>
            <CalendarOff className="mr-2 h-4 w-4" /> Mark unavailable
          </Button>
        </div>
        {blockedSlots.length > 0 && (
          <div className="mt-4 space-y-2">
            <Label className="text-sm font-medium">Blocked time slots:</Label>
            <div className="space-y-2">
              {blockedSlots.map((slot) => (
                <div key={slot.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 border rounded-lg bg-amber-50 dark:bg-amber-950/20">
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {formatDateTime(slot.from)} → {formatDateTime(slot.to)}
                    </p>
                    {slot.reason && (
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">Reason: {slot.reason}</p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={() => onUnblockSlot(slot.id)}
                  >
                    <CalendarCheck className="mr-2 h-4 w-4" />
                    Mark Available
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </SectionCard>

      {/* Mobile Card Layout */}
      <div className="space-y-3 lg:hidden">
        {weeklyRows.map((appointment, idx) => (
          <Card key={idx}>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-base">{appointment.patientName}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{appointment.reason}</p>
                  </div>
                  <StatusBadge status={appointment.status} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="text-sm font-medium mt-1">{appointment.date}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Time</p>
                    <p className="text-sm font-medium mt-1">{appointment.time}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Type</p>
                    <p className="text-sm font-medium mt-1">{appointment.appointmentType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="text-sm font-medium mt-1">{appointment.location}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block">
        <DataTable
        data={weeklyRows}
        columns={[
          { key: "date", header: "Date" },
          { key: "time", header: "Time" },
          { key: "patientName", header: "Patient" },
          { key: "reason", header: "Reason" },
          { key: "appointmentType", header: "Type" },
          { key: "location", header: "Location" },
          { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
        ]}
        />
      </div>
    </div>
  );
}
