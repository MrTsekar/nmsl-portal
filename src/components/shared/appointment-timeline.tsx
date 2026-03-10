import type { Appointment } from "@/types";
import { StatusBadge } from "@/components/shared/status-badge";

export function AppointmentTimeline({ appointment }: { appointment: Appointment }) {
  const steps = [
    { title: "Appointment Created", date: appointment.date, done: true },
    { title: "Doctor Confirmation", date: appointment.date, done: appointment.status !== "pending" },
    { title: "Visit Completed", date: appointment.date, done: appointment.status === "completed" },
  ];

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs sm:text-sm text-muted-foreground">Current status</span>
        <StatusBadge status={appointment.status} />
      </div>
      <ol className="space-y-2.5 sm:space-y-3">
        {steps.map((step) => (
          <li key={step.title} className="flex items-start gap-2 sm:gap-3">
            <div className={`mt-0.5 h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full flex-shrink-0 ${step.done ? "bg-primary" : "bg-muted"}`} />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium">{step.title}</p>
              <p className="text-[11px] sm:text-xs text-muted-foreground">{step.date}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
