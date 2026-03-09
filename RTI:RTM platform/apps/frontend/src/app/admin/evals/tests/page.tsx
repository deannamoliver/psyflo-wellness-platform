import { getTestCasesWithLastMessageAction } from "../../actions";
import { TestManager } from "./test-manager";

export default async function TestsPage() {
  const testCases = await getTestCasesWithLastMessageAction();

  return <TestManager initialTestCases={testCases} />;
}
