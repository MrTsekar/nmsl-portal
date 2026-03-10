import { AlertTriangle } from "lucide-react";

export function ErrorState({ message = "Something went wrong while loading data." }: { message?: string }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-danger/30 bg-danger/5 p-6 text-center">
      <AlertTriangle className="mb-3 h-8 w-8 text-danger" />
      <h3 className="text-base font-semibold text-danger">Unable to load</h3>
      <p className="mt-1 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
