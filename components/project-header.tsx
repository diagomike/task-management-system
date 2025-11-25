"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LayoutGrid, MoreHorizontal, Pencil, Trash2, FolderOpen, FileText } from "lucide-react"
import Link from "next/link"
import { deleteProject } from "@/app/actions/projects"
import { useRouter } from "next/navigation"
import { EditProjectDialog } from "@/components/edit-project-dialog"
import { useState } from "react"
import type { ProjectWithRelations } from "@/lib/types"

interface ProjectHeaderProps {
  project: ProjectWithRelations
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this project?")) {
      await deleteProject(project.id)
      router.push(project.parentId ? `/project/${project.parentId}` : "/")
    }
  }

  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <LayoutGrid className="h-5 w-5 text-primary-foreground" />
            </div>
          </Link>
          <div className="flex items-center gap-2">
            {project.isLeaf ? (
              <FileText className="h-5 w-5 text-muted-foreground" />
            ) : (
              <FolderOpen className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <h1 className="text-xl font-semibold">{project.name}</h1>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {project.isLeaf ? "Leaf Project" : "Container"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Project
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <EditProjectDialog project={project} open={editOpen} onOpenChange={setEditOpen} />
    </header>
  )
}
