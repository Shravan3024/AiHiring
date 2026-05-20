import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-lg px-2.5 py-0.5 text-[10px] font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-blue-100 text-blue-700 dark:bg-blue-500/12 dark:text-blue-400",
        secondary: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
        destructive: "bg-red-100 text-red-700 dark:bg-red-500/12 dark:text-red-400",
        success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/12 dark:text-emerald-400",
        warning: "bg-amber-100 text-amber-700 dark:bg-amber-500/12 dark:text-amber-400",
        outline: "border border-border text-muted-foreground",
        purple: "bg-purple-100 text-purple-700 dark:bg-purple-500/12 dark:text-purple-400",
        orange: "bg-orange-100 text-orange-700 dark:bg-orange-500/12 dark:text-orange-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
