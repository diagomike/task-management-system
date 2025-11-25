import { getProjects } from "@/app/actions/projects";
import { ProjectCard } from "@/components/project-card";
import { CreateProjectDialog } from "@/components/create-project-dialog";
import { LayoutGrid } from "lucide-react";

export default async function HomePage() {
  const projects = await getProjects();
  console.log(projects);
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <LayoutGrid className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Alloc</h1>
              <p className="text-xs text-muted-foreground">Task Management</p>
            </div>
          </div>
          <CreateProjectDialog />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <LayoutGrid className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="mb-2 text-lg font-medium">No projects yet</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Create your first project to start organizing your work
            </p>
            <CreateProjectDialog />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Projects</h2>
              <span className="text-sm text-muted-foreground">
                {projects.length} project{projects.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
