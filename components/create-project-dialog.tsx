"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X, Folder, FileText } from "lucide-react";
import { createProject, getAllNonLeafProjects } from "@/app/actions/projects";
import type { MetadataItem } from "@/lib/types";

interface ParentProject {
  id: string;
  name: string;
  depth: number;
}

interface CreateProjectDialogProps {
  parentId?: string;
  trigger?: React.ReactNode;
}

export function CreateProjectDialog({
  parentId,
  trigger,
}: CreateProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [metadata, setMetadata] = useState<MetadataItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [projectType, setProjectType] = useState<"container" | "leaf">(
    "container"
  );
  const [selectedParentId, setSelectedParentId] = useState<string>(
    parentId || ""
  );
  const [availableParents, setAvailableParents] = useState<ParentProject[]>([]);
  const [loadingParents, setLoadingParents] = useState(false);

  useEffect(() => {
    if (open) {
      setLoadingParents(true);
      getAllNonLeafProjects()
        .then((parents) => {
          setAvailableParents(parents);
          // If parentId was passed as prop, pre-select it
          if (parentId) {
            setSelectedParentId(parentId);
          }
        })
        .finally(() => setLoadingParents(false));
    }
  }, [open, parentId]);

  const addMetadataField = () => {
    setMetadata([...metadata, { key: "", value: "" }]);
  };

  const updateMetadata = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    const updated = [...metadata];
    updated[index][field] = value;
    setMetadata(updated);
  };

  const removeMetadata = (index: number) => {
    setMetadata(metadata.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await createProject({
        name: name.trim(),
        description: description.trim() || undefined,
        metadata: metadata.filter((m) => m.key.trim()),
        parentId: selectedParentId || undefined,
        isLeaf: projectType === "leaf",
      });
      setOpen(false);
      setName("");
      setDescription("");
      setMetadata([]);
      setProjectType("container");
      setSelectedParentId(parentId || "");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Project Type</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setProjectType("container")}
                className={`flex items-center gap-2 rounded-lg border p-3 text-left transition-colors ${
                  projectType === "container"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/50"
                }`}
              >
                <Folder
                  className={`h-5 w-5 ${
                    projectType === "container"
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                />
                <div>
                  <div className="text-sm font-medium">Container</div>
                  <div className="text-xs text-muted-foreground">
                    Has sub-projects
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setProjectType("leaf")}
                className={`flex items-center gap-2 rounded-lg border p-3 text-left transition-colors ${
                  projectType === "leaf"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/50"
                }`}
              >
                <FileText
                  className={`h-5 w-5 ${
                    projectType === "leaf"
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                />
                <div>
                  <div className="text-sm font-medium">Leaf</div>
                  <div className="text-xs text-muted-foreground">Has tasks</div>
                </div>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Project name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parent">Parent Project (Optional)</Label>
            <Select
              value={selectedParentId}
              onValueChange={setSelectedParentId}
              disabled={loadingParents}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    loadingParents ? "Loading..." : "None (Root Level)"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (Root Level)</SelectItem>
                {availableParents.map((parent) => (
                  <SelectItem key={parent.id} value={parent.id}>
                    {"—".repeat(parent.depth)} {parent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Leave empty to create as a root-level project
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Custom Data</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addMetadataField}
              >
                <Plus className="mr-1 h-3 w-3" />
                Add Field
              </Button>
            </div>
            {metadata.map((item, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Key"
                  value={item.key}
                  onChange={(e) => updateMetadata(index, "key", e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Value"
                  value={item.value}
                  onChange={(e) =>
                    updateMetadata(index, "value", e.target.value)
                  }
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMetadata(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
