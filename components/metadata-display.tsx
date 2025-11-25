import { Badge } from "@/components/ui/badge"
import type { MetadataItem } from "@/lib/types"

interface MetadataDisplayProps {
  metadata: MetadataItem[]
}

export function MetadataDisplay({ metadata }: MetadataDisplayProps) {
  if (metadata.length === 0) return null

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Custom Data</p>
      <div className="flex flex-wrap gap-2">
        {metadata.map((item, index) => (
          <Badge key={index} variant="outline" className="font-normal">
            <span className="font-medium">{item.key}:</span>
            <span className="ml-1 text-muted-foreground">{item.value}</span>
          </Badge>
        ))}
      </div>
    </div>
  )
}
