"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { StatusBadge } from "@/components/status-badge"
import { GripVertical, MoreHorizontal, Pencil, Trash2, ChevronUp, ChevronDown, Plus } from "lucide-react"
import { updateTask, deleteTask, reorderTasks } from "@/app/actions/tasks"
import { EditTaskDialog } from "@/components/edit-task-dialog"
import { CreateTaskDialog } from "@/components/create-task-dialog"
import type { Task, TaskStatus, MetadataItem } from "@/lib/types"

interface TaskListProps {
  tasks: Task[]
  projectId: string
}

export function TaskList({ tasks, projectId }: TaskListProps) {
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [localTasks, setLocalTasks] = useState(tasks)

  // Keep local state in sync with props
  if (JSON.stringify(tasks) !== JSON.stringify(localTasks)) {
    setLocalTasks(tasks)
  }

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    await updateTask(taskId, { status })
  }

  const handleCheckboxChange = async (taskId: string, checked: boolean) => {
    if (checked) {
      await updateTask(taskId, { status: "DONE" })
    }
  }

  const handleDelete = async (taskId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      await deleteTask(taskId)
    }
  }

  const moveTask = async (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= localTasks.length) return

    const newTasks = [...localTasks]
    const [movedTask] = newTasks.splice(index, 1)
    newTasks.splice(newIndex, 0, movedTask)
    setLocalTasks(newTasks)

    await reorderTasks(
      projectId,
      newTasks.map((t) => t.id),
    )
  }

  const doneTasks = localTasks.filter((t) => t.status === "DONE")
  const activeTasks = localTasks.filter((t) => t.status !== "DONE")

  if (localTasks.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="mb-4 text-sm text-muted-foreground">No tasks yet</p>
          <CreateTaskDialog
            projectId={projectId}
            trigger={
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add First Task
              </Button>
            }
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Active Tasks */}
      <div className="space-y-2">
        {activeTasks.map((task, index) => {
          const metadata = (task.metadata as MetadataItem[] | null) ?? []
          const globalIndex = localTasks.findIndex((t) => t.id === task.id)

          return (
            <Card
              key={task.id}
              className={`transition-all ${index === 0 ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20" : ""}`}
            >
              <CardContent className="flex items-start gap-3 p-4">
                <div className="flex flex-col items-center gap-1 pt-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    disabled={globalIndex === 0}
                    onClick={() => moveTask(globalIndex, "up")}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    disabled={globalIndex === localTasks.length - 1}
                    onClick={() => moveTask(globalIndex, "down")}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-start pt-2">
                  <Checkbox
                    checked={task.status === "DONE"}
                    onCheckedChange={(checked) => handleCheckboxChange(task.id, checked as boolean)}
                  />
                </div>

                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {index === 0 && (
                          <Badge className="bg-primary text-primary-foreground text-xs shrink-0">Current</Badge>
                        )}
                        <span className="font-medium truncate">{task.title}</span>
                      </div>
                      {task.description && (
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingTask(task)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit Task
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(task.id)} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Task
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <Select
                      value={task.status}
                      onValueChange={(value) => handleStatusChange(task.id, value as TaskStatus)}
                    >
                      <SelectTrigger className="h-8 w-36">
                        <SelectValue>
                          <StatusBadge status={task.status} size="sm" />
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="READY">
                          <StatusBadge status="READY" size="sm" />
                        </SelectItem>
                        <SelectItem value="IN_PROGRESS">
                          <StatusBadge status="IN_PROGRESS" size="sm" />
                        </SelectItem>
                        <SelectItem value="BLOCKED">
                          <StatusBadge status="BLOCKED" size="sm" />
                        </SelectItem>
                        <SelectItem value="DONE">
                          <StatusBadge status="DONE" size="sm" />
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    {metadata.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {metadata.slice(0, 2).map((item, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs font-normal">
                            {item.key}: {item.value.substring(0, 20)}
                            {item.value.length > 20 ? "..." : ""}
                          </Badge>
                        ))}
                        {metadata.length > 2 && (
                          <Badge variant="outline" className="text-xs font-normal">
                            +{metadata.length - 2} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Completed Tasks */}
      {doneTasks.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Completed ({doneTasks.length})</p>
          {doneTasks.map((task) => {
            const globalIndex = localTasks.findIndex((t) => t.id === task.id)

            return (
              <Card key={task.id} className="bg-muted/30 border-muted">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex flex-col items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      disabled={globalIndex === 0}
                      onClick={() => moveTask(globalIndex, "up")}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      disabled={globalIndex === localTasks.length - 1}
                      onClick={() => moveTask(globalIndex, "down")}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>

                  <Checkbox checked disabled className="opacity-50" />

                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-muted-foreground line-through">{task.title}</span>
                    <StatusBadge status="DONE" size="sm" />
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingTask(task)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Task
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(task.id)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Task
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {editingTask && (
        <EditTaskDialog
          task={editingTask}
          open={!!editingTask}
          onOpenChange={(open) => !open && setEditingTask(null)}
        />
      )}
    </div>
  )
}
