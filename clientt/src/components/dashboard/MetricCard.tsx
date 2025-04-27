import { ReactNode } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatters";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  iconBgColor: string;
  iconColor: string;
  change?: {
    value: number | string;
    isPositive: boolean;
    label: string;
  };
  isCurrency?: boolean;
  className?: string;
}

export default function MetricCard({
  title,
  value,
  icon,
  iconBgColor,
  iconColor,
  change,
  isCurrency = true,
  className,
}: MetricCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-5">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-semibold">
              {isCurrency ? formatCurrency(value) : value}
            </h3>
          </div>
          <div
            className={cn(
              "h-12 w-12 rounded-full flex items-center justify-center",
              iconBgColor,
              iconColor
            )}
          >
            {icon}
          </div>
        </div>
        {change && (
          <div className="mt-3 flex items-center">
            <span
              className={cn(
                "text-xs font-medium flex items-center",
                change.isPositive 
                  ? "text-emerald-600 dark:text-emerald-400" 
                  : "text-destructive"
              )}
            >
              {change.isPositive ? (
                <ArrowUpRight className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 mr-1" />
              )}
              {change.value} {change.label}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
