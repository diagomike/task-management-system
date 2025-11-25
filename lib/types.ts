import { Prisma, TaskStatus } from "@prisma/client";

// export type TaskStatus = "READY" | "IN_PROGRESS" | "BLOCKED" | "DONE";

export interface MetadataItem {
  key: string;
  value: string;
}

// export interface Task {
//   id: string;
//   title: string;
//   description?: string | null;
//   status: TaskStatus;
//   metadata?: MetadataItem[] | null;
//   projectId: string;
//   order: number;
//   createdAt: Date;
//   updatedAt: Date;
// }

// export interface Project {
//   id: string;
//   name: string;
//   description?: string | null;
//   metadata?: MetadataItem[] | null;
//   isLeaf: boolean;
//   parentId?: string | null;
//   parent?: Project | null;
//   children?: Project[];
//   tasks?: Task[];
//   createdAt: Date;
//   updatedAt: Date;
//   order: number;
// }

/**
 * 1. Base Project Type
 * Inferred directly from the Project model fields (Prisma Model Type)
 * 'metadata' field is now correctly typed as Prisma.JsonValue | null.
 */
export type Project = Prisma.ProjectGetPayload<{}>;

/**
 * 2. Base Task Type
 * Inferred directly from the Task model fields (Prisma Model Type)
 * 'metadata' field is now correctly typed as Prisma.JsonValue | null.
 */
export type Task = Prisma.TaskGetPayload<{}>;

// export interface ProjectWithRelations extends Project {
//   parent: Project | null;
//   children: Project[];
//   tasks: Task[];
// }

/**
 * 3. Project Type with all defined relations included (Project, Children, Tasks)
 * This uses the 'include' option to ensure all nested relations are present in the type.
 */
export type ProjectWithRelations = Prisma.ProjectGetPayload<{
  include: {
    parent: true; // Includes the Parent Project object
    children: true; // Includes the array of Child Project objects
    tasks: true; // Includes the array of Task objects
  };
}>;

// export interface LeafTaskView {
//   taskId: string;
//   taskTitle: string;
//   taskStatus: TaskStatus;
//   projectId: string;
//   projectName: string;
//   taskOrder: number;
// }

/**
 * 4. Custom View Type (Kept as an interface since it's a specific, flattened projection
 * of data that doesn't map directly to a single Prisma model)
 */
export interface LeafTaskView {
  taskId: string;
  taskTitle: string;
  taskStatus: TaskStatus;
  projectId: string;
  projectName: string;
  taskOrder: number;
}
