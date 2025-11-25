"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatusBadge } from "@/components/status-badge"
import { updateTask } from "@/app/actions/tasks"
import Link from "next/link"
import type { Task, TaskStatus } from "@/lib/types"

interface TaskAggregateTableProps {
  tasks: (Task & { projectName: string })[]
}

export function TaskAggregateTable({ tasks }: TaskAggregateTableProps) {
  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    await updateTask(taskId, { status })
  }

  const handleCheckboxChange = async (taskId: string, checked: boolean) => {
    if (checked) {
      await updateTask(taskId, { status: "DONE" })
    }
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-12"></TableHead>
            <TableHead>Sub-Project</TableHead>
            <TableHead>Current Task</TableHead>
            <TableHead className="w-40">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id} className="hover:bg-muted/30">
              <TableCell>
                <Checkbox
                  checked={task.status === "DONE"}
                  onCheckedChange={(checked) => handleCheckboxChange(task.id, checked as boolean)}
                />
              </TableCell>
              <TableCell>
                <Link href={`/project/${task.projectId}`} className="text-sm font-medium text-primary hover:underline">
                  {task.projectName}
                </Link>
              </TableCell>
              <TableCell>
                <span className="text-sm">{task.title}</span>
                {task.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{task.description}</p>
                )}
              </TableCell>
              <TableCell>
                <Select value={task.status} onValueChange={(value) => handleStatusChange(task.id, value as TaskStatus)}>
                  <SelectTrigger className="h-8 w-full">
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
