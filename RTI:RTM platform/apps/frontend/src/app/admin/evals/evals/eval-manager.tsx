"use client";

import type { AdminEval } from "@feelwell/database";
import { PencilIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/lib/core-ui/badge";
import { Button } from "@/lib/core-ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/core-ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/lib/core-ui/dialog";
import { Input } from "@/lib/core-ui/input";
import { Label } from "@/lib/core-ui/label";
import { Textarea } from "@/lib/core-ui/textarea";
import { H3, Muted, P } from "@/lib/core-ui/typography";
import {
  createEvalAction,
  deleteEvalAction,
  getEvalsAction,
  updateEvalAction,
} from "../../actions";

interface EvalManagerProps {
  initialEvals: AdminEval[];
}

export function EvalManager({ initialEvals }: EvalManagerProps) {
  const [evals, setEvals] = useState<AdminEval[]>(initialEvals);
  const [selectedEval, setSelectedEval] = useState<AdminEval | null>(
    initialEvals[0] || null,
  );
  const [loading, setLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Form state for creating new eval
  const [newEvalName, setNewEvalName] = useState("");
  const [newEvalDescription, setNewEvalDescription] = useState("");

  // Form state for editing eval
  const [editEvalName, setEditEvalName] = useState("");
  const [editEvalDescription, setEditEvalDescription] = useState("");

  const refreshEvals = async () => {
    const updatedEvals = await getEvalsAction();
    setEvals(updatedEvals);
    // Update selected eval if it still exists
    if (selectedEval) {
      const updatedSelected = updatedEvals.find(
        (e) => e.id === selectedEval.id,
      );
      setSelectedEval(updatedSelected || updatedEvals[0] || null);
    }
  };

  const handleCreateEval = async () => {
    if (!newEvalName.trim() || !newEvalDescription.trim()) return;

    setLoading(true);
    try {
      await createEvalAction({
        name: newEvalName,
        description: newEvalDescription,
      });

      setNewEvalName("");
      setNewEvalDescription("");
      setIsCreateDialogOpen(false);
      await refreshEvals();
    } catch (error) {
      console.error("Failed to create eval:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditEval = (eval_: AdminEval) => {
    setEditEvalName(eval_.name);
    setEditEvalDescription(eval_.description);
    setIsEditDialogOpen(true);
  };

  const handleUpdateEval = async () => {
    if (!selectedEval || !editEvalName.trim() || !editEvalDescription.trim())
      return;

    setLoading(true);
    try {
      await updateEvalAction(selectedEval.id, {
        name: editEvalName,
        description: editEvalDescription,
      });

      setIsEditDialogOpen(false);
      await refreshEvals();
    } catch (error) {
      console.error("Failed to update eval:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEval = async (evalId: string) => {
    if (!confirm("Are you sure you want to delete this evaluation criteria?"))
      return;

    setLoading(true);
    try {
      await deleteEvalAction(evalId);
      await refreshEvals();

      // If deleted eval was selected, select another one
      if (selectedEval?.id === evalId) {
        const remainingEvals = evals.filter((e) => e.id !== evalId);
        setSelectedEval(remainingEvals[0] || null);
      }
    } catch (error) {
      console.error("Failed to delete eval:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <H3 className="text-gray-900">Evaluation Criteria Management</H3>
          <P className="text-gray-500 text-sm">
            Define evaluation criteria that will be used to judge AI responses.
          </P>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gray-900 text-white hover:bg-gray-800">
              <PlusIcon className="mr-2 h-4 w-4" />
              New Evaluation Criteria
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Evaluation Criteria</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newEvalName}
                  onChange={(e) => setNewEvalName(e.target.value)}
                  placeholder="e.g., Concise, Helpful, Safe..."
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newEvalDescription}
                  onChange={(e) => setNewEvalDescription(e.target.value)}
                  placeholder="Detailed explanation of what this criteria evaluates..."
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateEval} disabled={loading}>
                  Create Criteria
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Evals List */}
        <div className="lg:col-span-1">
          <Card className="border-gray-200 bg-white shadow-sm">
            <CardHeader className="border-gray-100 border-b">
              <CardTitle className="text-gray-900 text-lg">
                Evaluation Criteria
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-4">
              {evals.length === 0 ? (
                <P className="py-4 text-center text-gray-400">
                  No evaluation criteria created yet
                </P>
              ) : (
                evals.map((eval_) => (
                  <div
                    key={eval_.id}
                    className={`cursor-pointer rounded-lg border p-3 transition-all ${
                      selectedEval?.id === eval_.id
                        ? "border-gray-300 bg-gray-50 shadow-sm"
                        : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedEval(eval_)}
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span className="font-medium">{eval_.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteEval(eval_.id);
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <TrashIcon className="h-3 w-3" />
                      </Button>
                    </div>
                    <Muted className="text-xs">
                      Created {new Date(eval_.createdAt).toLocaleDateString()}
                    </Muted>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Details View */}
        <div className="lg:col-span-2">
          {selectedEval ? (
            <Card className="border-gray-200 bg-white shadow-sm">
              <CardHeader className="border-gray-100 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-gray-900">
                      {selectedEval.name}
                    </CardTitle>
                    <Badge variant="outline" className="mt-1">
                      Evaluation Criteria
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditEval(selectedEval)}
                  >
                    <PencilIcon className="mr-1 h-4 w-4" />
                    Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                  <h4 className="mb-2 font-medium text-gray-900">
                    Description
                  </h4>
                  <p className="whitespace-pre-wrap text-gray-700 text-sm">
                    {selectedEval.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-gray-200 bg-white shadow-sm">
              <CardContent className="flex h-96 items-center justify-center">
                <div className="text-center">
                  <P className="text-gray-400">
                    Select an evaluation criteria from the list to view details
                  </P>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Evaluation Criteria</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editEvalName}
                onChange={(e) => setEditEvalName(e.target.value)}
                placeholder="e.g., Concise, Helpful, Safe..."
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editEvalDescription}
                onChange={(e) => setEditEvalDescription(e.target.value)}
                placeholder="Detailed explanation of what this criteria evaluates..."
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateEval} disabled={loading}>
                Update Criteria
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
