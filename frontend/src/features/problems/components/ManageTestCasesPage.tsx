import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useProblem,
  useTestCases,
  useBulkCreateTestCases,
  useDeleteTestCase,
  useUpdateTestCase,
} from "@/features/problems/hooks/useProblems";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { logger } from "@/lib/logger";
import type { TestCaseWithId } from "@/features/problems/api";

interface NewTestCase {
  input: string;
  expectedOutput: string;
}

export function ManageTestCasesPage() {
  const navigate = useNavigate();
  const { pid } = useParams<{ pid: string }>();
  const problemId = Number(pid);

  const { data: problemData, isLoading: loadingProblem } =
    useProblem(problemId);
  const { data: testCasesData, isLoading: loadingTestCases } =
    useTestCases(problemId);
  const { mutateAsync: createTestCases, isPending: isCreating } =
    useBulkCreateTestCases(problemId);
  const { mutateAsync: deleteTestCase, isPending: isDeleting } =
    useDeleteTestCase(problemId);
  const { mutateAsync: updateTestCase, isPending: isUpdating } =
    useUpdateTestCase(problemId);

  const [newTestCases, setNewTestCases] = useState<NewTestCase[]>([
    { input: "", expectedOutput: "" },
  ]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<NewTestCase>({
    input: "",
    expectedOutput: "",
  });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const existingTestCases = testCasesData?.testcases || [];

  const addNewTestCase = () => {
    setNewTestCases([...newTestCases, { input: "", expectedOutput: "" }]);
  };

  const removeNewTestCase = (index: number) => {
    if (newTestCases.length > 1) {
      setNewTestCases(newTestCases.filter((_, i) => i !== index));
    }
  };

  const updateNewTestCase = (
    index: number,
    field: "input" | "expectedOutput",
    value: string
  ) => {
    const updated = [...newTestCases];
    updated[index][field] = value;
    setNewTestCases(updated);
  };

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");

    const validTestCases = newTestCases.filter(
      (tc) => tc.input.trim() || tc.expectedOutput.trim()
    );

    if (validTestCases.length === 0) {
      return;
    }

    try {
      const result = await createTestCases({
        pid: problemId,
        cases: validTestCases,
      });

      setSuccessMessage(
        `Successfully created ${result.created} test case${
          result.created !== 1 ? "s" : ""
        }!`
      );
      setNewTestCases([{ input: "", expectedOutput: "" }]);
    } catch (err) {
      logger.error("Failed to create test cases:", err);
    }
  };

  const startEdit = (testCase: TestCaseWithId) => {
    setEditingId(testCase.id);
    setEditForm({
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ input: "", expectedOutput: "" });
  };

  const handleUpdate = async (id: string) => {
    try {
      await updateTestCase({ id, data: editForm });
      setSuccessMessage("Test case updated successfully!");
      setEditingId(null);
    } catch (err) {
      logger.error("Failed to update test case:", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTestCase(id);
      setSuccessMessage("Test case deleted successfully!");
      setDeleteConfirmId(null);
    } catch (err) {
      logger.error("Failed to delete test case:", err);
    }
  };

  const handleBackButton = () => {
    navigate(-1);
  };

  if (loadingProblem) {
    return (
      <div className="container max-w-5xl mx-auto p-6">
        <div className="text-muted-foreground">Loading problem...</div>
      </div>
    );
  }

  if (!problemData?.problem) {
    return (
      <div className="container max-w-5xl mx-auto p-6">
        <div className="text-red-600">Problem not found</div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Manage Test Cases</h1>
        <p className="text-muted-foreground mb-4">
          Problem #{problemId}: {problemData.problem.title}
        </p>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={handleBackButton}>
            ← Back
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/problems/${problemId}/edit`)}
          >
            Edit Problem
          </Button>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-3 rounded bg-green-500/10 border border-green-500/20 text-green-600 text-sm">
          {successMessage}
        </div>
      )}

      {/* Add New Test Cases */}
      <Card className="p-6">
        <form onSubmit={handleCreateNew} className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Add New Test Cases</h2>
              <Button type="button" onClick={addNewTestCase} variant="outline">
                + Add Another
              </Button>
            </div>

            {newTestCases.map((testCase, index) => (
              <Card key={index} className="p-4 bg-muted/30">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium">New Test Case #{index + 1}</h3>
                  {newTestCases.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeNewTestCase(index)}
                      className="text-red-600 hover:bg-red-500/10"
                    >
                      Remove
                    </Button>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`new-input-${index}`}>Input (stdin)</Label>
                    <textarea
                      id={`new-input-${index}`}
                      value={testCase.input}
                      onChange={(e) =>
                        updateNewTestCase(index, "input", e.target.value)
                      }
                      className="w-full min-h-[120px] px-3 py-2 rounded border border-input bg-background font-mono text-sm"
                      placeholder="1 2&#10;3 4"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`new-output-${index}`}>
                      Expected Output (stdout)
                    </Label>
                    <textarea
                      id={`new-output-${index}`}
                      value={testCase.expectedOutput}
                      onChange={(e) =>
                        updateNewTestCase(
                          index,
                          "expectedOutput",
                          e.target.value
                        )
                      }
                      className="w-full min-h-[120px] px-3 py-2 rounded border border-input bg-background font-mono text-sm"
                      placeholder="3&#10;7"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Test Cases"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/problems/${problemId}`)}
            >
              Done
            </Button>
          </div>
        </form>
      </Card>

      {/* Existing Test Cases */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Existing Test Cases ({existingTestCases.length})
          </h2>
        </div>

        {loadingTestCases ? (
          <div className="text-muted-foreground">Loading test cases...</div>
        ) : existingTestCases.length === 0 ? (
          <Card className="p-6">
            <p className="text-muted-foreground text-center">
              No test cases yet. Add some below!
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {existingTestCases.map((testCase, index) => (
              <Card key={testCase.id} className="p-4">
                {editingId === testCase.id ? (
                  // Edit Mode
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium">
                        Editing Test Case #{index + 1}
                      </h3>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleUpdate(testCase.id)}
                          disabled={isUpdating}
                        >
                          {isUpdating ? "Saving..." : "Save"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEdit}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Input (stdin)</Label>
                        <textarea
                          value={editForm.input}
                          onChange={(e) =>
                            setEditForm({ ...editForm, input: e.target.value })
                          }
                          className="w-full min-h-[120px] px-3 py-2 rounded border border-input bg-background font-mono text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Expected Output (stdout)</Label>
                        <textarea
                          value={editForm.expectedOutput}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              expectedOutput: e.target.value,
                            })
                          }
                          className="w-full min-h-[120px] px-3 py-2 rounded border border-input bg-background font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium">Test Case #{index + 1}</h3>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEdit(testCase)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDeleteConfirmId(testCase.id)}
                          className="text-red-600 hover:bg-red-500/10"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">
                          Input
                        </Label>
                        <pre className="p-3 rounded bg-muted/50 border text-sm font-mono whitespace-pre-wrap break-all">
                          {testCase.input || "(empty)"}
                        </pre>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">
                          Expected Output
                        </Label>
                        <pre className="p-3 rounded bg-muted/50 border text-sm font-mono whitespace-pre-wrap break-all">
                          {testCase.expectedOutput || "(empty)"}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md">
            <h2 className="text-xl font-bold mb-4">Delete Test Case?</h2>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete this test case? This action cannot
              be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmId(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      <div className="mt-6 p-4 rounded bg-muted/30 text-sm text-muted-foreground">
        <h3 className="font-medium mb-2">Tips:</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>
            Test cases are evaluated with exact string matching (including
            whitespace)
          </li>
          <li>Input is provided to the program via stdin</li>
          <li>Output is captured from stdout</li>
          <li>You can edit or delete existing test cases anytime</li>
          <li>Add multiple new test cases at once</li>
        </ul>
      </div>
    </div>
  );
}
