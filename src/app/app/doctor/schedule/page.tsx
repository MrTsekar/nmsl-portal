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
    <div className="space-y-6">
      <PageHeader title="Schedule" subtitle="Manage daily clinic and telehealth schedule" />

      <SectionCard title="Availability control">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="space-y-1">
            <Label>Unavailable from</Label>
            <Input type="datetime-local" value={unavailableFrom} onChange={(event) => setUnavailableFrom(event.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Unavailable to</Label>
            <Input type="datetime-local" value={unavailableTo} onChange={(event) => setUnavailableTo(event.target.value)} />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label>Reason</Label>
            <Input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Conference, ward round, leave, etc." />
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
                <div key={slot.id} className="flex items-center justify-between p-3 border rounded-lg bg-amber-50 dark:bg-amber-950/20">
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {formatDateTime(slot.from)} → {formatDateTime(slot.to)}
                    </p>
                    {slot.reason && (
                      <p className="text-sm text-muted-foreground mt-1">Reason: {slot.reason}</p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
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
  );
}
