import type { AppointmentStatus, ResultStatus } from "@/types";
import { Badge } from "@/components/ui/badge";

type Status = AppointmentStatus | ResultStatus;

const variantMap: Record<Status, "warning" | "success" | "secondary" | "danger"> = {
  pending: "warning",
  scheduled: "warning",
  confirmed: "success",
  rescheduled: "warning",
  completed: "success",
  rejected: "danger",
  "no-show": "secondary",
  ready: "success",
};

export function StatusBadge({ status }: { status: Status }) {
  return <Badge variant={variantMap[status]} className="capitalize">{status}</Badge>;
}
