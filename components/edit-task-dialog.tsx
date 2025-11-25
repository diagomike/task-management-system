"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X } from "lucide-react"
import { updateTask } from "@/app/actions/tasks"
import type { Task, TaskStatus, MetadataItem } from "@/lib/types"

interface EditTaskDialogProps {
  task: Task
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditTaskDialog({ task, open, onOpenChange }: EditTaskDialogProps) {
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description ?? "")
  const [status, setStatus] = useState<TaskStatus>(task.status)
  const [metadata, setMetadata] = useState<MetadataItem[]>((task.metadata as MetadataItem[] | null) ?? [])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setTitle(task.title)
    setDescription(task.description ?? "")
    setStatus(task.status)
    setMetadata((task.metadata as MetadataItem[] | null) ?? [])
  }, [task])

  const addMetadataField = () => {
    setMetadata([...metadata, { key: "", value: "" }])
  }

  const updateMetadataField = (index: number, field: "key" | "value", value: string) => {
    const updated = [...metadata]
    updated[index][field] = value
    setMetadata(updated)
  }

  const removeMetadata = (index: number) => {
    setMetadata(metadata.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    try {
      await updateTask(task.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        metadata: metadata.filter((m) => m.key.trim()),
      })
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-task-title">Title</Label>
            <Input
              id="edit-task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-task-description">Description</Label>
            <Textarea
              id="edit-task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional notes or steps"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-task-status">Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
              <SelectTrigger id="edit-task-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="READY">Ready</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="BLOCKED">Blocked</SelectItem>
                <SelectItem value="DONE">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Step Data / Notes</Label>
              <Button type="button" variant="ghost" size="sm" onClick={addMetadataField}>
                <Plus className="mr-1 h-3 w-3" />
                Add Field
              </Button>
            </div>
            {metadata.map((item, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Key (e.g., Step 1)"
                  value={item.key}
                  onChange={(e) => updateMetadataField(index, "key", e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Value"
                  value={item.value}
                  onChange={(e) => updateMetadataField(index, "value", e.target.value)}
                  className="flex-1"
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeMetadata(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
