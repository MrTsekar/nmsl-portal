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
import { Card, CardContent } from "@/components/ui/card";

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
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title="Testimonials" subtitle="Create and manage homepage patient testimonials" />

      <SectionCard title="Add new testimonial">
        <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
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
            <Button className="w-full h-10" onClick={addTestimonial}>Save testimonial</Button>
          </div>
        </div>
      </SectionCard>

      {/* Mobile Card Layout */}
      <div className="space-y-3 md:hidden">
        {testimonials.map((testimonial) => (
          <Card key={testimonial.id}>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-base">{testimonial.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2">{testimonial.message}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Patient</p>
                    <p className="text-sm font-medium mt-1">{testimonial.patientName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Category</p>
                    <p className="text-sm font-medium mt-1">{testimonial.patientCategory}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Service Type</p>
                  <p className="text-sm font-medium mt-1">{testimonial.serviceType}</p>
                </div>
                <div className="pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setTestimonials((prev) => prev.filter((item) => item.id !== testimonial.id))}
                  >
                    Delete
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
    </div>
  );
}
