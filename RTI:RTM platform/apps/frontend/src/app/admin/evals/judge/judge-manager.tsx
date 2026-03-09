"use client";

import type { AdminEval, AdminPrompt, AdminTestCase } from "@feelwell/database";
import { useAtom } from "jotai";
import {
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  Play,
  XIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/lib/core-ui/badge";
import { Button } from "@/lib/core-ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/core-ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/lib/core-ui/dialog";
import { Label } from "@/lib/core-ui/label";
import { RadioGroup, RadioGroupItem } from "@/lib/core-ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/lib/core-ui/select";
import { cn } from "@/lib/tailwind-utils";
import {
  evaluateSingleTestCaseAction,
  getActivePromptAction,
  getEvalsAction,
  getPromptsAction,
  getTestCasesAction,
  getTestCaseWithMessagesAction,
  setActivePromptAction,
  testCurrentPromptAction,
} from "../../actions";
import {
  activeTabIdAtom,
  type EvaluationTab,
  evaluationTabsAtom,
  type JudgeResult,
  judgeResultsAtom,
  selectedEvalIdsAtom,
  selectedTestCaseIdsAtom,
} from "./atoms";
import { JUDGE_MODEL, PROMPT_MODEL } from "./models";

export function JudgeManager() {
  const [mode, setMode] = useState<"sanity-check" | "test-prompt">(
    "sanity-check",
  );
  const [evals, setEvals] = useState<AdminEval[]>([]);
  const [testCases, setTestCases] = useState<AdminTestCase[]>([]);
  const [activePrompt, setActivePrompt] = useState<AdminPrompt | null>(null);
  const [allPrompts, setAllPrompts] = useState<AdminPrompt[]>([]);
  const [isSwitchingPrompt, setIsSwitchingPrompt] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [allResults, setAllResults] = useAtom(judgeResultsAtom);
  const [selectedTestCaseIds, setSelectedTestCaseIds] = useAtom(
    selectedTestCaseIdsAtom,
  );
  const [selectedEvalIds, setSelectedEvalIds] = useAtom(selectedEvalIdsAtom);
  const hasInitializedSelections = useRef(false);

  // Tabs state for multiple evaluations
  const [evaluationTabs, setEvaluationTabs] = useAtom(evaluationTabsAtom);
  const [activeTabId, setActiveTabId] = useAtom(activeTabIdAtom);

  // Get results for current mode
  const results = allResults[mode];
  const setResults = (newResults: typeof results) => {
    setAllResults((prev) => ({
      ...prev,
      [mode]: newResults,
    }));
  };

  // Get active tab results
  const activeTab = evaluationTabs.find((tab) => tab.id === activeTabId);

  const addNewTab = (
    tabResults: JudgeResult[],
    tabMode: "sanity-check" | "test-prompt",
    promptName?: string,
  ) => {
    const newTab: EvaluationTab = {
      id: crypto.randomUUID(),
      name: `Run ${evaluationTabs.length + 1}${promptName ? ` - ${promptName}` : ""}`,
      mode: tabMode,
      results: tabResults,
      promptName,
      createdAt: new Date(),
    };
    setEvaluationTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };

  const removeTab = (tabId: string) => {
    setEvaluationTabs((prev) => prev.filter((tab) => tab.id !== tabId));
    if (activeTabId === tabId) {
      const remaining = evaluationTabs.filter((tab) => tab.id !== tabId);
      setActiveTabId(
        remaining.length > 0
          ? (remaining[remaining.length - 1]?.id ?? null)
          : null,
      );
    }
  };
  const [progress, setProgress] = useState<{
    current: number;
    total: number;
    currentTestCase: string;
  } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{
    testCase: string;
    evalName: string;
    score: number;
    reasoning: string;
  } | null>(null);
  const [responseModalOpen, setResponseModalOpen] = useState(false);
  const [responseModalData, setResponseModalData] = useState<{
    testCase: string;
    promptName: string;
    response: string;
  } | null>(null);
  const [conversationModalOpen, setConversationModalOpen] = useState(false);
  const [conversationModalData, setConversationModalData] = useState<{
    testCase: AdminTestCase;
    messages: Array<{
      id: string;
      role: "user" | "assistant";
      content: string;
      sequenceOrder: number;
    }>;
  } | null>(null);
  const [criteriaModalOpen, setCriteriaModalOpen] = useState(false);
  const [criteriaModalData, setCriteriaModalData] = useState<AdminEval | null>(
    null,
  );
  const [promptSwitchModalOpen, setPromptSwitchModalOpen] = useState(false);
  const [selectedPromptForSwitch, setSelectedPromptForSwitch] =
    useState<AdminPrompt | null>(null);

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
        const [evalsData, testCasesData, activePromptData, allPromptsData] =
          await Promise.all([
            getEvalsAction(),
            getTestCasesAction(),
            getActivePromptAction(),
            getPromptsAction(),
          ]);
        setEvals(evalsData);
        setTestCases(testCasesData);
        setActivePrompt(activePromptData || null);
        setAllPrompts(allPromptsData);

        // Initialize selections with all items only on first load
        if (!hasInitializedSelections.current) {
          setSelectedTestCaseIds(testCasesData.map((tc) => tc.id));
          setSelectedEvalIds(evalsData.map((e) => e.id));
          hasInitializedSelections.current = true;
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    }
    loadData();
  }, [setSelectedTestCaseIds, setSelectedEvalIds]);

  const handleRunEvaluation = async () => {
    if (evals.length === 0) return;

    setIsRunning(true);
    setResults([]);
    setProgress(null);

    // Get selected items only
    const selectedTestCases = testCases.filter((tc) =>
      selectedTestCaseIds.includes(tc.id),
    );
    const selectedEvals = evals.filter((e) => selectedEvalIds.includes(e.id));
    const evalIds = selectedEvals.map((e) => e.id);

    try {
      if (mode === "sanity-check") {
        // Sanity check mode - evaluate existing conversations one by one
        const results = [];
        setProgress({
          current: 0,
          total: selectedTestCases.length,
          currentTestCase: "Starting sanity check...",
        });

        for (let i = 0; i < selectedTestCases.length; i++) {
          const testCase = selectedTestCases[i];
          if (!testCase) continue;

          setProgress({
            current: i + 1,
            total: selectedTestCases.length,
            currentTestCase: testCase.name,
          });

          try {
            let result = await evaluateSingleTestCaseAction(
              testCase.id,
              evalIds,
            );

            // Retry if failed
            if (!result.success) {
              console.log(`Retrying failed test case: ${testCase.name}`);
              try {
                result = await evaluateSingleTestCaseAction(
                  testCase.id,
                  evalIds,
                );
              } catch (error) {
                console.error(`Retry failed for ${testCase.name}:`, error);
              }
            }

            results.push(result);
          } catch (error) {
            console.error(`Failed to evaluate ${testCase.name}:`, error);
            results.push({
              testCase,
              scores: {},
              success: false,
              error: error instanceof Error ? error.message : "Unknown error",
            });
          }
        }

        setResults(results);
        // Save to a new tab
        addNewTab(results, mode);
      } else {
        // Test current prompt mode - run against selected test cases
        const results = [];
        setProgress({
          current: 0,
          total: selectedTestCases.length,
          currentTestCase: "Starting prompt testing...",
        });

        for (let i = 0; i < selectedTestCases.length; i++) {
          const testCase = selectedTestCases[i];
          if (!testCase) continue;

          setProgress({
            current: i + 1,
            total: selectedTestCases.length,
            currentTestCase: testCase.name,
          });

          try {
            let result = await testCurrentPromptAction(testCase.id, evalIds);

            // Retry if failed
            if (!result.success) {
              console.log(`Retrying failed test case: ${testCase.name}`);
              try {
                result = await testCurrentPromptAction(testCase.id, evalIds);
              } catch (error) {
                console.error(`Retry failed for ${testCase.name}:`, error);
              }
            }

            results.push(result);
          } catch (error) {
            console.error(`Failed to test ${testCase.name}:`, error);
            results.push({
              testCase,
              scores: {},
              success: false,
              error: error instanceof Error ? error.message : "Unknown error",
              generatedResponse: null,
              activePrompt,
            });
          }
        }

        setResults(results);
        // Save to a new tab
        addNewTab(results, mode, activePrompt?.name);
      }
    } catch (error) {
      console.error("Failed to run evaluation:", error);
    } finally {
      setIsRunning(false);
      setProgress(null);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600 bg-green-50";
    if (score >= 6) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const handleScoreClick = (
    testCase: AdminTestCase,
    evalName: string,
    score: number,
    reasoning: string,
  ) => {
    setModalData({
      testCase: testCase.name,
      evalName,
      score,
      reasoning,
    });
    setModalOpen(true);
  };

  const handleResponseClick = (
    testCase: AdminTestCase,
    promptName: string,
    response: string,
  ) => {
    setResponseModalData({
      testCase: testCase.name,
      promptName,
      response,
    });
    setResponseModalOpen(true);
  };

  const handleTestCaseClick = async (testCase: AdminTestCase) => {
    try {
      const testCaseWithMessages = await getTestCaseWithMessagesAction(
        testCase.id,
      );
      if (testCaseWithMessages) {
        setConversationModalData({
          testCase,
          messages: testCaseWithMessages.messages,
        });
        setConversationModalOpen(true);
      }
    } catch (error) {
      console.error("Failed to load test case messages:", error);
    }
  };

  const handleCriteriaClick = (criteria: AdminEval) => {
    setCriteriaModalData(criteria);
    setCriteriaModalOpen(true);
  };

  const handlePromptSwitchRequest = (prompt: AdminPrompt) => {
    if (prompt.id === activePrompt?.id) {
      return; // Already active, no need to switch
    }
    setSelectedPromptForSwitch(prompt);
    setPromptSwitchModalOpen(true);
  };

  const handlePromptSwitchConfirm = async () => {
    if (!selectedPromptForSwitch) return;

    setIsSwitchingPrompt(true);
    try {
      await setActivePromptAction(selectedPromptForSwitch.id);
      setActivePrompt(selectedPromptForSwitch);
      setPromptSwitchModalOpen(false);
      setSelectedPromptForSwitch(null);
    } catch (error) {
      console.error("Failed to switch prompt:", error);
    } finally {
      setIsSwitchingPrompt(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Model Information - Compact */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900 text-lg">
          Evaluation Configuration
        </h2>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Prompt: {PROMPT_MODEL}
          </Badge>
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            Judge: {JUDGE_MODEL}
          </Badge>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="grid grid-cols-1 gap-6">
        <div>
          <Card className="border-gray-200 bg-white shadow-sm">
            <CardHeader className="border-gray-100 border-b">
              <CardTitle className="text-gray-900">Evaluation Mode</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={mode}
                onValueChange={(value) =>
                  setMode(value as "sanity-check" | "test-prompt")
                }
                className="space-y-4"
              >
                <div
                  className={cn(
                    "rounded-lg border-2 p-4 transition-all",
                    mode === "sanity-check"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300",
                  )}
                >
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem
                      value="sanity-check"
                      id="sanity-check"
                      className="mt-1"
                    />
                    <Label
                      htmlFor="sanity-check"
                      className="flex-1 cursor-pointer"
                    >
                      <span className="font-medium text-lg">Sanity Check</span>
                      <p className="mt-1 text-muted-foreground text-sm">
                        Spot check the scores look accurate for the given test
                        conversations and evals. Useful to iterate on the evals.
                      </p>
                    </Label>
                  </div>
                </div>
                <div
                  className={cn(
                    "rounded-lg border-2 p-4 transition-all",
                    mode === "test-prompt"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300",
                  )}
                >
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem
                      value="test-prompt"
                      id="test-prompt"
                      className="mt-1"
                    />
                    <Label
                      htmlFor="test-prompt"
                      className="flex-1 cursor-pointer"
                    >
                      <span className="font-medium text-lg">Test Prompt</span>
                      <p className="mt-1 text-muted-foreground text-sm">
                        Generates a new message with the active prompt, then
                        judges the conversation with the new message. Useful to
                        iterate on the prompt.
                      </p>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Current Prompt Configuration */}
      {mode === "test-prompt" && (
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader className="border-gray-100 border-b">
            <CardTitle className="text-gray-900">Current Prompt</CardTitle>
            <p className="text-muted-foreground text-sm">
              Will test this prompt against selected test cases
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {allPrompts.length > 0 ? (
                <div>
                  <Label
                    htmlFor="prompt-select"
                    className="font-medium text-sm"
                  >
                    Select Prompt to Test
                  </Label>
                  <Select
                    value={activePrompt?.id || ""}
                    onValueChange={(value) => {
                      const selectedPrompt = allPrompts.find(
                        (p) => p.id === value,
                      );
                      if (selectedPrompt) {
                        handlePromptSwitchRequest(selectedPrompt);
                      }
                    }}
                    disabled={isSwitchingPrompt}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Choose a prompt to test" />
                    </SelectTrigger>
                    <SelectContent>
                      {allPrompts.map((prompt) => (
                        <SelectItem key={prompt.id} value={prompt.id}>
                          <div className="space-y-1">
                            <div className="font-medium">{prompt.name}</div>
                            {prompt.description && (
                              <div className="text-muted-foreground text-xs">
                                {prompt.description.length > 100
                                  ? `${prompt.description.substring(0, 100)}...`
                                  : prompt.description}
                              </div>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isSwitchingPrompt && (
                    <p className="mt-2 text-muted-foreground text-sm">
                      Switching prompt...
                    </p>
                  )}
                </div>
              ) : (
                <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3">
                  <p className="font-medium text-sm text-yellow-800">
                    No Prompts Available
                  </p>
                  <p className="text-sm text-yellow-700">
                    Create prompts in the Prompt tab to test them here.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selection and Summary */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Test Case Selection */}
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader className="border-gray-100 border-b">
            <CardTitle className="text-gray-900">Test Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSelectedTestCaseIds(testCases.map((tc) => tc.id))
                  }
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTestCaseIds([])}
                >
                  Select None
                </Button>
              </div>
              <div className="max-h-48 space-y-2 overflow-y-auto">
                {testCases.map((testCase) => (
                  <div
                    key={testCase.id}
                    className="flex items-center space-x-2"
                  >
                    <input
                      type="checkbox"
                      id={`test-${testCase.id}`}
                      checked={selectedTestCaseIds.includes(testCase.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTestCaseIds((prev) => [
                            ...prev,
                            testCase.id,
                          ]);
                        } else {
                          setSelectedTestCaseIds((prev) =>
                            prev.filter((id) => id !== testCase.id),
                          );
                        }
                      }}
                      className="h-4 w-4"
                    />
                    <label
                      htmlFor={`test-${testCase.id}`}
                      className="cursor-pointer text-sm"
                    >
                      {testCase.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Eval Selection */}
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader className="border-gray-100 border-b">
            <CardTitle className="text-gray-900">Evaluation Criteria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedEvalIds(evals.map((e) => e.id))}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedEvalIds([])}
                >
                  Select None
                </Button>
              </div>
              <div className="max-h-48 space-y-2 overflow-y-auto">
                {evals.map((eval_) => (
                  <div key={eval_.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`eval-${eval_.id}`}
                      checked={selectedEvalIds.includes(eval_.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedEvalIds((prev) => [...prev, eval_.id]);
                        } else {
                          setSelectedEvalIds((prev) =>
                            prev.filter((id) => id !== eval_.id),
                          );
                        }
                      }}
                      className="h-4 w-4"
                    />
                    <label
                      htmlFor={`eval-${eval_.id}`}
                      className="cursor-pointer text-sm"
                    >
                      {eval_.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader className="border-gray-100 border-b">
            <CardTitle className="text-gray-900">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">
                    {selectedTestCaseIds.length} of {testCases.length}
                  </span>{" "}
                  test cases selected
                </p>
                <p className="text-sm">
                  <span className="font-medium">
                    {selectedEvalIds.length} of {evals.length}
                  </span>{" "}
                  evaluation criteria selected
                </p>
                {selectedEvalIds.length > 0 &&
                  selectedTestCaseIds.length > 0 && (
                    <p className="text-muted-foreground text-sm">
                      Will generate{" "}
                      {selectedTestCaseIds.length * selectedEvalIds.length}{" "}
                      evaluations
                      {mode === "test-prompt" && " (with new AI responses)"}
                    </p>
                  )}
              </div>

              {/* Warnings */}
              {selectedEvalIds.length === 0 && (
                <p className="rounded bg-red-50 p-2 text-red-600 text-sm">
                  No evaluation criteria selected. Select at least one.
                </p>
              )}
              {selectedTestCaseIds.length === 0 && (
                <p className="rounded bg-red-50 p-2 text-red-600 text-sm">
                  No test cases selected. Select at least one.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Run Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleRunEvaluation}
          disabled={
            isRunning ||
            isSwitchingPrompt ||
            selectedEvalIds.length === 0 ||
            selectedTestCaseIds.length === 0 ||
            (mode === "test-prompt" &&
              (!activePrompt || allPrompts.length === 0))
          }
          size="lg"
          className="min-w-64"
        >
          {isRunning ? (
            <>
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              {progress
                ? `${progress.current}/${progress.total}: ${progress.currentTestCase}`
                : "Running..."}
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Run Evaluation
            </>
          )}
        </Button>
      </div>

      {/* Saved Evaluation Tabs */}
      {evaluationTabs.length > 0 && (
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader className="border-gray-100 border-b">
            <CardTitle className="text-gray-900">Saved Evaluations</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="mb-4 flex flex-wrap gap-2">
              {evaluationTabs.map((tab) => (
                <div
                  key={tab.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 transition-all",
                    activeTabId === tab.id
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100",
                  )}
                  onClick={() => setActiveTabId(tab.id)}
                >
                  <span className="font-medium text-sm">{tab.name}</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      activeTabId === tab.id
                        ? "border-gray-400 text-gray-300"
                        : "",
                    )}
                  >
                    {tab.mode === "test-prompt" ? "Prompt" : "Sanity"}
                  </Badge>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTab(tab.id);
                    }}
                    className={cn(
                      "ml-1 rounded p-0.5 hover:bg-gray-200",
                      activeTabId === tab.id ? "hover:bg-gray-700" : "",
                    )}
                  >
                    <XIcon className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Show active tab results */}
            {activeTab && (
              <div className="space-y-4">
                <div className="text-gray-500 text-sm">
                  {activeTab.promptName && (
                    <span>
                      Prompt: <strong>{activeTab.promptName}</strong> •{" "}
                    </span>
                  )}
                  {activeTab.results.length} test cases •{" "}
                  {new Date(activeTab.createdAt).toLocaleTimeString()}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border-b p-2 text-left text-gray-700">
                          Test Case
                        </th>
                        {evals
                          .filter((e) => selectedEvalIds.includes(e.id))
                          .map((eval_) => (
                            <th
                              key={eval_.id}
                              className="min-w-20 border-b p-2 text-center text-gray-700"
                            >
                              {eval_.name}
                            </th>
                          ))}
                        <th className="border-b p-2 text-center text-gray-700">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeTab.results.map((result) => (
                        <tr key={result.testCase.id} className="border-b">
                          <td className="p-2 font-medium text-gray-900">
                            {result.testCase.name}
                          </td>
                          {evals
                            .filter((e) => selectedEvalIds.includes(e.id))
                            .map((eval_) => {
                              const score = result.scores[eval_.name];
                              return (
                                <td key={eval_.id} className="p-2 text-center">
                                  {score ? (
                                    <Badge
                                      className={cn(
                                        "cursor-pointer",
                                        getScoreColor(score.score),
                                      )}
                                    >
                                      {score.score}/10
                                    </Badge>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                              );
                            })}
                          <td className="p-2 text-center">
                            {result.success ? (
                              <CheckCircle2 className="mx-auto h-4 w-4 text-green-600" />
                            ) : (
                              <AlertCircle className="mx-auto h-4 w-4 text-red-600" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results.length > 0 && (
        <Card className="border-gray-200 bg-white shadow-sm">
          <CardHeader className="border-gray-100 border-b">
            <CardTitle className="text-gray-900">Latest Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Results Matrix */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border-b p-2 text-left">Test Case</th>
                      {evals
                        .filter((e) => selectedEvalIds.includes(e.id))
                        .map((eval_) => (
                          <th
                            key={eval_.id}
                            className="min-w-20 border-b p-2 text-center"
                          >
                            <button
                              onClick={() => handleCriteriaClick(eval_)}
                              className="cursor-pointer hover:text-blue-600 hover:underline"
                            >
                              {eval_.name}
                            </button>
                          </th>
                        ))}
                      {mode === "test-prompt" && (
                        <th className="border-b p-2 text-center">Response</th>
                      )}
                      <th className="border-b p-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result) => (
                      <tr key={result.testCase.id} className="border-b">
                        <td className="p-2 font-medium">
                          <button
                            onClick={() => handleTestCaseClick(result.testCase)}
                            className="cursor-pointer hover:text-blue-600 hover:underline"
                          >
                            {result.testCase.name}
                          </button>
                          {result.testCase.category && (
                            <Badge variant="secondary" className="ml-2">
                              {result.testCase.category}
                            </Badge>
                          )}
                          {result.isTransfer && (
                            <Badge
                              variant="outline"
                              className="ml-2 border-blue-300 text-blue-700"
                            >
                              Transferred
                            </Badge>
                          )}
                        </td>
                        {evals
                          .filter((e) => selectedEvalIds.includes(e.id))
                          .map((eval_) => {
                            const score = result.scores[eval_.name];
                            return (
                              <td key={eval_.id} className="p-2 text-center">
                                {result.isTransfer ? (
                                  <span className="text-muted-foreground">
                                    -
                                  </span>
                                ) : score ? (
                                  <Badge
                                    className={cn(
                                      "cursor-pointer",
                                      getScoreColor(score.score),
                                    )}
                                    onClick={() =>
                                      handleScoreClick(
                                        result.testCase,
                                        eval_.name,
                                        score.score,
                                        score.reasoning,
                                      )
                                    }
                                  >
                                    {score.score}/10
                                  </Badge>
                                ) : (
                                  <span className="text-muted-foreground">
                                    -
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        {mode === "test-prompt" && (
                          <td className="p-2 text-center">
                            {result.generatedResponse ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleResponseClick(
                                    result.testCase,
                                    result.activePrompt?.name ||
                                      "Unknown Prompt",
                                    result.generatedResponse || "",
                                  )
                                }
                              >
                                View Response
                              </Button>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                        )}
                        <td className="p-2 text-center">
                          {result.success ? (
                            <CheckCircle2 className="mx-auto h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="mx-auto h-4 w-4 text-red-600" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Errors */}
              {results.some((r) => !r.success) && (
                <div className="space-y-2">
                  <h4 className="font-medium text-red-600">Errors</h4>
                  {results
                    .filter((r) => !r.success)
                    .map((result) => (
                      <div
                        key={result.testCase.id}
                        className="rounded-md border border-red-200 bg-red-50 p-3"
                      >
                        <p className="font-medium text-red-800">
                          {result.testCase.name}
                        </p>
                        <p className="text-red-700 text-sm">{result.error}</p>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Score Reasoning Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Score Details: {modalData?.evalName}</DialogTitle>
            <DialogDescription>
              Test Case: {modalData?.testCase}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="font-medium">Score:</span>
              <Badge
                className={modalData ? getScoreColor(modalData.score) : ""}
              >
                {modalData?.score}/10
              </Badge>
            </div>
            <div>
              <span className="font-medium">Reasoning:</span>
              <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                {modalData?.reasoning}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Generated Response Modal */}
      <Dialog open={responseModalOpen} onOpenChange={setResponseModalOpen}>
        <DialogContent className="max-h-[80vh] max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Generated Response: {responseModalData?.promptName}
            </DialogTitle>
            <DialogDescription>
              Test Case: {responseModalData?.testCase}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <div className="h-96 overflow-y-auto rounded-md border bg-muted/50 p-4">
              <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                {responseModalData?.response}
              </pre>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Test Case Conversation Modal */}
      <Dialog
        open={conversationModalOpen}
        onOpenChange={setConversationModalOpen}
      >
        <DialogContent className="max-h-[80vh] max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Test Case: {conversationModalData?.testCase.name}
            </DialogTitle>
            <DialogDescription>
              {conversationModalData?.testCase.description && (
                <span>{conversationModalData.testCase.description}</span>
              )}
              {conversationModalData?.testCase.category && (
                <span className="ml-2 text-blue-600">
                  Category: {conversationModalData.testCase.category}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <div className="h-96 space-y-3 overflow-y-auto p-4">
              {conversationModalData?.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <div className="mb-1 font-medium text-xs opacity-75">
                      {message.role === "user" ? "User" : "Assistant"}
                    </div>
                    <div className="whitespace-pre-wrap text-sm">
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}
              {(!conversationModalData?.messages ||
                conversationModalData.messages.length === 0) && (
                <div className="flex h-32 items-center justify-center text-gray-500">
                  No messages in this conversation
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Evaluation Criteria Modal */}
      <Dialog open={criteriaModalOpen} onOpenChange={setCriteriaModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Evaluation Criteria: {criteriaModalData?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="max-h-96 overflow-y-auto">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {criteriaModalData?.description}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Prompt Switch Confirmation Modal */}
      <Dialog
        open={promptSwitchModalOpen}
        onOpenChange={setPromptSwitchModalOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Switch Active Prompt?</DialogTitle>
            <DialogDescription>
              You're about to switch from "{activePrompt?.name || "No prompt"}"
              to "{selectedPromptForSwitch?.name}".
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2 text-muted-foreground text-sm">
              <p>
                This will change which prompt is used for future Test Prompt
                evaluations.
              </p>
              <p>
                Current results will be preserved, but new evaluations will use
                the selected prompt.
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setPromptSwitchModalOpen(false);
                  setSelectedPromptForSwitch(null);
                }}
                disabled={isSwitchingPrompt}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePromptSwitchConfirm}
                disabled={isSwitchingPrompt}
              >
                {isSwitchingPrompt ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Switching...
                  </>
                ) : (
                  "Switch Prompt"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
