"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/status-badge"
import { ChevronRight, FolderOpen, FileText } from "lucide-react"
import Link from "next/link"
import type { Project, Task } from "@/lib/types"

interface ProjectCardProps {
  project: Project & { children?: Project[]; tasks?: Task[] }
}

export function ProjectCard({ project }: ProjectCardProps) {
  const topTask = project.tasks?.[0]
  const childCount = project.children?.length ?? 0

  return (
    <Link href={`/project/${project.id}`}>
      <Card className="group cursor-pointer transition-all hover:border-primary/50 hover:shadow-md h-full">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {project.isLeaf ? (
                <FileText className="h-4 w-4 text-muted-foreground" />
              ) : (
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
              )}
              <CardTitle className="text-base font-medium">{project.name}</CardTitle>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </div>
        </CardHeader>
        <CardContent>
          {project.description && (
            <p className="mb-3 text-sm text-muted-foreground line-clamp-2">{project.description}</p>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            {!project.isLeaf && childCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {childCount} sub-project{childCount !== 1 ? "s" : ""}
              </Badge>
            )}
            {project.isLeaf && topTask && <StatusBadge status={topTask.status} size="sm" />}
            {project.isLeaf && topTask && (
              <span className="text-xs text-muted-foreground truncate max-w-32">{topTask.title}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
