"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import type { TaskStatus } from "@/lib/types"

export async function createTask(data: {
  title: string
  description?: string
  metadata?: { key: string; value: string }[]
  projectId: string
}) {
  const lastTask = await prisma.task.findFirst({
    where: { projectId: data.projectId },
    orderBy: { order: "desc" },
  })

  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      metadata: data.metadata,
      projectId: data.projectId,
      order: (lastTask?.order ?? -1) + 1,
    },
  })

  revalidatePath(`/project/${data.projectId}`)
  return task
}

export async function updateTask(
  id: string,
  data: {
    title?: string
    description?: string
    status?: TaskStatus
    metadata?: { key: string; value: string }[]
  },
) {
  const task = await prisma.task.update({
    where: { id },
    data,
  })
  revalidatePath(`/project/${task.projectId}`)
  revalidatePath("/")
  return task
}

export async function deleteTask(id: string) {
  const task = await prisma.task.findUnique({
    where: { id },
    select: { projectId: true },
  })

  await prisma.task.delete({
    where: { id },
  })

  revalidatePath(`/project/${task?.projectId}`)
}

export async function reorderTasks(projectId: string, taskIds: string[]) {
  await Promise.all(
    taskIds.map((id, index) =>
      prisma.task.update({
        where: { id },
        data: { order: index },
      }),
    ),
  )
  revalidatePath(`/project/${projectId}`)
}

export async function markTaskDone(id: string) {
  return updateTask(id, { status: "DONE" })
}
