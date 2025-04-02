
import { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statCardVariants = cva(
  "rounded-lg p-6 shadow-sm flex",
  {
    variants: {
      variant: {
        default: "bg-white border border-border dark:bg-card",
        primary: "bg-primary/10 border border-primary/20",
        success: "bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800",
        warning: "bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800",
        danger: "bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800",
      },
      size: {
        default: "min-h-[120px]",
        sm: "min-h-[100px] p-4",
        lg: "min-h-[160px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface StatCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statCardVariants> {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatCard({
  className,
  variant,
  size,
  title,
  value,
  icon,
  trend,
  ...props
}: StatCardProps) {
  return (
    <div
      className={cn(statCardVariants({ variant, size }), className)}
      {...props}
    >
      {icon && (
        <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20">
          {icon}
        </div>
      )}
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
        {trend && (
          <div className="flex items-center text-sm">
            <span
              className={cn(
                "mr-1",
                trend.isPositive ? "text-green-600" : "text-red-600"
              )}
            >
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
            </span>
            <span className="text-muted-foreground">vs last period</span>
          </div>
        )}
      </div>
    </div>
  );
}
