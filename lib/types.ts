export type TaskStatus = "READY" | "IN_PROGRESS" | "BLOCKED" | "DONE"

export interface MetadataItem {
  key: string
  value: string
}

export interface Task {
  id: string
  title: string
  description?: string | null
  status: TaskStatus
  metadata?: MetadataItem[] | null
  projectId: string
  order: number
  createdAt: Date
  updatedAt: Date
}

export interface Project {
  id: string
  name: string
  description?: string | null
  metadata?: MetadataItem[] | null
  isLeaf: boolean
  parentId?: string | null
  parent?: Project | null
  children?: Project[]
  tasks?: Task[]
  createdAt: Date
  updatedAt: Date
  order: number
}

export interface ProjectWithRelations extends Project {
  parent: Project | null
  children: Project[]
  tasks: Task[]
}

export interface LeafTaskView {
  taskId: string
  taskTitle: string
  taskStatus: TaskStatus
  projectId: string
  projectName: string
  taskOrder: number
}
