import { Badge } from "@/components/ui/badge"
import type { TaskStatus } from "@/lib/types"

interface StatusBadgeProps {
  status: TaskStatus
  size?: "sm" | "default"
}

export function StatusBadge({ status, size = "default" }: StatusBadgeProps) {
  const config = getStatusConfig(status)

  return (
    <Badge
      variant="outline"
      className={`${size === "sm" ? "text-xs px-1.5 py-0" : ""}`}
      style={{
        borderColor: config.color,
        color: config.color,
        backgroundColor: `${config.color}10`,
      }}
    >
      {config.label}
    </Badge>
  )
}

function getStatusConfig(status: TaskStatus) {
  switch (status) {
    case "READY":
      return { label: "Ready", color: "var(--status-ready)" }
    case "IN_PROGRESS":
      return { label: "In Progress", color: "var(--status-progress)" }
    case "BLOCKED":
      return { label: "Blocked", color: "var(--status-blocked)" }
    case "DONE":
      return { label: "Done", color: "var(--status-done)" }
    default:
      return { label: status, color: "var(--muted-foreground)" }
  }
}
