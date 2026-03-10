"use client";

import { useState } from "react";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type Testimonial = {
  id: string;
  patientName: string;
  patientCategory: "Staff" | "Retiree" | "Dependent";
  title: string;
  message: string;
  serviceType: "Physical Appointment" | "Telemedicine";
};

const initialTestimonials: Testimonial[] = [
  {
    id: "t-1",
    patientName: "A.L.",
    patientCategory: "Staff",
    title: "Excellent triage process",
    message: "The appointment and follow-up coordination were smooth and timely.",
    serviceType: "Physical Appointment",
  },
  {
    id: "t-2",
    patientName: "N.J.",
    patientCategory: "Dependent",
    title: "Helpful remote support",
    message: "I received fast updates and clear instructions before consultation.",
    serviceType: "Telemedicine",
  },
];

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(initialTestimonials);
  const [patientName, setPatientName] = useState("");
  const [patientCategory, setPatientCategory] = useState<Testimonial["patientCategory"]>("Staff");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [serviceType, setServiceType] = useState<Testimonial["serviceType"]>("Physical Appointment");

  const addTestimonial = () => {
    if (!title || !message) return;

    setTestimonials((prev) => [
      {
        id: `t-${prev.length + 1}`,
        patientName: patientName || "Anonymous",
        patientCategory,
        title,
        message,
        serviceType,
      },
      ...prev,
    ]);

    setPatientName("");
    setPatientCategory("Staff");
    setTitle("");
    setMessage("");
    setServiceType("Physical Appointment");
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Testimonials" subtitle="Create and manage homepage patient testimonials" />

      <SectionCard title="Add new testimonial">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <Label>Patient Name (optional / initials)</Label>
            <Input value={patientName} onChange={(event) => setPatientName(event.target.value)} placeholder="e.g. A.L." />
          </div>
          <div className="space-y-1">
            <Label>Patient Category</Label>
            <Select value={patientCategory} onValueChange={(value) => setPatientCategory(value as Testimonial["patientCategory"])}>
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
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Short headline" />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label>Testimonial Message / Feedback Text</Label>
            <Textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Patient feedback" />
          </div>
          <div className="space-y-1">
            <Label>Service Type</Label>
            <Select value={serviceType} onValueChange={(value) => setServiceType(value as Testimonial["serviceType"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Physical Appointment">Physical Appointment</SelectItem>
                <SelectItem value="Telemedicine">Telemedicine</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button className="w-full" onClick={addTestimonial}>Save testimonial</Button>
          </div>
        </div>
      </SectionCard>

      <DataTable
        data={testimonials}
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
                onClick={() => setTestimonials((prev) => prev.filter((item) => item.id !== row.id))}
              >
                Delete
              </Button>
            ),
          },
        ]}
      />
    </div>
  );
}
