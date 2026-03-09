"use client";

import type { AdminTestCase, AdminTestMessage } from "@feelwell/database";
import {
  AlertTriangleIcon,
  BotIcon,
  PencilIcon,
  PlusIcon,
  SendIcon,
  TagIcon,
  TrashIcon,
  UploadIcon,
  UserIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/lib/core-ui/select";
import { Textarea } from "@/lib/core-ui/textarea";
import { H3, Muted, P } from "@/lib/core-ui/typography";
import {
  addTestMessageAction,
  bulkImportTestCasesAction,
  createTestCaseAction,
  deleteTestCaseAction,
  deleteTestMessageAction,
  getTestCasesWithLastMessageAction,
  getTestCaseWithMessagesAction,
  updateTestCaseAction,
  updateTestMessageAction,
} from "../../actions";

interface TestManagerProps {
  initialTestCases: TestCaseWithWarning[];
}

interface TestCaseWithMessages extends AdminTestCase {
  messages: AdminTestMessage[];
}

interface TestCaseWithWarning extends AdminTestCase {
  endsWithAssistantMessage: boolean;
}

export function TestManager({ initialTestCases }: TestManagerProps) {
  const [testCases, setTestCases] =
    useState<TestCaseWithWarning[]>(initialTestCases);
  const [selectedTestCase, setSelectedTestCase] =
    useState<TestCaseWithMessages | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditTestCaseDialogOpen, setIsEditTestCaseDialogOpen] =
    useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  // Form state for creating new test case
  const [newTestName, setNewTestName] = useState("");
  const [newTestDescription, setNewTestDescription] = useState("");
  const [newTestCategory, setNewTestCategory] = useState("");

  // Form state for editing test case
  const [editTestName, setEditTestName] = useState("");
  const [editTestDescription, setEditTestDescription] = useState("");
  const [editTestCategory, setEditTestCategory] = useState("");

  // Bulk import state
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importJson, setImportJson] = useState("");
  const [importResults, setImportResults] = useState<Array<{
    name: string;
    success: boolean;
    error?: string;
  }> | null>(null);

  // Message editing state
  const [editedMessageContent, setEditedMessageContent] = useState("");
  const [newMessageContent, setNewMessageContent] = useState("");
  const [newMessageRole, setNewMessageRole] = useState<"user" | "assistant">(
    "user",
  );

  const refreshTestCases = async () => {
    const updatedTestCases = await getTestCasesWithLastMessageAction();
    setTestCases(updatedTestCases);
  };

  const loadTestCaseWithMessages = async (testCaseId: string) => {
    const testCaseWithMessages =
      await getTestCaseWithMessagesAction(testCaseId);
    if (testCaseWithMessages) {
      setSelectedTestCase(testCaseWithMessages);
    }
  };

  const handleSelectTestCase = async (testCase: AdminTestCase) => {
    setLoading(true);
    try {
      await loadTestCaseWithMessages(testCase.id);
    } catch (error) {
      console.error("Failed to load test case:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTestCase = async () => {
    if (!newTestName.trim()) return;

    setLoading(true);
    try {
      await createTestCaseAction({
        name: newTestName,
        description: newTestDescription,
        category: newTestCategory,
      });

      setNewTestName("");
      setNewTestDescription("");
      setNewTestCategory("");
      setIsCreateDialogOpen(false);
      await refreshTestCases();
    } catch (error) {
      console.error("Failed to create test case:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTestCase = () => {
    if (!selectedTestCase) return;
    setEditTestName(selectedTestCase.name);
    setEditTestDescription(selectedTestCase.description || "");
    setEditTestCategory(selectedTestCase.category || "");
    setIsEditTestCaseDialogOpen(true);
  };

  const handleUpdateTestCase = async () => {
    if (!selectedTestCase || !editTestName.trim()) return;

    setLoading(true);
    try {
      await updateTestCaseAction(selectedTestCase.id, {
        name: editTestName,
        description: editTestDescription,
        category: editTestCategory,
      });

      setIsEditTestCaseDialogOpen(false);
      await refreshTestCases();
      await loadTestCaseWithMessages(selectedTestCase.id);
    } catch (error) {
      console.error("Failed to update test case:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTestCase = async (testCaseId: string) => {
    if (!confirm("Are you sure you want to delete this test case?")) return;

    setLoading(true);
    try {
      await deleteTestCaseAction(testCaseId);
      await refreshTestCases();

      if (selectedTestCase?.id === testCaseId) {
        setSelectedTestCase(null);
      }
    } catch (error) {
      console.error("Failed to delete test case:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMessage = async () => {
    if (!selectedTestCase || !newMessageContent.trim()) return;

    setLoading(true);
    try {
      await addTestMessageAction({
        testCaseId: selectedTestCase.id,
        role: newMessageRole,
        content: newMessageContent,
      });

      setNewMessageContent("");
      // Smart default: switch role for next message
      setNewMessageRole(newMessageRole === "user" ? "assistant" : "user");
      await loadTestCaseWithMessages(selectedTestCase.id);
    } catch (error) {
      console.error("Failed to add message:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditMessage = (message: AdminTestMessage) => {
    setEditingMessageId(message.id);
    setEditedMessageContent(message.content);
  };

  const handleSaveMessageEdit = async () => {
    if (!editingMessageId || !editedMessageContent.trim()) return;

    setLoading(true);
    try {
      await updateTestMessageAction(editingMessageId, {
        content: editedMessageContent,
      });

      setEditingMessageId(null);
      setEditedMessageContent("");
      if (selectedTestCase) {
        await loadTestCaseWithMessages(selectedTestCase.id);
      }
    } catch (error) {
      console.error("Failed to update message:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;

    setLoading(true);
    try {
      await deleteTestMessageAction(messageId);
      if (selectedTestCase) {
        await loadTestCaseWithMessages(selectedTestCase.id);
      }
    } catch (error) {
      console.error("Failed to delete message:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkImport = async () => {
    if (!importJson.trim()) return;

    setLoading(true);
    setImportResults(null);

    try {
      const parsed = JSON.parse(importJson);
      const testCasesArray = Array.isArray(parsed) ? parsed : [parsed];

      const results = await bulkImportTestCasesAction(testCasesArray);
      setImportResults(results);

      // If all successful, clear and refresh
      if (results.every((r) => r.success)) {
        setImportJson("");
        await refreshTestCases();
      }
    } catch (error) {
      setImportResults([
        {
          name: "Parse Error",
          success: false,
          error: error instanceof Error ? error.message : "Invalid JSON format",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Check if a test case ends with an assistant message
  const endsWithAssistantMessage = useCallback(
    (testCase: TestCaseWithWarning | TestCaseWithMessages): boolean => {
      // For the list view (TestCaseWithWarning), use the precomputed flag
      if ("endsWithAssistantMessage" in testCase) {
        return testCase.endsWithAssistantMessage;
      }
      // For the detail view (TestCaseWithMessages), check the actual messages
      const messages = "messages" in testCase ? testCase.messages : undefined;
      if (!messages || messages.length === 0) {
        return false;
      }
      const lastMessage = messages[messages.length - 1];
      return lastMessage?.role === "assistant";
    },
    [],
  );

  // Smart default role based on last message
  const getSmartDefaultRole = useCallback((): "user" | "assistant" => {
    if (!selectedTestCase?.messages || selectedTestCase.messages.length === 0) {
      return "user";
    }
    const lastMessage =
      selectedTestCase.messages[selectedTestCase.messages.length - 1];
    return lastMessage?.role === "user" ? "assistant" : "user";
  }, [selectedTestCase?.messages]);

  useEffect(() => {
    if (selectedTestCase?.messages) {
      setNewMessageRole(getSmartDefaultRole());
    }
  }, [selectedTestCase?.messages, getSmartDefaultRole]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <H3 className="text-gray-900">Test Case Management</H3>
          <P className="text-gray-500 text-sm">
            Create and manage test conversations for evaluating AI responses.
          </P>
        </div>

        <div className="flex gap-2">
          <Dialog
            open={isImportDialogOpen}
            onOpenChange={setIsImportDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline">
                <UploadIcon className="mr-2 h-4 w-4" />
                Import JSON
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Bulk Import Test Cases</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="import-json">Paste JSON</Label>
                  <Textarea
                    id="import-json"
                    value={importJson}
                    onChange={(e) => setImportJson(e.target.value)}
                    placeholder={`[
  {
    "name": "Test Case Name",
    "description": "Optional description",
    "category": "Academic Support",
    "messages": [
      { "role": "user", "content": "User message here" },
      { "role": "assistant", "content": "Assistant response here" }
    ]
  }
]`}
                    rows={12}
                    className="font-mono text-sm"
                  />
                </div>

                {importResults && (
                  <div className="space-y-2">
                    <Label>Import Results</Label>
                    <div className="max-h-32 overflow-y-auto rounded border p-2">
                      {importResults.map((result) => (
                        <div
                          key={result.name}
                          className={`text-sm ${result.success ? "text-green-600" : "text-red-600"}`}
                        >
                          {result.success ? "✓" : "✗"} {result.name}
                          {result.error && (
                            <span className="text-gray-500">
                              {" "}
                              - {result.error}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsImportDialogOpen(false);
                      setImportJson("");
                      setImportResults(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleBulkImport}
                    disabled={loading || !importJson.trim()}
                  >
                    Import
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className="mr-2 h-4 w-4" />
                New Test Case
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Test Case</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newTestName}
                    onChange={(e) => setNewTestName(e.target.value)}
                    placeholder="Enter test case name..."
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    value={newTestDescription}
                    onChange={(e) => setNewTestDescription(e.target.value)}
                    placeholder="Enter description..."
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category (Optional)</Label>
                  <Input
                    id="category"
                    value={newTestCategory}
                    onChange={(e) => setNewTestCategory(e.target.value)}
                    placeholder="e.g., crisis scenarios, academic help..."
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTestCase} disabled={loading}>
                    Create Test Case
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Edit Test Case Dialog */}
        <Dialog
          open={isEditTestCaseDialogOpen}
          onOpenChange={setIsEditTestCaseDialogOpen}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Test Case</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editTestName}
                  onChange={(e) => setEditTestName(e.target.value)}
                  placeholder="Enter test case name..."
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description (Optional)</Label>
                <Input
                  id="edit-description"
                  value={editTestDescription}
                  onChange={(e) => setEditTestDescription(e.target.value)}
                  placeholder="Enter description..."
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Category (Optional)</Label>
                <Input
                  id="edit-category"
                  value={editTestCategory}
                  onChange={(e) => setEditTestCategory(e.target.value)}
                  placeholder="e.g., crisis scenarios, academic help..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditTestCaseDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdateTestCase} disabled={loading}>
                  Update Test Case
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Test Cases List */}
        <div className="lg:col-span-1">
          <Card className="border-gray-200 bg-white shadow-sm">
            <CardHeader className="border-gray-100 border-b">
              <CardTitle className="text-gray-900 text-lg">
                Test Cases
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-4">
              {testCases.length === 0 ? (
                <P className="py-4 text-center text-gray-400">
                  No test cases created yet
                </P>
              ) : (
                testCases.map((testCase) => (
                  <div
                    key={testCase.id}
                    className={`cursor-pointer rounded-lg border p-3 transition-all ${
                      selectedTestCase?.id === testCase.id
                        ? "border-gray-300 bg-gray-50 shadow-sm"
                        : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                    }`}
                    onClick={() => handleSelectTestCase(testCase)}
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{testCase.name}</span>
                        {endsWithAssistantMessage(testCase) && (
                          <div title="⚠️ Test case ends with assistant message. Test Prompt mode will generate assistant-to-assistant responses.">
                            <AlertTriangleIcon className="h-4 w-4 text-amber-500" />
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTestCase(testCase.id);
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <TrashIcon className="h-3 w-3" />
                      </Button>
                    </div>
                    {testCase.description && (
                      <Muted className="mb-1 text-xs">
                        {testCase.description}
                      </Muted>
                    )}
                    {testCase.category && (
                      <div className="mb-1 flex items-center gap-1">
                        <TagIcon className="h-3 w-3" />
                        <Badge variant="secondary" className="text-xs">
                          {testCase.category}
                        </Badge>
                      </div>
                    )}
                    <Muted className="text-xs">
                      Created{" "}
                      {new Date(testCase.createdAt).toLocaleDateString()}
                    </Muted>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-2">
          {selectedTestCase ? (
            <Card className="border-gray-200 bg-white shadow-sm">
              <CardHeader className="border-gray-100 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-gray-900">
                      {selectedTestCase.name}
                    </CardTitle>
                    {selectedTestCase.description && (
                      <P className="text-gray-500 text-sm">
                        {selectedTestCase.description}
                      </P>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedTestCase.category && (
                      <Badge variant="outline">
                        <TagIcon className="mr-1 h-3 w-3" />
                        {selectedTestCase.category}
                      </Badge>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEditTestCase}
                    >
                      <PencilIcon className="mr-1 h-4 w-4" />
                      Edit Details
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Warning Banner */}
                {endsWithAssistantMessage(selectedTestCase) && (
                  <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangleIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                      <div className="space-y-1">
                        <p className="font-medium text-amber-800 text-sm">
                          Test Case Ends with Assistant Message
                        </p>
                        <p className="text-amber-700 text-sm">
                          ⚠️ Test case ends with assistant message. Test Prompt
                          mode will generate assistant-to-assistant responses.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Messages */}
                <div className="max-h-96 space-y-3 overflow-y-auto">
                  {selectedTestCase.messages?.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.role === "assistant"
                          ? "justify-start"
                          : "justify-end"
                      }`}
                    >
                      <div
                        className={`flex max-w-[80%] gap-2 ${
                          message.role === "assistant"
                            ? "flex-row"
                            : "flex-row-reverse"
                        }`}
                      >
                        <div className="flex-shrink-0">
                          {message.role === "assistant" ? (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                              <BotIcon className="h-4 w-4" />
                            </div>
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                              <UserIcon className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        <div
                          className={`rounded-lg p-3 ${
                            message.role === "assistant"
                              ? "bg-muted"
                              : "bg-primary text-primary-foreground"
                          }`}
                        >
                          {editingMessageId === message.id ? (
                            <div className="space-y-2">
                              <Textarea
                                value={editedMessageContent}
                                onChange={(e) =>
                                  setEditedMessageContent(e.target.value)
                                }
                                rows={3}
                                className="text-sm"
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={handleSaveMessageEdit}
                                >
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => setEditingMessageId(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="group relative">
                              <p className="whitespace-pre-wrap text-sm">
                                {message.content}
                              </p>
                              <div className="-top-2 -right-2 absolute opacity-0 transition-opacity group-hover:opacity-100">
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleEditMessage(message)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <PencilIcon className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      handleDeleteMessage(message.id)
                                    }
                                    className="h-6 w-6 p-0 text-destructive"
                                  >
                                    <TrashIcon className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Message Form */}
                <div className="border-t pt-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Select
                        value={newMessageRole}
                        onValueChange={(value: "user" | "assistant") =>
                          setNewMessageRole(value)
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="assistant">Assistant</SelectItem>
                        </SelectContent>
                      </Select>
                      <Muted className="text-xs">
                        {getSmartDefaultRole() === newMessageRole
                          ? "Suggested"
                          : "Override"}
                      </Muted>
                    </div>
                    <div className="flex gap-2">
                      <Textarea
                        value={newMessageContent}
                        onChange={(e) => setNewMessageContent(e.target.value)}
                        placeholder="Type a message..."
                        rows={2}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleAddMessage}
                        disabled={!newMessageContent.trim() || loading}
                        size="sm"
                      >
                        <SendIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-gray-200 bg-white shadow-sm">
              <CardContent className="flex h-96 items-center justify-center">
                <div className="text-center">
                  <P className="text-gray-400">
                    Select a test case from the list to view and edit messages
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
