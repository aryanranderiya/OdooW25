import { Badge } from "@/components/ui/badge";
import { getPriorityColor } from "./utils";

interface PriorityBadgeProps {
  priority: "low" | "normal" | "high";
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const variant = getPriorityColor(priority);

  const labels = {
    high: "High Priority",
    normal: "Normal",
    low: "Low Priority",
  };

  return <Badge variant={variant as any}>{labels[priority]}</Badge>;
}
