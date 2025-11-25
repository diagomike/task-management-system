"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProjectCard } from "@/components/project-card"
import { CreateProjectDialog } from "@/components/create-project-dialog"
import { TaskAggregateTable } from "@/components/task-aggregate-table"
import { MetadataDisplay } from "@/components/metadata-display"
import { Button } from "@/components/ui/button"
import { Plus, FolderTree, ListTodo } from "lucide-react"
import type { ProjectWithRelations, Task, MetadataItem } from "@/lib/types"

interface NonLeafProjectViewProps {
  project: ProjectWithRelations
  aggregatedTasks: (Task & { projectName: string })[]
}

export function NonLeafProjectView({ project, aggregatedTasks }: NonLeafProjectViewProps) {
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

      {/* Aggregated Task Table */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <ListTodo className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-medium">Active Tasks</h2>
          <Badge variant="secondary">{aggregatedTasks.length}</Badge>
        </div>
        {aggregatedTasks.length > 0 ? (
          <TaskAggregateTable tasks={aggregatedTasks} />
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <p className="text-sm text-muted-foreground">No active tasks in sub-projects</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sub-Projects */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderTree className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-medium">Sub-Projects</h2>
            <Badge variant="secondary">{project.children.length}</Badge>
          </div>
          <CreateProjectDialog
            parentId={project.id}
            trigger={
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Sub-Project
              </Button>
            }
          />
        </div>
        {project.children.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {project.children.map((child) => (
              <ProjectCard key={child.id} project={child} />
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <p className="mb-4 text-sm text-muted-foreground">No sub-projects yet</p>
              <CreateProjectDialog
                parentId={project.id}
                trigger={
                  <Button variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Sub-Project
                  </Button>
                }
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
