import { getProject, getTasksForNonLeafProject } from "@/app/actions/projects";
import { notFound } from "next/navigation";
import { ProjectHeader } from "@/components/project-header";
import { ProjectBreadcrumb } from "@/components/project-breadcrumb";
import { LeafProjectView } from "@/components/leaf-project-view";
import { NonLeafProjectView } from "@/components/non-leaf-project-view";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) {
    notFound();
  }

  function isNotNull<T>(v: T | null): v is T {
    return v !== null;
  }

  // If it is leaf then just make aggregatedTasks empty
  const aggregatedTasks = project.isLeaf
    ? []
    : (await getTasksForNonLeafProject(id)).filter(isNotNull);

  return (
    <div className="min-h-screen bg-background">
      <ProjectHeader project={project} />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <ProjectBreadcrumb project={project} />

        <div className="mt-6">
          {project.isLeaf ? (
            <LeafProjectView project={project} />
          ) : (
            <NonLeafProjectView
              project={project}
              aggregatedTasks={aggregatedTasks}
            />
          )}
        </div>
      </main>
    </div>
  );
}
