import type { AppointmentStatus, ResultStatus } from "@/types";
import { Badge } from "@/components/ui/badge";

type Status = AppointmentStatus | ResultStatus;

const variantMap: Record<Status, "warning" | "success" | "secondary" | "danger"> = {
  pending: "warning",
  confirmed: "success",
  rescheduled: "warning",
  completed: "success",
  cancelled: "secondary",
  rejected: "danger",
  ready: "success",
};

export function StatusBadge({ status }: { status: Status }) {
  return <Badge variant={variantMap[status]} className="capitalize">{status}</Badge>;
}
