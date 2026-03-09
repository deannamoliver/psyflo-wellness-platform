import { PlusIcon } from "lucide-react";
import { Card } from "@/lib/core-ui/card";
import { H3, P } from "@/lib/core-ui/typography";

export default function AgentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <H3>Agentic Testing Management</H3>
          <P className="text-muted-foreground">
            Test and interact with the AI agent to validate responses and
            behavior.
          </P>
        </div>
      </div>

      <Card className="flex h-[calc(100vh-20rem)] flex-col items-center justify-center rounded-lg border p-8">
        <div className="max-w-md text-center">
          <div className="mb-6">
            <h1 className="mb-4 font-bold text-2xl">
              Welcome to Agent Testing
            </h1>
            <p className="text-muted-foreground">
              To get started, choose one of the options below:
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500">
                  <PlusIcon className="h-3 w-3 text-white" />
                </div>
                <h3 className="font-medium text-blue-900 dark:text-blue-100">
                  Create New Session
                </h3>
              </div>
              <p className="text-blue-700 text-sm dark:text-blue-300">
                Click the <strong>+</strong> button in the sidebar to start a
                new test conversation.
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-500">
                  <span className="font-bold text-white text-xs">←</span>
                </div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  Select Existing
                </h3>
              </div>
              <p className="text-gray-700 text-sm dark:text-gray-300">
                Choose a previous test session from the sidebar to continue
                testing.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
