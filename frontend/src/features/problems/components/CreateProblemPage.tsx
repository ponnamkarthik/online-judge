import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateProblem } from "@/features/problems/hooks/useProblems";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { logger } from "@/lib/logger";

export function CreateProblemPage() {
  const navigate = useNavigate();
  const { mutateAsync: createProblem, isPending, error } = useCreateProblem();

  const [formData, setFormData] = useState({
    title: "",
    descriptionMd: "",
    difficulty: "easy" as "easy" | "medium" | "hard",
    tags: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await createProblem({
        title: formData.title,
        descriptionMd: formData.descriptionMd,
        difficulty: formData.difficulty,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      });

      // Navigate to the newly created problem
      navigate(`/problems/${result.problem.pid}`);
    } catch (err) {
      logger.error("Failed to create problem:", err);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Create New Problem</h1>
        <p className="text-muted-foreground">
          Add a new coding problem to the platform
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
            <p className="text-xs text-muted-foreground">
              Separate multiple tags with commas
            </p>
          </div>

          {/* Description (Markdown) */}
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
              placeholder="# Problem Title&#10;&#10;Given an array of integers...&#10;&#10;## Examples&#10;&#10;```&#10;Input: [1, 2, 3]&#10;Output: 6&#10;```"
              required
            />
            <p className="text-xs text-muted-foreground">
              Use Markdown formatting for better readability
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-600 text-sm">
              Failed to create problem. Please try again.
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create Problem"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/problems")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
