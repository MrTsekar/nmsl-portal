import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const BAR_BASE = [42, 58, 37, 66, 53, 74, 62];

export function ChartCard({
  title,
  subtitle,
  bars = BAR_BASE,
  className,
}: {
  title: string;
  subtitle?: string;
  bars?: number[];
  className?: string;
}) {
  return (
    <Card className={cn("premium-card", className)}>
      <CardHeader className="pb-3 p-4 sm:p-6">
        <CardTitle className="text-sm sm:text-base">{title}</CardTitle>
        {subtitle ? <p className="text-xs text-muted-foreground">{subtitle}</p> : null}
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="chart-surface flex h-32 sm:h-40 items-end gap-1.5 sm:gap-2 rounded-lg p-2 sm:p-3">
          {bars.map((bar, index) => (
            <div
              key={`${title}-${index}`}
              className="chart-bar flex-1 rounded-t-md"
              style={{ height: `${bar}%` }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
