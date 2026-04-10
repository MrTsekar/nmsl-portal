"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { LoadState } from "@/components/shared/load-state";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { testimonialsApi } from "@/lib/api/testimonials.api";
import { useTestimonials } from "@/hooks/use-app-data";
import type { Testimonial } from "@/types";

export default function AdminTestimonialsPage() {
  const queryClient = useQueryClient();
  const testimonialsQuery = useTestimonials();

  const [patientName, setPatientName] = useState("");
  const [patientCategory, setPatientCategory] = useState<Testimonial["patientCategory"]>("Staff");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [serviceType, setServiceType] = useState<Testimonial["serviceType"]>("Physical Appointment");

  const createMutation = useMutation({
    mutationFn: testimonialsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      setPatientName("");
      setPatientCategory("Staff");
      setTitle("");
      setMessage("");
      setServiceType("Physical Appointment");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: testimonialsApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["testimonials"] }),
  });

  const handleSave = () => {
    if (!title || !message) return;
    createMutation.mutate({ patientName: patientName || "Anonymous", patientCategory, title, message, serviceType });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title="Testimonials" subtitle="Create and manage homepage patient testimonials" />

      <SectionCard title="Add new testimonial">
        <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Label>Patient Name (optional / initials)</Label>
            <Input value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="e.g. A.L." />
          </div>
          <div className="space-y-1">
            <Label>Patient Category</Label>
            <Select value={patientCategory} onValueChange={(v) => setPatientCategory(v as Testimonial["patientCategory"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Staff">Staff</SelectItem>
                <SelectItem value="Retiree">Retiree</SelectItem>
                <SelectItem value="Dependent">Dependent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label>Testimonial Title / Headline</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Short headline" />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label>Testimonial Message / Feedback Text</Label>
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Patient feedback" />
          </div>
          <div className="space-y-1">
            <Label>Service Type</Label>
            <Select value={serviceType} onValueChange={(v) => setServiceType(v as Testimonial["serviceType"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Physical Appointment">Physical Appointment</SelectItem>
                <SelectItem value="Telemedicine">Telemedicine</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button className="w-full h-10" onClick={handleSave} disabled={createMutation.isPending || !title || !message}>
              {createMutation.isPending ? "Saving..." : "Save testimonial"}
            </Button>
          </div>
        </div>
        {createMutation.isError && (
          <p className="mt-2 text-sm text-red-600">Failed to save testimonial. Please try again.</p>
        )}
      </SectionCard>

      {testimonialsQuery.isLoading && <LoadState />}
      {testimonialsQuery.isError && <ErrorState message="Could not load testimonials." />}

      {!testimonialsQuery.isLoading && !testimonialsQuery.isError && (
        <>
          <div className="space-y-3 md:hidden">
            {(testimonialsQuery.data ?? []).map((t) => (
              <Card key={t.id}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-base">{t.title}</h3>
                      <p className="text-sm text-muted-foreground mt-2">{t.message}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Patient</p>
                        <p className="text-sm font-medium mt-1">{t.patientName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Category</p>
                        <p className="text-sm font-medium mt-1">{t.patientCategory}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Service Type</p>
                      <p className="text-sm font-medium mt-1">{t.serviceType}</p>
                    </div>
                    <div className="pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        disabled={deleteMutation.isPending}
                        onClick={() => deleteMutation.mutate(t.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="hidden md:block">
            <DataTable
              data={testimonialsQuery.data ?? []}
              columns={[
                { key: "patientName", header: "Patient" },
                { key: "patientCategory", header: "Category" },
                { key: "title", header: "Title" },
                { key: "serviceType", header: "Service" },
                {
                  key: "action",
                  header: "Action",
                  render: (row) => (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate(row.id)}
                    >
                      Delete
                    </Button>
                  ),
                },
              ]}
            />
          </div>
        </>
      )}
    </div>
  );
}
