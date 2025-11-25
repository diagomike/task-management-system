"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MetadataDisplay } from "@/components/metadata-display"
import { TaskList } from "@/components/task-list"
import { CreateTaskDialog } from "@/components/create-task-dialog"
import { ListTodo } from "lucide-react"
import type { ProjectWithRelations, MetadataItem } from "@/lib/types"

interface LeafProjectViewProps {
  project: ProjectWithRelations
}

export function LeafProjectView({ project }: LeafProjectViewProps) {
  const metadata = (project.metadata as MetadataItem[] | null) ?? []

  return (
    <div className="space-y-8">
      {/* Description and Metadata */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {project.description ? (
            <p className="text-sm text-muted-foreground">{project.description}</p>
          ) : (
            <p className="text-sm italic text-muted-foreground">No description provided</p>
          )}
          {metadata.length > 0 && <MetadataDisplay metadata={metadata} />}
        </CardContent>
      </Card>

      {/* Task List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-medium">Tasks</h2>
          </div>
          <CreateTaskDialog projectId={project.id} />
        </div>
        <TaskList tasks={project.tasks} projectId={project.id} />
      </div>
    </div>
  )
}
