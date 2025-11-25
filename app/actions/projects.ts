"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getProjects() {
  return prisma.project.findMany({
    where: { parentId: null },
    include: {
      children: true,
      tasks: {
        where: { status: { not: "DONE" } },
        orderBy: { order: "asc" },
        take: 1,
      },
    },
    orderBy: { order: "asc" },
  });
}

export async function getProject(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      parent: true,
      children: {
        orderBy: { order: "asc" },
      },
      tasks: {
        orderBy: { order: "asc" },
      },
    },
  });
}

export async function getAllNonLeafProjects(): Promise<
  { id: string; name: string; depth: number }[]
> {
  // Get all projects that can be parents (non-leaf or any project since containers can have children)
  const allProjects = await prisma.project.findMany({
    where: {
      isLeaf: false,
    },
    select: {
      id: true,
      name: true,
      parentId: true,
    },
    orderBy: { name: "asc" },
  });

  // Also include root-level projects that could become parents
  const rootProjects = await prisma.project.findMany({
    where: {
      parentId: null,
    },
    select: {
      id: true,
      name: true,
      parentId: true,
      isLeaf: true,
    },
    orderBy: { name: "asc" },
  });

  // Merge and deduplicate
  const projectMap = new Map<
    string,
    { id: string; name: string; parentId: string | null }
  >();

  for (const p of allProjects) {
    projectMap.set(p.id, p);
  }
  for (const p of rootProjects) {
    if (!projectMap.has(p.id)) {
      projectMap.set(p.id, { id: p.id, name: p.name, parentId: p.parentId });
    }
  }

  const projects = Array.from(projectMap.values());

  // Build hierarchy with depth for display
  const result: { id: string; name: string; depth: number }[] = [];

  function addWithDepth(parentId: string | null, depth: number) {
    const children = projects.filter((p) => p.parentId === parentId);
    for (const child of children) {
      result.push({ id: child.id, name: child.name, depth });
      addWithDepth(child.id, depth + 1);
    }
  }

  addWithDepth(null, 0);
  return result;
}

export async function createProject(data: {
  name: string;
  description?: string;
  metadata?: { key: string; value: string }[];
  parentId?: string;
  isLeaf?: boolean;
}) {
  const isLeaf = data.isLeaf ?? false;

  const project = await prisma.project.create({
    data: {
      name: data.name,
      description: data.description,
      metadata: data.metadata,
      parentId: data.parentId,
      isLeaf: isLeaf,
    },
  });

  // If has a parent, mark parent as non-leaf
  if (data.parentId) {
    await prisma.project.update({
      where: { id: data.parentId },
      data: { isLeaf: false },
    });
  }

  revalidatePath("/");
  revalidatePath(`/project/${data.parentId}`);
  return project;
}

export async function updateProject(
  id: string,
  data: {
    name?: string;
    description?: string;
    metadata?: { key: string; value: string }[];
  }
) {
  const project = await prisma.project.update({
    where: { id },
    data,
  });
  revalidatePath("/");
  revalidatePath(`/project/${id}`);
  return project;
}

export async function deleteProject(id: string) {
  const project = await prisma.project.findUnique({
    where: { id },
    select: { parentId: true },
  });

  await prisma.project.delete({
    where: { id },
  });

  // Check if parent still has children
  if (project?.parentId) {
    const siblingCount = await prisma.project.count({
      where: { parentId: project.parentId },
    });
    if (siblingCount === 0) {
      await prisma.project.update({
        where: { id: project.parentId },
        data: { isLeaf: true },
      });
    }
  }

  revalidatePath("/");
  revalidatePath(`/project/${project?.parentId}`);
}

// Get all leaf projects under a parent (recursive)
export async function getLeafProjectsUnder(
  projectId: string
): Promise<string[]> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { children: true },
  });

  if (!project) return [];

  if (project.isLeaf) {
    return [project.id];
  }

  const leafIds: string[] = [];
  for (const child of project.children) {
    const childLeaves = await getLeafProjectsUnder(child.id);
    leafIds.push(...childLeaves);
  }
  return leafIds;
}

export async function getTasksForNonLeafProject(projectId: string) {
  const leafProjectIds = await getLeafProjectsUnder(projectId);

  // Get top undone task from each leaf project
  const tasks = await Promise.all(
    leafProjectIds.map(async (leafId) => {
      const project = await prisma.project.findUnique({
        where: { id: leafId },
        select: { name: true },
      });
      const task = await prisma.task.findFirst({
        where: {
          projectId: leafId,
          status: { not: "DONE" },
        },
        orderBy: { order: "asc" },
      });
      return task ? { ...task, projectName: project?.name ?? "" } : null;
    })
  );

  return tasks.filter(Boolean);
}
