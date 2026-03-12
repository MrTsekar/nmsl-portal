import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold shadow-sm", {
  variants: {
    variant: {
      default: "border-transparent bg-gradient-to-r from-green-500 to-lime-600 text-white",
      secondary: "border-transparent bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
      outline: "text-foreground border-slate-300 dark:border-slate-700",
      success: "border-transparent bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-green-700 dark:text-green-400 border-green-500/20",
      warning: "border-transparent bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-400 border-amber-500/20",
      danger: "border-transparent bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-700 dark:text-red-400 border-red-500/20",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

function Badge({ className, variant, ...props }: HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
