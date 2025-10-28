import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useProblem,
  useUpdateProblem,
  useDeleteProblem,
} from "@/features/problems/hooks/useProblems";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { logger } from "@/lib/logger";

export function EditProblemPage() {
  const navigate = useNavigate();
  const { pid } = useParams<{ pid: string }>();
  const problemId = Number(pid);

  const { data, isLoading } = useProblem(problemId);
  const { mutateAsync: updateProblem, isPending: isUpdating } =
    useUpdateProblem(problemId);
  const { mutateAsync: deleteProblem, isPending: isDeleting } =
    useDeleteProblem();

  const [formData, setFormData] = useState({
    title: "",
    descriptionMd: "",
    difficulty: "easy" as "easy" | "medium" | "hard",
    tags: "",
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Populate form when problem data loads
  useEffect(() => {
    if (data?.problem) {
      setFormData({
        title: data.problem.title,
        descriptionMd: data.problem.descriptionMd,
        difficulty: data.problem.difficulty as "easy" | "medium" | "hard",
        tags: data.problem.tags.join(", "),
      });
    }
  }, [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateProblem({
        title: formData.title,
        descriptionMd: formData.descriptionMd,
        difficulty: formData.difficulty,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      });

      // Navigate back to the problem
      navigate(`/problems/${problemId}`);
    } catch (err) {
      logger.error("Failed to update problem:", err);
    }
  };

  const handleBackButton = () => {
    navigate(-1);
  };

  const handleDelete = async () => {
    try {
      await deleteProblem(problemId);
      navigate("/problems");
    } catch (err) {
      logger.error("Failed to delete problem:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <div className="text-muted-foreground">Loading problem...</div>
      </div>
    );
  }

  if (!data?.problem) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <div className="text-red-600">Problem not found</div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Edit Problem #{problemId}</h1>
        <p className="text-muted-foreground">
          Update problem details and description
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Problem Title</Label>
            <Input
              id="title"
              type="text"
              placeholder="e.g., Two Sum"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty</Label>
            <select
              id="difficulty"
              value={formData.difficulty}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  difficulty: e.target.value as "easy" | "medium" | "hard",
                })
              }
              className="w-full px-3 py-2 rounded border border-input bg-background"
              required
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              type="text"
              placeholder="e.g., array, hashmap, two-pointers"
              value={formData.tags}
              onChange={(e) =>
                setFormData({ ...formData, tags: e.target.value })
              }
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Problem Description (Markdown supported)
            </Label>
            <textarea
              id="description"
              value={formData.descriptionMd}
              onChange={(e) =>
                setFormData({ ...formData, descriptionMd: e.target.value })
              }
              className="w-full min-h-[300px] px-3 py-2 rounded border border-input bg-background font-mono text-sm"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex gap-3">
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? "Updating..." : "Update Problem"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleBackButton}
              >
                Cancel
              </Button>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-600 hover:bg-red-500/10"
            >
              Delete Problem
            </Button>
          </div>
        </form>
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md">
            <h2 className="text-xl font-bold mb-4">Delete Problem?</h2>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete this problem? This action cannot
              be undone and will remove all associated submissions.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
