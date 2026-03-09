import { getPromptsAction } from "../../actions";
import { PromptManager } from "./prompt-manager";

export default async function PromptPage() {
  const prompts = await getPromptsAction();

  return <PromptManager initialPrompts={prompts} />;
}
