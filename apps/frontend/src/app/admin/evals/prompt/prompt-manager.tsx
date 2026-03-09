"use client";

import type { AdminPrompt } from "@feelwell/database";
import {
  CheckIcon,
  PencilIcon,
  PlusIcon,
  StarIcon,
  TrashIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
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
  createPromptAction,
  deletePromptAction,
  getPromptsAction,
  setActivePromptAction,
  updatePromptAction,
} from "../../actions";

interface PromptManagerProps {
  initialPrompts: AdminPrompt[];
}

export function PromptManager({ initialPrompts }: PromptManagerProps) {
  const [prompts, setPrompts] = useState<AdminPrompt[]>(initialPrompts);
  const [selectedPrompt, setSelectedPrompt] = useState<AdminPrompt | null>(
    initialPrompts.find((p) => p.isActive) || initialPrompts[0] || null,
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");

  // Form state for creating new prompt
  const [newPromptName, setNewPromptName] = useState("");
  const [newPromptDescription, setNewPromptDescription] = useState("");
  const [newPromptContent, setNewPromptContent] = useState("");

  useEffect(() => {
    if (selectedPrompt) {
      setEditedContent(selectedPrompt.content);
      setEditedTitle(selectedPrompt.name);
    }
  }, [selectedPrompt]);

  const refreshPrompts = async () => {
    const updatedPrompts = await getPromptsAction();
    setPrompts(updatedPrompts);
    // Update selected prompt if it still exists
    if (selectedPrompt) {
      const updatedSelected = updatedPrompts.find(
        (p) => p.id === selectedPrompt.id,
      );
      setSelectedPrompt(updatedSelected || updatedPrompts[0] || null);
    }
  };

  const handleCreatePrompt = async () => {
    if (!newPromptName.trim() || !newPromptContent.trim()) return;

    setLoading(true);
    try {
      await createPromptAction({
        name: newPromptName,
        description: newPromptDescription,
        content: newPromptContent,
      });

      setNewPromptName("");
      setNewPromptDescription("");
      setNewPromptContent("");
      setIsCreateDialogOpen(false);
      await refreshPrompts();
    } catch (error) {
      console.error("Failed to create prompt:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedPrompt || !editedContent.trim()) return;

    setLoading(true);
    try {
      await updatePromptAction(selectedPrompt.id, {
        content: editedContent,
      });
      setIsEditing(false);
      await refreshPrompts();
    } catch (error) {
      console.error("Failed to update prompt:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTitleEdit = async () => {
    if (!selectedPrompt || !editedTitle.trim()) return;

    setLoading(true);
    try {
      await updatePromptAction(selectedPrompt.id, {
        name: editedTitle,
      });
      setIsEditingTitle(false);
      await refreshPrompts();
    } catch (error) {
      console.error("Failed to update prompt title:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetActive = async (promptId: string) => {
    setLoading(true);
    try {
      await setActivePromptAction(promptId);
      await refreshPrompts();
    } catch (error) {
      console.error("Failed to set active prompt:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (promptId: string) => {
    if (!confirm("Are you sure you want to delete this prompt?")) return;

    setLoading(true);
    try {
      await deletePromptAction(promptId);
      await refreshPrompts();

      // If deleted prompt was selected, select another one
      if (selectedPrompt?.id === promptId) {
        const remainingPrompts = prompts.filter((p) => p.id !== promptId);
        setSelectedPrompt(remainingPrompts[0] || null);
      }
    } catch (error) {
      console.error("Failed to delete prompt:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <H3 className="text-gray-900">Prompt Management</H3>
          <P className="text-gray-500 text-sm">
            Manage system prompts. The active prompt will be used by other admin
            tools.
          </P>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gray-900 text-white hover:bg-gray-800">
              <PlusIcon className="mr-2 h-4 w-4" />
              New Prompt
            </Button>
          </DialogTrigger>
          <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col border-gray-200 bg-white">
            <DialogHeader>
              <DialogTitle>Create New Prompt</DialogTitle>
            </DialogHeader>
            <div className="flex-1 space-y-4 overflow-y-auto px-1">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newPromptName}
                  onChange={(e) => setNewPromptName(e.target.value)}
                  placeholder="Enter prompt name..."
                />
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  value={newPromptDescription}
                  onChange={(e) => setNewPromptDescription(e.target.value)}
                  placeholder="Enter description..."
                />
              </div>
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={newPromptContent}
                  onChange={(e) => setNewPromptContent(e.target.value)}
                  placeholder="Enter prompt content..."
                  rows={15}
                  className="resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t pt-4">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreatePrompt} disabled={loading}>
                Create Prompt
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Prompts List */}
        <div className="lg:col-span-1">
          <Card className="border-gray-200 bg-white shadow-sm">
            <CardHeader className="border-gray-100 border-b">
              <CardTitle className="text-gray-900 text-lg">
                Available Prompts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-4">
              {prompts.length === 0 ? (
                <P className="py-4 text-center text-gray-400">
                  No prompts created yet
                </P>
              ) : (
                prompts.map((prompt) => (
                  <div
                    key={prompt.id}
                    className={`cursor-pointer rounded-lg border p-3 transition-all ${
                      selectedPrompt?.id === prompt.id
                        ? "border-gray-300 bg-gray-50 shadow-sm"
                        : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedPrompt(prompt)}
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span className="font-medium text-gray-900">
                        {prompt.name}
                      </span>
                      <div className="flex items-center gap-1">
                        {prompt.isActive && (
                          <Badge className="bg-gray-900 text-white text-xs">
                            <StarIcon className="mr-1 h-3 w-3" />
                            Active
                          </Badge>
                        )}
                      </div>
                    </div>
                    {prompt.description && (
                      <Muted className="text-gray-500 text-xs">
                        {prompt.description}
                      </Muted>
                    )}
                    <Muted className="text-gray-400 text-xs">
                      Created {new Date(prompt.createdAt).toLocaleDateString()}
                    </Muted>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Editor */}
        <div className="lg:col-span-2">
          {selectedPrompt ? (
            <Card className="border-gray-200 bg-white shadow-sm">
              <CardHeader className="border-gray-100 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {isEditingTitle ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editedTitle}
                          onChange={(e) => setEditedTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleSaveTitleEdit();
                            } else if (e.key === "Escape") {
                              setIsEditingTitle(false);
                              setEditedTitle(selectedPrompt.name);
                            }
                          }}
                          className="font-semibold text-lg"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          onClick={handleSaveTitleEdit}
                          disabled={loading}
                        >
                          <CheckIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setIsEditingTitle(false);
                            setEditedTitle(selectedPrompt.name);
                          }}
                        >
                          ✕
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CardTitle
                          className="cursor-pointer"
                          onClick={() => setIsEditingTitle(true)}
                        >
                          {selectedPrompt.name}
                        </CardTitle>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setIsEditingTitle(true)}
                          className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                        >
                          <PencilIcon className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    {selectedPrompt.description && (
                      <P className="text-muted-foreground text-sm">
                        {selectedPrompt.description}
                      </P>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!selectedPrompt.isActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetActive(selectedPrompt.id)}
                        disabled={loading}
                      >
                        <CheckIcon className="mr-1 h-4 w-4" />
                        Set Active
                      </Button>
                    )}
                    {isEditing ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIsEditing(false);
                            setEditedContent(selectedPrompt.content);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveEdit}
                          disabled={loading}
                        >
                          Save
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditing(true)}
                        >
                          <PencilIcon className="mr-1 h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(selectedPrompt.id)}
                          disabled={loading}
                        >
                          <TrashIcon className="mr-1 h-4 w-4" />
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    rows={20}
                    className="font-mono text-sm"
                    placeholder="Enter prompt content..."
                  />
                ) : (
                  <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                    <pre className="whitespace-pre-wrap font-mono text-gray-700 text-sm">
                      {selectedPrompt.content}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-gray-200 bg-white shadow-sm">
              <CardContent className="flex h-96 items-center justify-center">
                <div className="text-center">
                  <P className="text-gray-400">
                    Select a prompt from the list to view and edit
                  </P>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
